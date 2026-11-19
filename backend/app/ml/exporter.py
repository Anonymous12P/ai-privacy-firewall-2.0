"""Export validated ML partitions and integrity manifests as CSV and Parquet."""

import csv
import hashlib
import json
import logging
import re
import tempfile
from collections.abc import Callable
from pathlib import Path

import pyarrow as pa
from pyarrow import parquet

from app.core.constants import APP_LOGGER_NAME
from app.ml.exceptions import MLExportError
from app.ml.metadata import reproducibility_payload
from app.ml.schemas import (
    MLDataset,
    MLExportArtifact,
    MLExportResult,
    MLReproducibilityMetadata,
    PreprocessedSplitResult,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.exporter")
_SAFE_DATASET_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
_PARTITIONS = ("train", "validation", "test")


class MLExporter:
    """Write all prepared partitions and reports to an ML output directory."""

    def __init__(self, output_directory: Path | None = None) -> None:
        """Create an exporter rooted at ``backend/data/ml`` by default."""
        self.output_directory = output_directory or (
            Path(__file__).resolve().parents[2] / "data" / "ml"
        )

    def export(
        self,
        prepared: PreprocessedSplitResult,
        metadata: MLReproducibilityMetadata,
    ) -> MLExportResult:
        """Write six datasets, metadata, summary, and a hash manifest."""
        if not _SAFE_DATASET_NAME.fullmatch(metadata.dataset_name):
            raise MLExportError(
                "Dataset name must contain only letters, digits, dots, "
                "underscores, or hyphens and begin with a letter or digit."
            )
        try:
            self.output_directory.mkdir(parents=True, exist_ok=True)
            (self.output_directory / "ml_manifest.json").unlink(missing_ok=True)
        except OSError as exc:
            raise MLExportError(
                f"Unable to create ML output directory {self.output_directory}: {exc}"
            ) from exc

        datasets = {
            "train": prepared.train,
            "validation": prepared.validation,
            "test": prepared.test,
        }
        generated_paths: list[Path] = []
        all_rows = {name: self._rows(dataset) for name, dataset in datasets.items()}
        arrow_table = self._arrow_table(
            prepared.train.feature_names,
            prepared.train.label_name,
            all_rows,
        )
        offsets: dict[str, int] = {}
        current_offset = 0
        for partition in _PARTITIONS:
            offsets[partition] = current_offset
            current_offset += len(datasets[partition].records)

        try:
            for partition in _PARTITIONS:
                csv_path = self.output_directory / (
                    f"{metadata.dataset_name}_{partition}.csv"
                )
                parquet_path = self.output_directory / (
                    f"{metadata.dataset_name}_{partition}.parquet"
                )
                partition_rows = all_rows[partition]
                start = offsets[partition]
                row_count = len(datasets[partition].records)

                def write_csv_file(
                    temporary_path: Path,
                    rows: list[tuple[object, ...]] = partition_rows,
                ) -> None:
                    self._write_csv(
                        temporary_path,
                        prepared.train.feature_names,
                        prepared.train.label_name,
                        rows,
                    )

                def write_parquet_file(
                    temporary_path: Path,
                    offset: int = start,
                    count: int = row_count,
                ) -> None:
                    parquet.write_table(
                        arrow_table.slice(offset, count),
                        temporary_path,
                        compression="NONE",
                        version="2.6",
                    )

                self._write_atomically(csv_path, write_csv_file)
                self._write_atomically(parquet_path, write_parquet_file)
                generated_paths.extend((csv_path, parquet_path))

            metadata_path = self.output_directory / "ml_metadata.json"

            def write_metadata_file(temporary_path: Path) -> None:
                temporary_path.write_text(
                    json.dumps(
                        reproducibility_payload(metadata),
                        ensure_ascii=False,
                        allow_nan=False,
                        sort_keys=True,
                        indent=2,
                    )
                    + "\n",
                    encoding="utf-8",
                    newline="",
                )

            self._write_atomically(metadata_path, write_metadata_file)
            generated_paths.append(metadata_path)

            summary_path = self.output_directory / "ml_summary.md"
            summary = self._summary(prepared, metadata, generated_paths)

            def write_summary_file(temporary_path: Path) -> None:
                temporary_path.write_text(
                    summary,
                    encoding="utf-8",
                    newline="",
                )

            self._write_atomically(summary_path, write_summary_file)
            generated_paths.append(summary_path)

            payload_artifacts = tuple(self._artifact(path) for path in generated_paths)
            manifest_path = self.output_directory / "ml_manifest.json"
            manifest = {
                "schema_version": 1,
                "dataset_name": metadata.dataset_name,
                "source_sha256": metadata.source_sha256,
                "reproducibility_fingerprint": metadata.fingerprint,
                "artifacts": [
                    {
                        "filename": artifact.filename,
                        "sha256": artifact.sha256,
                        "size_bytes": artifact.size_bytes,
                    }
                    for artifact in payload_artifacts
                ],
            }
            self._write_atomically(
                manifest_path,
                lambda temporary: temporary.write_text(
                    json.dumps(
                        manifest,
                        ensure_ascii=False,
                        allow_nan=False,
                        sort_keys=True,
                        indent=2,
                    )
                    + "\n",
                    encoding="utf-8",
                    newline="",
                ),
            )
            generated_paths.append(manifest_path)
        except (OSError, pa.ArrowException, ValueError, TypeError) as exc:
            logger.exception("ML artifact export failed")
            raise MLExportError(f"Unable to export ML artifacts: {exc}") from exc

        artifacts = tuple(self._artifact(path) for path in generated_paths)
        logger.info(
            "ML artifacts exported: directory=%s, artifact_count=%d, fingerprint=%s",
            self.output_directory,
            len(artifacts),
            metadata.fingerprint,
        )
        return MLExportResult(
            output_directory=self.output_directory,
            artifacts=artifacts,
            manifest_path=manifest_path,
        )

    @staticmethod
    def _rows(dataset: MLDataset) -> list[tuple[object, ...]]:
        """Build rows with feature order followed by the optional target."""
        return [
            (
                *record.values,
                *((record.label,) if dataset.label_name is not None else ()),
            )
            for record in dataset.records
        ]

    @staticmethod
    def _arrow_table(
        feature_names: tuple[str, ...],
        target_name: str | None,
        rows_by_partition: dict[str, list[tuple[object, ...]]],
    ) -> pa.Table:
        """Create one common Arrow schema for consistent partition exports."""
        names = (*feature_names, *((target_name,) if target_name is not None else ()))
        combined_rows = [
            row for partition in _PARTITIONS for row in rows_by_partition[partition]
        ]
        columns = {
            name: [row[index] for row in combined_rows]
            for index, name in enumerate(names)
        }
        try:
            return pa.table(columns)
        except (pa.ArrowException, TypeError) as exc:
            raise MLExportError(
                f"Prepared data cannot be represented in Parquet: {exc}"
            ) from exc

    @staticmethod
    def _write_csv(
        path: Path,
        feature_names: tuple[str, ...],
        target_name: str | None,
        rows: list[tuple[object, ...]],
    ) -> None:
        """Write a deterministic UTF-8 CSV without platform-specific newlines."""
        column_names = (
            *feature_names,
            *((target_name,) if target_name is not None else ()),
        )
        with path.open("w", encoding="utf-8", newline="") as csv_file:
            writer = csv.writer(csv_file, lineterminator="\n")
            writer.writerow(column_names)
            writer.writerows(rows)

    @staticmethod
    def _write_atomically(destination: Path, writer: Callable[[Path], object]) -> None:
        """Write to a sibling temporary file and replace the destination."""
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                dir=destination.parent,
                prefix=f".{destination.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
            writer(temporary_path)
            temporary_path.replace(destination)
        finally:
            if temporary_path is not None and temporary_path.exists():
                temporary_path.unlink()

    @staticmethod
    def _artifact(path: Path) -> MLExportArtifact:
        """Describe a completed artifact with its SHA-256 and byte size."""
        try:
            return MLExportArtifact(
                filename=path.name,
                path=path,
                sha256=_sha256_file(path),
                size_bytes=path.stat().st_size,
            )
        except OSError as exc:
            raise MLExportError(
                f"Unable to hash exported artifact {path}: {exc}"
            ) from exc

    @staticmethod
    def _summary(
        prepared: PreprocessedSplitResult,
        metadata: MLReproducibilityMetadata,
        artifact_paths: list[Path],
    ) -> str:
        """Render a stable human-readable overview of preparation outputs."""
        lines = [
            "# ML Dataset Preparation Summary",
            "",
            f"- Dataset: `{metadata.dataset_name}`",
            f"- Source SHA-256: `{metadata.source_sha256}`",
            f"- Reproducibility fingerprint: `{metadata.fingerprint}`",
            f"- Target column: `{metadata.target_column or 'none'}`",
            f"- Feature columns: {len(metadata.feature_names)}",
            f"- Scaling: `{metadata.preprocessing_strategy}`",
            f"- Balancing: `{metadata.balancing_strategy}`",
            "",
            "## Prepared partitions",
            "",
            "| Partition | Rows | Columns |",
            "|---|---:|---:|",
        ]
        for name, dataset in (
            ("Train", prepared.train),
            ("Validation", prepared.validation),
            ("Test", prepared.test),
        ):
            column_count = len(dataset.feature_names) + int(
                dataset.label_name is not None
            )
            lines.append(f"| {name} | {len(dataset.records)} | {column_count} |")
        lines.extend(("", "## Exported files", ""))
        lines.extend(f"- `{path.name}`" for path in artifact_paths)
        lines.extend(("- `ml_summary.md`", "- `ml_manifest.json`"))
        lines.extend(
            (
                "",
                (
                    "The manifest contains hashes for every data and report artifact. "
                    "Its own hash is returned by the pipeline result because a "
                    "manifest cannot include its own stable SHA-256."
                ),
                "",
            )
        )
        return "\n".join(lines)


def _sha256_file(path: Path) -> str:
    """Hash a file using bounded-memory reads."""
    digest = hashlib.sha256()
    with path.open("rb") as artifact_file:
        for chunk in iter(lambda: artifact_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()
