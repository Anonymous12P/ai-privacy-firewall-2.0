"""JSON and Markdown reports for dataset inventory and statistics."""

import json
import logging
import os
import tempfile
from dataclasses import asdict
from pathlib import Path

from app.core.config import get_settings
from app.core.constants import APP_LOGGER_NAME
from app.dataset_inventory.exceptions import DatasetDirectoryError
from app.dataset_inventory.schemas import (
    DatasetInventoryResult,
    DatasetStatisticsResult,
)

logger: logging.Logger = logging.getLogger(
    f"{APP_LOGGER_NAME}.dataset_inventory.report_generator"
)


class DatasetReportGenerator:
    """Write evidence-based inventory and statistics reports to interim storage."""

    def __init__(
        self,
        output_dir: Path | None = None,
    ) -> None:
        """Initialize the report destination from settings or an explicit path."""
        settings = get_settings()
        self.output_dir = (
            output_dir if output_dir is not None else settings.interim_data_dir
        ).expanduser()

    def generate(
        self,
        inventory: DatasetInventoryResult,
        statistics: DatasetStatisticsResult,
    ) -> tuple[Path, Path, Path]:
        """Generate inventory JSON, statistics JSON, and the summary Markdown."""
        if inventory.dataset_root != statistics.dataset_root:
            raise DatasetDirectoryError(
                "Inventory and statistics must describe the same dataset root."
            )
        self._validate_output_directory(inventory.dataset_root)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        inventory_path = self.output_dir / "dataset_inventory.json"
        statistics_path = self.output_dir / "dataset_statistics.json"
        summary_path = self.output_dir / "dataset_summary.md"

        self._write_json(inventory_path, self._inventory_payload(inventory))
        self._write_json(statistics_path, self._statistics_payload(statistics))
        self._write_text(summary_path, self._markdown(inventory, statistics))
        logger.info(
            "Dataset reports generated: inventory=%s, statistics=%s, summary=%s",
            inventory_path,
            statistics_path,
            summary_path,
        )
        return inventory_path, statistics_path, summary_path

    def _validate_output_directory(self, dataset_root: Path) -> None:
        """Reject report destinations inside the source dataset directory."""
        resolved_output = self.output_dir.resolve()
        resolved_dataset = dataset_root.resolve()
        try:
            resolved_output.relative_to(resolved_dataset)
        except ValueError:
            return
        raise DatasetDirectoryError(
            "Dataset reports must not be written inside the raw dataset directory."
        )

    @staticmethod
    def _inventory_payload(inventory: DatasetInventoryResult) -> dict[str, object]:
        """Create a JSON-safe representation of the inventory."""
        return {
            "dataset_root": str(inventory.dataset_root),
            "scanned_at": inventory.scanned_at.isoformat(),
            "file_count": len(inventory.files),
            "total_rows": inventory.total_rows,
            "total_size_bytes": inventory.total_size_bytes,
            "files": [
                {
                    **asdict(file_record),
                    "modified_at": file_record.modified_at.isoformat(),
                    "column_count": file_record.column_count,
                }
                for file_record in inventory.files
            ],
        }

    @staticmethod
    def _statistics_payload(
        statistics: DatasetStatisticsResult,
    ) -> dict[str, object]:
        """Create a JSON-safe representation of the computed statistics."""
        return {
            "dataset_root": str(statistics.dataset_root),
            "analyzed_at": statistics.analyzed_at.isoformat(),
            "file_count": len(statistics.files),
            "total_rows": statistics.total_rows,
            "total_columns": statistics.total_columns,
            "files": [asdict(file_statistics) for file_statistics in statistics.files],
        }

    @staticmethod
    def _markdown(
        inventory: DatasetInventoryResult,
        statistics: DatasetStatisticsResult,
    ) -> str:
        """Render a Markdown summary with explicit join-key limitations."""
        column_files: dict[str, set[str]] = {}
        for file_record in inventory.files:
            for column in file_record.columns:
                column_files.setdefault(column, set()).add(file_record.relative_path)
        potential_join_keys = sorted(
            column for column, paths in column_files.items() if len(paths) > 1
        )

        lines = [
            "# Dataset Analysis",
            "",
            "## Dataset Overview",
            "",
            f"- Dataset directory: `{inventory.dataset_root}`",
            f"- CSV files discovered: {len(inventory.files)}",
            f"- Total rows: {inventory.total_rows}",
            f"- Inventory generated: {inventory.scanned_at.isoformat()}",
            f"- Statistics generated: {statistics.analyzed_at.isoformat()}",
            "",
        ]
        if not inventory.files:
            lines.extend(
                [
                    (
                        "No CSV files were found. No dataset statistics or "
                        "CERT-specific conclusions are available."
                    ),
                    "",
                ]
            )

        lines.extend(
            [
                "## Folder Structure",
                "",
                "```text",
                "backend/data/",
                "|-- raw/cert_r4.2/      # Original authorized source files (read-only)",
                "|-- interim/            # Inventory and analysis reports",
                "|-- processed/          # Reserved; not used by this analysis",
                "`-- external/           # Reserved for external reference data",
                "```",
                "",
                "## Files",
                "",
                "| File | Relative path | Size (bytes) | Rows | Columns | Encoding | Delimiter | SHA-256 |",
                "|---|---|---:|---:|---:|---|---|---|",
            ]
        )
        if inventory.files:
            for file_record in inventory.files:
                lines.append(
                    "| "
                    + " | ".join(
                        (
                            file_record.filename,
                            file_record.relative_path,
                            str(file_record.size_bytes),
                            str(file_record.rows),
                            str(file_record.column_count),
                            file_record.encoding,
                            repr(file_record.delimiter),
                            file_record.sha256,
                        )
                    )
                    + " |"
                )
        else:
            lines.append("| - | No CSV files found | 0 | 0 | 0 | - | - | - |")

        lines.extend(["", "## Rows", ""])
        if inventory.files:
            for file_record in inventory.files:
                lines.append(f"- `{file_record.relative_path}`: {file_record.rows}")
        else:
            lines.append("- No rows available.")

        lines.extend(["", "## Columns", ""])
        if inventory.files:
            for file_record in inventory.files:
                column_names = ", ".join(f"`{name}`" for name in file_record.columns)
                lines.append(
                    f"- `{file_record.relative_path}` "
                    f"({file_record.column_count}): {column_names}"
                )
        else:
            lines.append("- No columns available.")

        lines.extend(
            [
                "",
                "## Potential Join Keys",
                "",
                (
                    "Shared header names are candidates only; value-level key "
                    "uniqueness and referential integrity were not tested."
                ),
            ]
        )
        lines.extend(
            [f"- `{column}`" for column in potential_join_keys]
            if potential_join_keys
            else ["- None identified from shared headers."]
        )

        lines.extend(["", "## Data Types", ""])
        if statistics.files:
            for item in statistics.files:
                lines.append(f"### `{item.relative_path}`")
                lines.append("")
                lines.append(f"- Numeric: {', '.join(item.numeric_columns) or 'None'}")
                lines.append(f"- Date: {', '.join(item.date_columns) or 'None'}")
                lines.append(
                    f"- Categorical: {', '.join(item.categorical_columns) or 'None'}"
                )
                lines.append("")
        else:
            lines.append("No data types available.")
            lines.append("")

        lines.extend(["## Missing Values", ""])
        if statistics.files:
            for item in statistics.files:
                missing = ", ".join(
                    f"`{column}`: {count}"
                    for column, count in item.missing_values.items()
                )
                lines.append(f"- `{item.relative_path}`: {missing or 'No columns'}")
        else:
            lines.append("No missing-value analysis available.")

        lines.extend(["", "## Duplicate Counts", ""])
        if statistics.files:
            for item in statistics.files:
                lines.append(f"- `{item.relative_path}`: {item.duplicate_rows}")
        else:
            lines.append("No duplicate analysis available.")

        lines.extend(["", "## Memory Estimates", ""])
        if statistics.files:
            for item in statistics.files:
                lines.append(
                    f"- `{item.relative_path}`: approximately "
                    f"{item.memory_estimate_bytes:,} bytes for parsed row values."
                )
        else:
            lines.append("No memory estimate available.")
        lines.extend(
            [
                "",
                (
                    "Estimates are sampled Python object-size extrapolations, "
                    "not a promise of process peak memory. Duplicate detection "
                    "retains row fingerprints proportional to the number of "
                    "distinct rows."
                ),
                "",
            ]
        )
        return "\n".join(lines)

    @staticmethod
    def _write_json(destination: Path, payload: dict[str, object]) -> None:
        """Atomically write one JSON report."""
        text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
        DatasetReportGenerator._write_text(destination, text)

    @staticmethod
    def _write_text(destination: Path, text: str) -> None:
        """Atomically write UTF-8 report text without exposing partial files."""
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=destination.parent,
                prefix=f".{destination.name}.",
                suffix=".tmp",
                delete=False,
                newline="\n",
            ) as temporary_file:
                temporary_path = Path(temporary_file.name)
                temporary_file.write(text)
                temporary_file.flush()
                os.fsync(temporary_file.fileno())
            temporary_path.replace(destination)
        except OSError:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)
            raise
