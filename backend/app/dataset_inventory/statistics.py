"""Streaming, non-mutating statistics for inventoried CSV files."""

import hashlib
import json
import logging
import math
import sqlite3
import sys
import tempfile
from datetime import date, datetime
from pathlib import Path

from app.core.config import get_settings
from app.core.constants import APP_LOGGER_NAME
from app.dataset_inventory.exceptions import (
    DatasetCSVError,
    DatasetFileChangedError,
)
from app.dataset_inventory.scanner import DatasetScanner
from app.dataset_inventory.schemas import (
    DatasetFileRecord,
    DatasetInventoryResult,
    DatasetStatisticsResult,
    FileDatasetStatistics,
)

logger: logging.Logger = logging.getLogger(
    f"{APP_LOGGER_NAME}.dataset_inventory.statistics"
)
MEMORY_SAMPLE_ROWS = 1000


class DatasetStatistics:
    """Inspect CSV columns and rows without cleaning or transforming data."""

    def __init__(
        self,
        scanner: DatasetScanner,
        scratch_dir: Path | None = None,
    ) -> None:
        """Initialize statistics with the scanner that produced inventory data."""
        self.scanner = scanner
        self.scratch_dir = (
            scratch_dir
            if scratch_dir is not None
            else get_settings().interim_data_dir
        ).expanduser()

    def calculate(
        self,
        inventory: DatasetInventoryResult,
    ) -> DatasetStatisticsResult:
        """Calculate per-file row, type, missing, duplicate, and memory metrics."""
        if inventory.dataset_root != self.scanner.dataset_dir.resolve():
            raise DatasetFileChangedError(
                "Statistics scanner root does not match the inventory root."
            )
        logger.info(
            "Dataset statistics started: directory=%s, files=%d",
            inventory.dataset_root,
            len(inventory.files),
        )
        if inventory.files:
            self.scratch_dir.mkdir(parents=True, exist_ok=True)
            file_statistics = self._calculate_files(inventory)
        else:
            file_statistics = ()
        result = DatasetStatisticsResult(
            dataset_root=inventory.dataset_root,
            files=file_statistics,
        )
        logger.info(
            "Dataset statistics completed: files=%d, rows=%d",
            len(result.files),
            result.total_rows,
        )
        return result

    def _calculate_files(
        self,
        inventory: DatasetInventoryResult,
    ) -> tuple[FileDatasetStatistics, ...]:
        """Calculate file metrics with disk-backed duplicate fingerprints."""
        with tempfile.TemporaryDirectory(
            prefix=".dataset-inventory-",
            dir=self.scratch_dir,
        ) as temporary_directory:
            database_path = Path(temporary_directory) / "duplicate-index.sqlite3"
            connection = sqlite3.connect(database_path)
            try:
                connection.execute("PRAGMA journal_mode = OFF")
                connection.execute("PRAGMA synchronous = OFF")
                connection.execute("PRAGMA cache_size = -32768")
                connection.execute(
                    "CREATE TABLE row_fingerprints "
                    "(fingerprint BLOB PRIMARY KEY) WITHOUT ROWID"
                )
                results: list[FileDatasetStatistics] = []
                for file_record in inventory.files:
                    connection.execute("DELETE FROM row_fingerprints")
                    connection.commit()
                    connection.execute("BEGIN")
                    results.append(
                        self._calculate_file(file_record, connection)
                    )
                    connection.commit()
            finally:
                if connection.in_transaction:
                    connection.rollback()
                connection.close()
        return tuple(results)

    def _calculate_file(
        self,
        file_record: DatasetFileRecord,
        connection: sqlite3.Connection,
    ) -> FileDatasetStatistics:
        """Accumulate bounded per-column values while streaming one CSV."""
        headers = file_record.columns
        missing_counts = {header: 0 for header in headers}
        non_missing_counts = {header: 0 for header in headers}
        numeric_counts = {header: 0 for header in headers}
        date_counts = {header: 0 for header in headers}
        duplicate_rows = 0
        row_count = 0
        sampled_row_bytes = 0
        sampled_rows = 0

        for row in self.scanner.iter_rows(file_record):
            if len(row) > len(headers):
                raise DatasetCSVError(
                    f"CSV row contains more fields than its header: "
                    f"{file_record.relative_path}"
                )
            normalized_row = tuple(
                row[index] if index < len(row) else ""
                for index in range(len(headers))
            )
            row_count += 1
            fingerprint = hashlib.sha256(
                json.dumps(
                    normalized_row,
                    ensure_ascii=False,
                    separators=(",", ":"),
                ).encode("utf-8")
            ).digest()
            cursor = connection.execute(
                "INSERT OR IGNORE INTO row_fingerprints (fingerprint) VALUES (?)",
                (fingerprint,),
            )
            if cursor.rowcount == 0:
                duplicate_rows += 1

            if sampled_rows < MEMORY_SAMPLE_ROWS:
                sampled_rows += 1
                sampled_row_bytes += sys.getsizeof(normalized_row) + sum(
                    sys.getsizeof(value) for value in normalized_row
                )
            for header, value in zip(headers, normalized_row):
                stripped = value.strip()
                if not stripped:
                    missing_counts[header] += 1
                    continue
                non_missing_counts[header] += 1
                if self._is_numeric(stripped):
                    numeric_counts[header] += 1
                if self._is_date(stripped):
                    date_counts[header] += 1

        if row_count != file_record.rows:
            raise DatasetFileChangedError(
                f"CSV row count changed after inventory: "
                f"{file_record.relative_path}"
            )

        numeric_columns: list[str] = []
        date_columns: list[str] = []
        categorical_columns: list[str] = []
        for header in headers:
            count = non_missing_counts[header]
            if count and numeric_counts[header] == count:
                numeric_columns.append(header)
            elif count and date_counts[header] == count:
                date_columns.append(header)
            else:
                categorical_columns.append(header)

        average_row_bytes = (
            sampled_row_bytes / sampled_rows if sampled_rows else 0
        )
        memory_estimate = (
            sys.getsizeof(headers) + round(average_row_bytes * row_count)
        )
        return FileDatasetStatistics(
            relative_path=file_record.relative_path,
            row_count=row_count,
            column_count=len(headers),
            missing_values=missing_counts,
            duplicate_rows=duplicate_rows,
            memory_estimate_bytes=memory_estimate,
            date_columns=tuple(date_columns),
            categorical_columns=tuple(categorical_columns),
            numeric_columns=tuple(numeric_columns),
        )

    @staticmethod
    def _is_numeric(value: str) -> bool:
        """Return whether a non-empty string represents a finite number."""
        try:
            return math.isfinite(float(value))
        except ValueError:
            return False

    @staticmethod
    def _is_date(value: str) -> bool:
        """Return whether a value matches a conservative built-in date format."""
        normalized = value.strip()
        try:
            datetime.fromisoformat(normalized)
            return True
        except ValueError:
            pass
        try:
            date.fromisoformat(normalized)
            return True
        except ValueError:
            return False
