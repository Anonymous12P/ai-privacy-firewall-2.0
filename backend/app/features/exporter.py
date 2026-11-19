"""Deterministic CSV and Parquet export for validated encoded feature sets."""

import csv
import hashlib
import json
import logging
import os
import tempfile
from collections.abc import Mapping
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import FeatureExportError
from app.features.metadata import FeatureRunMetadata
from app.features.schemas import EncodedFeatureSet, FeatureExportResult
from app.features.validator import FeatureValidationSummary

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.exporter")

_CSV_FILE = "features.csv"
_PARQUET_FILE = "features.parquet"
_METADATA_FILE = "feature_metadata.json"
_SUMMARY_FILE = "feature_summary.md"
_MANIFEST_FILE = "pipeline_manifest.json"


class FeatureExporter:
    """Write all final feature artifacts under the requested processed folder."""

    def export(
        self,
        features: EncodedFeatureSet,
        metadata: FeatureRunMetadata,
        validation: FeatureValidationSummary,
        output_directory: Path | None = None,
    ) -> FeatureExportResult:
        """Export CSV, Parquet, metadata, summary, and a hash manifest."""
        selected_directory = output_directory or (
            Path(__file__).resolve().parents[2] / "data" / "processed"
        )
        try:
            selected_directory.mkdir(parents=True, exist_ok=True)
            csv_path = selected_directory / _CSV_FILE
            parquet_path = selected_directory / _PARQUET_FILE
            metadata_path = selected_directory / _METADATA_FILE
            summary_path = selected_directory / _SUMMARY_FILE
            manifest_path = selected_directory / _MANIFEST_FILE

            self._write_csv(csv_path, features)
            self._write_parquet(parquet_path, features)
            export_hashes = {
                _CSV_FILE: _sha256_file(csv_path),
                _PARQUET_FILE: _sha256_file(parquet_path),
            }
            metadata_payload = {
                **metadata.to_dict(),
                "artifacts": dict(sorted(export_hashes.items())),
            }
            self._write_text(
                metadata_path,
                _json_text(metadata_payload),
            )
            summary = _summary_markdown(
                features,
                metadata,
                validation,
                export_hashes,
            )
            self._write_text(summary_path, summary)

            files_to_hash = (
                (_CSV_FILE, csv_path),
                (_PARQUET_FILE, parquet_path),
                (_METADATA_FILE, metadata_path),
                (_SUMMARY_FILE, summary_path),
            )
            artifact_hashes = {name: _sha256_file(path) for name, path in files_to_hash}
            manifest = {
                "artifacts": [
                    {"filename": name, "sha256": artifact_hashes[name]}
                    for name in sorted(artifact_hashes)
                ],
                "feature_count": validation.column_count,
                "row_count": validation.row_count,
                "schema_version": 1,
            }
            self._write_text(manifest_path, _json_text(manifest))
            artifact_paths = {
                name: selected_directory / name
                for name in (
                    _CSV_FILE,
                    _PARQUET_FILE,
                    _METADATA_FILE,
                    _SUMMARY_FILE,
                    _MANIFEST_FILE,
                )
            }
            artifact_hashes[_MANIFEST_FILE] = _sha256_file(manifest_path)
        except (OSError, pa.ArrowException) as exc:
            logger.exception("Feature artifact export failed")
            raise FeatureExportError(
                f"Unable to export feature artifacts: {exc}"
            ) from exc

        logger.info(
            "Feature artifacts exported: directory=%s, artifacts=%d",
            selected_directory,
            len(artifact_paths),
        )
        return FeatureExportResult(
            output_directory=selected_directory,
            artifact_paths=artifact_paths,
            sha256=artifact_hashes,
        )

    @staticmethod
    def _write_csv(path: Path, features: EncodedFeatureSet) -> None:
        """Write UTF-8 CSV using stable column and record ordering."""
        temporary_path = _temporary_path(path)
        try:
            with temporary_path.open(
                "w",
                encoding="utf-8",
                newline="",
            ) as output_file:
                writer = csv.writer(output_file, lineterminator="\n")
                writer.writerow(
                    (
                        *features.feature_names,
                        *((features.target_column,) if features.target_column else ()),
                    )
                )
                for record in features.records:
                    writer.writerow(
                        (
                            *record.values,
                            *((record.label,) if features.target_column else ()),
                        )
                    )
            os.replace(temporary_path, path)
        finally:
            temporary_path.unlink(missing_ok=True)

    @staticmethod
    def _write_parquet(path: Path, features: EncodedFeatureSet) -> None:
        """Write a stable Arrow table with Float64 feature columns."""
        temporary_path = _temporary_path(path)
        try:
            columns: dict[str, pa.Array] = {
                name: pa.array(
                    [record.values[index] for record in features.records],
                    type=pa.float64(),
                )
                for index, name in enumerate(features.feature_names)
            }
            if features.target_column is not None:
                columns[features.target_column] = pa.array(
                    [record.label for record in features.records]
                )
            table = pa.table(columns)
            pq.write_table(
                table,
                temporary_path,
                compression="zstd",
                version="2.6",
                use_dictionary=False,
                write_statistics=True,
                row_group_size=max(len(features.records), 1),
            )
            os.replace(temporary_path, path)
        finally:
            temporary_path.unlink(missing_ok=True)

    @staticmethod
    def _write_text(path: Path, content: str) -> None:
        """Atomically write deterministic UTF-8 text with normalized newlines."""
        temporary_path = _temporary_path(path)
        try:
            temporary_path.write_text(content, encoding="utf-8", newline="\n")
            os.replace(temporary_path, path)
        finally:
            temporary_path.unlink(missing_ok=True)


def _temporary_path(destination: Path) -> Path:
    """Create a unique temporary sibling path for atomic artifact replacement."""
    with tempfile.NamedTemporaryFile(
        prefix=f".{destination.name}.",
        suffix=".tmp",
        dir=destination.parent,
        delete=False,
    ) as temporary_file:
        return Path(temporary_file.name)


def _sha256_file(path: Path) -> str:
    """Return a file's SHA-256 digest using bounded-memory reads."""
    digest = hashlib.sha256()
    with path.open("rb") as input_file:
        for chunk in iter(lambda: input_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _json_text(payload: Mapping[str, object]) -> str:
    """Serialize JSON using canonical key ordering and a trailing newline."""
    return f"{json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)}\n"


def _summary_markdown(
    features: EncodedFeatureSet,
    metadata: FeatureRunMetadata,
    validation: FeatureValidationSummary,
    hashes: Mapping[str, str],
) -> str:
    """Build a stable human-readable overview of exported features."""
    columns = "\n".join(f"- `{name}`" for name in features.feature_names)
    datasets = ", ".join(metadata.source_datasets) or "None"
    hash_rows = "\n".join(
        f"| `{name}` | `{digest}` |" for name, digest in sorted(hashes.items())
    )
    return (
        "# Feature Engineering Summary\n\n"
        "## Dataset Overview\n\n"
        f"- Source datasets: {datasets}\n"
        f"- Rows: {validation.row_count}\n"
        f"- Columns: {validation.column_count}\n"
        f"- Target column: {features.target_column or 'None'}\n"
        f"- Encoding strategy: {features.metadata.strategy}\n\n"
        "## Feature Columns\n\n"
        f"{columns or '- None'}\n\n"
        "## Exported Artifact SHA-256\n\n"
        "| Artifact | SHA-256 |\n|---|---|\n"
        f"{hash_rows}\n"
    )
