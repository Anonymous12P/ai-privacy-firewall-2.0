"""Streaming discovery and metadata collection for CSV files."""

import csv
import hashlib
import logging
from collections.abc import Iterator
from datetime import UTC, datetime
from pathlib import Path

from app.core.config import get_settings
from app.core.constants import APP_LOGGER_NAME
from app.dataset_inventory.exceptions import (
    DatasetCSVError,
    DatasetDirectoryError,
    DatasetEncodingError,
    DatasetFileChangedError,
    DatasetNotFoundError,
)
from app.dataset_inventory.schemas import DatasetFileRecord

logger: logging.Logger = logging.getLogger(
    f"{APP_LOGGER_NAME}.dataset_inventory.scanner"
)
SAMPLE_SIZE_BYTES = 64 * 1024
HASH_CHUNK_SIZE_BYTES = 1024 * 1024
SUPPORTED_DELIMITERS = ",\t;|"


class DatasetScanner:
    """Discover CSV files and inspect them using bounded-memory streaming."""

    def __init__(self, dataset_dir: Path | None = None) -> None:
        """Initialize the scanner with a directory or the configured CERT path."""
        settings = get_settings()
        self.dataset_dir = (
            dataset_dir
            if dataset_dir is not None
            else settings.raw_data_dir / "cert_r4.2"
        ).expanduser()

    def scan(self) -> tuple[DatasetFileRecord, ...]:
        """Recursively inventory CSV files without loading them into memory."""
        root = self._validate_directory()
        records: list[DatasetFileRecord] = []
        try:
            for candidate in sorted(root.rglob("*")):
                relative_parts = candidate.relative_to(root).parts
                if any(part.casefold() == "answers" for part in relative_parts):
                    continue
                if candidate.is_symlink():
                    if candidate.suffix.casefold() == ".csv":
                        raise DatasetDirectoryError(
                            f"Symbolic-link CSV files are not supported: "
                            f"{candidate}"
                        )
                    continue
                if candidate.is_file() and candidate.suffix.casefold() == ".csv":
                    records.append(self._scan_file(candidate, root))
        except OSError as exc:
            logger.exception("Unable to scan dataset directory %s", root)
            raise DatasetDirectoryError(
                f"Unable to scan dataset directory {root}: {exc}"
            ) from exc

        logger.info(
            "Dataset scan completed: directory=%s, csv_files=%d",
            root,
            len(records),
        )
        return tuple(records)

    def iter_rows(
        self,
        file_record: DatasetFileRecord,
    ) -> Iterator[tuple[str, ...]]:
        """Yield CSV records from disk while verifying the source is unchanged."""
        root = self._validate_directory()
        file_path = self._resolve_record_path(file_record, root)
        initial_stat = file_path.stat()
        if (
            initial_stat.st_size != file_record.size_bytes
            or self._modified_at(initial_stat.st_mtime) != file_record.modified_at
        ):
            raise DatasetFileChangedError(
                f"Dataset file changed after inventory: {file_record.relative_path}"
            )

        try:
            with file_path.open(
                mode="r",
                encoding=file_record.encoding,
                newline="",
            ) as csv_stream:
                reader = csv.reader(
                    csv_stream,
                    delimiter=file_record.delimiter,
                    strict=True,
                )
                header = next(reader, None)
                if header is None or tuple(header) != file_record.columns:
                    raise DatasetFileChangedError(
                        f"CSV header changed after inventory: "
                        f"{file_record.relative_path}"
                    )
                for row in reader:
                    yield tuple(row)
        except UnicodeError as exc:
            raise DatasetEncodingError(
                f"Unable to decode CSV file {file_record.relative_path} "
                f"using {file_record.encoding}."
            ) from exc
        except csv.Error as exc:
            raise DatasetCSVError(
                f"Unable to parse CSV file {file_record.relative_path}: {exc}"
            ) from exc

        final_stat = file_path.stat()
        if (
            final_stat.st_size != file_record.size_bytes
            or self._modified_at(final_stat.st_mtime) != file_record.modified_at
        ):
            raise DatasetFileChangedError(
                f"Dataset file changed while being read: {file_record.relative_path}"
            )

    def _validate_directory(self) -> Path:
        """Resolve and validate the configured dataset directory."""
        root = self.dataset_dir.resolve()
        if not root.exists():
            logger.error("Dataset directory does not exist: %s", root)
            raise DatasetNotFoundError(f"Dataset directory does not exist: {root}")
        if not root.is_dir():
            logger.error("Dataset path is not a directory: %s", root)
            raise DatasetDirectoryError(f"Dataset path is not a directory: {root}")
        return root

    def _scan_file(self, file_path: Path, root: Path) -> DatasetFileRecord:
        """Inspect a CSV's encoding, dialect, structure, hash, and filesystem info."""
        before = file_path.stat()
        encoding = self._detect_encoding(file_path)
        delimiter = self._detect_delimiter(file_path, encoding)
        try:
            with file_path.open(mode="r", encoding=encoding, newline="") as stream:
                reader = csv.reader(stream, delimiter=delimiter, strict=True)
                header = next(reader, None)
                if not header or not any(name.strip() for name in header):
                    raise DatasetCSVError(f"CSV file has no header: {file_path}")
                row_count = sum(1 for _ in reader)
        except UnicodeError as exc:
            raise DatasetEncodingError(
                f"CSV file could not be decoded using {encoding}: {file_path}"
            ) from exc
        except csv.Error as exc:
            raise DatasetCSVError(
                f"CSV file could not be parsed: {file_path}: {exc}"
            ) from exc
        except OSError as exc:
            raise DatasetCSVError(
                f"CSV file could not be read: {file_path}: {exc}"
            ) from exc

        after = file_path.stat()
        if before.st_size != after.st_size or before.st_mtime_ns != after.st_mtime_ns:
            raise DatasetFileChangedError(
                f"Dataset file changed while being inventoried: {file_path}"
            )

        relative_path = file_path.relative_to(root).as_posix()
        record = DatasetFileRecord(
            filename=file_path.name,
            relative_path=relative_path,
            size_bytes=after.st_size,
            rows=row_count,
            columns=tuple(header),
            encoding=encoding,
            delimiter=delimiter,
            sha256=self._sha256(file_path),
            modified_at=self._modified_at(after.st_mtime),
        )
        logger.debug(
            "Inventoried CSV: path=%s, rows=%d, columns=%d",
            relative_path,
            record.rows,
            record.column_count,
        )
        return record

    @staticmethod
    def _detect_encoding(file_path: Path) -> str:
        """Identify supported Unicode encodings or a valid Windows-1252 sample."""
        try:
            with file_path.open("rb") as stream:
                sample = stream.read(SAMPLE_SIZE_BYTES)
        except OSError as exc:
            raise DatasetCSVError(
                f"Unable to read CSV encoding sample from {file_path}: {exc}"
            ) from exc

        if sample.startswith((b"\xff\xfe\x00\x00", b"\x00\x00\xfe\xff")):
            raise DatasetEncodingError(
                f"UTF-32 encoded CSV is not supported: {file_path}"
            )
        if sample.startswith((b"\xff\xfe", b"\xfe\xff")):
            return "utf-16"
        if sample.startswith(b"\xef\xbb\xbf"):
            return "utf-8-sig"
        try:
            sample.decode("utf-8", errors="strict")
            return "utf-8"
        except UnicodeDecodeError:
            try:
                decoded = sample.decode("cp1252", errors="strict")
            except UnicodeDecodeError as exc:
                raise DatasetEncodingError(
                    f"CSV encoding is not UTF-8, UTF-16 with BOM, or "
                    f"Windows-1252: {file_path}"
                ) from exc
            if any(
                ord(character) < 32 and character not in "\t\n\r"
                for character in decoded
            ):
                raise DatasetEncodingError(
                    f"CSV encoding sample contains unsupported control "
                    f"characters: {file_path}"
                )
            return "cp1252"

    @staticmethod
    def _detect_delimiter(file_path: Path, encoding: str) -> str:
        """Detect a common CSV delimiter from a bounded text sample."""
        try:
            with file_path.open(mode="r", encoding=encoding, newline="") as stream:
                sample = stream.read(SAMPLE_SIZE_BYTES)
            if not sample:
                raise DatasetCSVError(f"CSV file is empty: {file_path}")
            try:
                return csv.Sniffer().sniff(
                    sample,
                    delimiters=SUPPORTED_DELIMITERS,
                ).delimiter
            except csv.Error:
                return ","
        except UnicodeError as exc:
            raise DatasetEncodingError(
                f"Unable to decode CSV delimiter sample: {file_path}"
            ) from exc
        except OSError as exc:
            raise DatasetCSVError(
                f"Unable to read CSV delimiter sample from {file_path}: {exc}"
            ) from exc

    @staticmethod
    def _sha256(file_path: Path) -> str:
        """Compute a file SHA-256 digest using fixed-size chunks."""
        digest = hashlib.sha256()
        try:
            with file_path.open("rb") as stream:
                for chunk in iter(
                    lambda: stream.read(HASH_CHUNK_SIZE_BYTES),
                    b"",
                ):
                    digest.update(chunk)
        except OSError as exc:
            raise DatasetCSVError(
                f"Unable to hash dataset file {file_path}: {exc}"
            ) from exc
        return digest.hexdigest()

    @staticmethod
    def _resolve_record_path(
        file_record: DatasetFileRecord,
        root: Path,
    ) -> Path:
        """Resolve an inventory path and reject traversal or linked files."""
        candidate = (root / file_record.relative_path).resolve()
        try:
            candidate.relative_to(root)
        except ValueError as exc:
            raise DatasetDirectoryError(
                f"Inventory path escapes the dataset directory: "
                f"{file_record.relative_path}"
            ) from exc
        if candidate.is_symlink() or not candidate.is_file():
            raise DatasetDirectoryError(
                f"Inventoried dataset file is not a regular file: {candidate}"
            )
        return candidate

    @staticmethod
    def _modified_at(timestamp: float) -> datetime:
        """Convert a filesystem timestamp to timezone-aware UTC."""
        return datetime.fromtimestamp(timestamp, UTC)
