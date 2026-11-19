"""CERT dataset loading contracts and UTF-8 validated-row implementation."""

import csv
import hashlib
import logging
from abc import ABC, abstractmethod
from collections.abc import Iterator
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from app.core.constants import APP_LOGGER_NAME
from app.experiments.config import BACKEND_DIRECTORY
from app.experiments.exceptions import (
    ExperimentDatasetNotFoundError,
    ExperimentDatasetReadError,
    ExperimentDatasetValidationError,
)
from app.experiments.schemas import (
    ExperimentDatasetLoadMetadata,
    ExperimentDatasetLoadResult,
)
from app.features.schemas import (
    CERTDataset,
    CERTGroundTruth,
    CERTGroundTruthInterval,
    CSVRow,
    ValidatedCSVRows,
)

logger: logging.Logger = logging.getLogger(
    f"{APP_LOGGER_NAME}.experiments.dataset_loader"
)

DEFAULT_EXPERIMENT_DATASET_DIRECTORY = (
    BACKEND_DIRECTORY / "data" / "raw" / "cert_r4.2_subset"
)
ROOT_DATASETS: dict[str, CERTDataset] = {
    "device.csv": CERTDataset.DEVICE,
    "email.csv": CERTDataset.EMAIL,
    "file.csv": CERTDataset.FILE,
    "http.csv": CERTDataset.HTTP,
    "ldap.csv": CERTDataset.LDAP,
    "logon.csv": CERTDataset.LOGON,
}
REQUIRED_HEADERS: dict[CERTDataset, frozenset[str]] = {
    CERTDataset.DEVICE: frozenset({"date", "user", "pc"}),
    CERTDataset.EMAIL: frozenset({"date", "user", "pc"}),
    CERTDataset.FILE: frozenset({"date", "user", "pc"}),
    CERTDataset.HTTP: frozenset({"date", "user", "pc"}),
    CERTDataset.LOGON: frozenset({"date", "user", "pc"}),
    CERTDataset.LDAP: frozenset({"user_id"}),
}
HASH_CHUNK_SIZE = 1024 * 1024
GROUND_TRUTH_RELATIVE_PATH = Path("answers") / "insiders.csv"
GROUND_TRUTH_TARGET_COLUMN = "insider"


class ExperimentDatasetLoader(ABC):
    """Define the loading boundary for validated CERT feature rows."""

    @abstractmethod
    def load(self, dataset_path: Path | None = None) -> ExperimentDatasetLoadResult:
        """Return validated dataset rows and loading metadata."""


@dataclass(frozen=True, slots=True)
class _CSVFile:
    """Validated source file metadata used to create replayable row iterables."""

    path: Path
    relative_path: str
    dataset: CERTDataset
    headers: tuple[str, ...]
    row_count: int
    sha256: str
    size_bytes: int
    modified_at_ns: int


class _CSVRecordRows:
    """Replay a validated CSV as ordered mappings without retaining its rows."""

    def __init__(self, source: _CSVFile) -> None:
        """Retain a validated file reference for downstream iteration."""
        self._source = source

    def __iter__(self) -> Iterator[CSVRow]:
        """Yield CSV records in source order after checking the file snapshot."""
        source = self._source
        try:
            initial_stat = source.path.stat()
            if (
                initial_stat.st_size != source.size_bytes
                or initial_stat.st_mtime_ns != source.modified_at_ns
            ):
                raise ExperimentDatasetReadError(
                    f"Dataset file changed after validation: {source.relative_path}"
                )
            with source.path.open(
                "r",
                encoding="utf-8-sig",
                newline="",
            ) as stream:
                reader = csv.reader(stream, strict=True)
                header = next(reader, None)
                if header is None or tuple(header) != source.headers:
                    raise ExperimentDatasetReadError(
                        f"Dataset header changed after validation: "
                        f"{source.relative_path}"
                    )
                for row_number, row in enumerate(reader, start=2):
                    if len(row) != len(source.headers):
                        raise ExperimentDatasetValidationError(
                            f"Row {row_number} in {source.relative_path} has "
                            f"{len(row)} fields; expected {len(source.headers)}."
                        )
                    yield dict(zip(source.headers, row, strict=True))
            final_stat = source.path.stat()
            if (
                final_stat.st_size != source.size_bytes
                or final_stat.st_mtime_ns != source.modified_at_ns
            ):
                raise ExperimentDatasetReadError(
                    f"Dataset file changed while rows were being read: "
                    f"{source.relative_path}"
                )
        except ExperimentDatasetReadError:
            raise
        except ExperimentDatasetValidationError:
            raise
        except (OSError, UnicodeError, csv.Error) as exc:
            raise ExperimentDatasetReadError(
                f"Unable to read dataset CSV {source.relative_path}: {exc}"
            ) from exc


class CERTExperimentDatasetLoader(ExperimentDatasetLoader):
    """Load supported CERT CSVs into the feature package's validated row type.

    CSV content is validated once to compute metadata. Rows are exposed through
    replayable iterables so large datasets need not be held in memory.
    """

    def __init__(self, dataset_directory: Path | None = None) -> None:
        """Initialize with a directory or the default CERT subset location."""
        self.dataset_directory = (
            dataset_directory or DEFAULT_EXPERIMENT_DATASET_DIRECTORY
        ).expanduser()

    def load(self, dataset_path: Path | None = None) -> ExperimentDatasetLoadResult:
        """Validate supported CSVs and return rows with reproducibility metadata."""
        root = (dataset_path or self.dataset_directory).expanduser().resolve()
        if not root.exists() or not root.is_dir():
            raise ExperimentDatasetNotFoundError(
                f"Experiment dataset directory does not exist: {root}"
            )

        source_files = self._discover_files(root)
        if not source_files:
            raise ExperimentDatasetValidationError(
                f"No supported CERT CSV files were found in {root}."
            )

        csv_files = tuple(
            self._validate_file(root, path, dataset) for path, dataset in source_files
        )
        validated_sources: list[ValidatedCSVRows] = []
        for source in csv_files:
            validated_sources.append(
                ValidatedCSVRows(
                    dataset=source.dataset,
                    headers=source.headers,
                    rows=_CSVRecordRows(source),
                )
            )
        ground_truth, ground_truth_row_count, ground_truth_sha256 = (
            self._load_ground_truth(root)
        )
        digest_sources = [
            (source.relative_path, source.sha256, source.row_count)
            for source in csv_files
        ]
        if ground_truth_sha256 is not None:
            digest_sources.append(
                (
                    GROUND_TRUTH_RELATIVE_PATH.as_posix(),
                    ground_truth_sha256,
                    ground_truth_row_count,
                )
            )
        dataset_digest = hashlib.sha256()
        row_counts: list[tuple[str, int]] = []
        for relative_path, file_sha256, row_count in sorted(digest_sources):
            dataset_digest.update(relative_path.encode("utf-8"))
            dataset_digest.update(b"\0")
            dataset_digest.update(bytes.fromhex(file_sha256))
            row_counts.append((relative_path, row_count))

        metadata = ExperimentDatasetLoadMetadata(
            dataset_path=root,
            dataset_sha256=dataset_digest.hexdigest(),
            file_count=len(digest_sources),
            row_counts=tuple(row_counts),
            loaded_at=datetime.now(UTC),
        )
        logger.info(
            "CERT experiment dataset loaded: path=%s, files=%d, rows=%d",
            root,
            metadata.file_count,
            sum(count for _, count in metadata.row_counts),
        )
        return ExperimentDatasetLoadResult(
            datasets=tuple(validated_sources),
            metadata=metadata,
            ground_truth=ground_truth,
        )

    def _load_ground_truth(
        self,
        root: Path,
    ) -> tuple[CERTGroundTruth | None, int, str | None]:
        """Load CERT insider intervals when the canonical answer file exists."""
        path = root / GROUND_TRUTH_RELATIVE_PATH
        if not path.is_file() or path.is_symlink():
            return None, 0, None

        try:
            initial_stat = path.stat()
            sha256 = self._sha256_file(path)
            with path.open("r", encoding="utf-8-sig", newline="") as stream:
                reader = csv.reader(stream, strict=True)
                headers = next(reader, None)
                if headers is None:
                    raise ExperimentDatasetValidationError(
                        f"Ground-truth CSV is empty: "
                        f"{GROUND_TRUTH_RELATIVE_PATH.as_posix()}."
                    )
                normalized_headers: dict[str, int] = {}
                for index, header in enumerate(headers):
                    normalized = header.strip().casefold()
                    if not normalized or normalized in normalized_headers:
                        raise ExperimentDatasetValidationError(
                            "Ground-truth CSV has empty or duplicate column names: "
                            f"{GROUND_TRUTH_RELATIVE_PATH.as_posix()}."
                        )
                    normalized_headers[normalized] = index
                required = {"user", "start", "end"}
                missing = required - normalized_headers.keys()
                if missing:
                    raise ExperimentDatasetValidationError(
                        "Ground-truth CSV is missing required columns: "
                        f"{', '.join(sorted(missing))}."
                    )

                intervals: list[CERTGroundTruthInterval] = []
                row_count = 0
                for row_count, row in enumerate(reader, start=1):
                    if len(row) != len(headers):
                        raise ExperimentDatasetValidationError(
                            f"Row {row_count + 1} in "
                            f"{GROUND_TRUTH_RELATIVE_PATH.as_posix()} has "
                            f"{len(row)} fields; expected {len(headers)}."
                        )
                    subject_id = row[normalized_headers["user"]].strip()
                    if not subject_id:
                        raise ExperimentDatasetValidationError(
                            f"Ground-truth row {row_count + 1} has an empty user."
                        )
                    start = _parse_ground_truth_timestamp(
                        row[normalized_headers["start"]],
                        row_count + 1,
                        "start",
                    )
                    end = _parse_ground_truth_timestamp(
                        row[normalized_headers["end"]],
                        row_count + 1,
                        "end",
                    )
                    if end < start:
                        raise ExperimentDatasetValidationError(
                            f"Ground-truth row {row_count + 1} ends before it starts."
                        )
                    intervals.append(
                        CERTGroundTruthInterval(
                            subject_id=subject_id,
                            start=start,
                            end=end,
                        )
                    )
            final_stat = path.stat()
            if (
                final_stat.st_size != initial_stat.st_size
                or final_stat.st_mtime_ns != initial_stat.st_mtime_ns
            ):
                raise ExperimentDatasetReadError(
                    "Ground-truth file changed while being loaded: "
                    f"{GROUND_TRUTH_RELATIVE_PATH.as_posix()}."
                )
        except (ExperimentDatasetReadError, ExperimentDatasetValidationError):
            raise
        except (OSError, UnicodeError, csv.Error) as exc:
            raise ExperimentDatasetReadError(
                "Unable to read CERT ground-truth CSV "
                f"{GROUND_TRUTH_RELATIVE_PATH.as_posix()}: {exc}"
            ) from exc

        ground_truth = CERTGroundTruth(
            target_column=GROUND_TRUTH_TARGET_COLUMN,
            intervals=tuple(
                sorted(
                    intervals,
                    key=lambda interval: (
                        interval.subject_id,
                        interval.start,
                        interval.end,
                    ),
                )
            ),
        )
        return ground_truth, row_count, sha256

    def _discover_files(
        self,
        root: Path,
    ) -> tuple[tuple[Path, CERTDataset], ...]:
        """Discover canonical root tables and skip LDAP history snapshots."""
        discovered: list[tuple[Path, CERTDataset]] = []
        candidates = sorted(
            root.rglob("*"),
            key=lambda path: path.relative_to(root).as_posix().casefold(),
        )
        for candidate in candidates:
            relative = candidate.relative_to(root)
            parts = relative.parts
            if (
                candidate.is_symlink()
                or any(part.startswith(".") for part in parts)
                or any(part.casefold() == "answers" for part in parts)
            ):
                continue
            if not candidate.is_file() or candidate.suffix.casefold() != ".csv":
                continue
            if len(parts) == 1:
                dataset = ROOT_DATASETS.get(candidate.name.casefold())
                if dataset is None:
                    logger.info(
                        "Skipping unsupported CERT dataset: %s",
                        candidate.name,
                    )
                    continue
                discovered.append((candidate, dataset))
            elif parts[0].casefold() == "ldap":
                logger.info(
                    "Skipping LDAP snapshot: %s",
                    relative.as_posix().casefold(),
                )
            else:
                logger.info(
                    "Skipping unsupported CERT dataset: %s",
                    candidate.name,
                )
        return tuple(discovered)

    def _validate_file(
        self,
        root: Path,
        path: Path,
        dataset: CERTDataset,
    ) -> _CSVFile:
        """Validate UTF-8 CSV structure and collect file-level metadata."""
        relative_path = path.relative_to(root).as_posix()
        try:
            initial_stat = path.stat()
            sha256 = self._sha256_file(path)
            with path.open("r", encoding="utf-8-sig", newline="") as stream:
                reader = csv.reader(stream, strict=True)
                headers = next(reader, None)
                if headers is None:
                    raise ExperimentDatasetValidationError(
                        f"CSV file is empty: {relative_path}"
                    )
                if not headers:
                    raise ExperimentDatasetValidationError(
                        f"CSV file has an empty header row: {relative_path}"
                    )
                normalized_headers: list[str] = []
                seen_headers: set[str] = set()
                for header in headers:
                    normalized = header.strip().casefold()
                    if not normalized:
                        raise ExperimentDatasetValidationError(
                            f"CSV file has an empty header in {relative_path}."
                        )
                    if normalized in seen_headers:
                        raise ExperimentDatasetValidationError(
                            f"CSV file has duplicate header {header!r} "
                            f"in {relative_path}."
                        )
                    normalized_headers.append(normalized)
                    seen_headers.add(normalized)
                missing_headers = REQUIRED_HEADERS[dataset] - set(normalized_headers)
                if missing_headers:
                    missing = ", ".join(sorted(missing_headers))
                    raise ExperimentDatasetValidationError(
                        f"{relative_path} is missing required headers: {missing}."
                    )
                row_count = 0
                for row_count, row in enumerate(reader, start=1):
                    if len(row) != len(headers):
                        raise ExperimentDatasetValidationError(
                            f"Row {row_count + 1} in {relative_path} has "
                            f"{len(row)} fields; expected {len(headers)}."
                        )
            final_stat = path.stat()
            if (
                final_stat.st_size != initial_stat.st_size
                or final_stat.st_mtime_ns != initial_stat.st_mtime_ns
            ):
                raise ExperimentDatasetReadError(
                    f"Dataset file changed while being validated: {relative_path}"
                )
        except (ExperimentDatasetReadError, ExperimentDatasetValidationError):
            raise
        except (OSError, UnicodeError, csv.Error) as exc:
            raise ExperimentDatasetReadError(
                f"Unable to validate dataset CSV {relative_path}: {exc}"
            ) from exc

        return _CSVFile(
            path=path,
            relative_path=relative_path,
            dataset=dataset,
            headers=tuple(headers),
            row_count=row_count,
            sha256=sha256,
            size_bytes=final_stat.st_size,
            modified_at_ns=final_stat.st_mtime_ns,
        )

    @staticmethod
    def _sha256_file(path: Path) -> str:
        """Compute a file SHA-256 digest using bounded memory."""
        digest = hashlib.sha256()
        with path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(HASH_CHUNK_SIZE), b""):
                digest.update(chunk)
        return digest.hexdigest()


def _parse_ground_truth_timestamp(
    value: str,
    row_number: int,
    column_name: str,
) -> datetime:
    """Parse documented CERT insider interval timestamp formats."""
    normalized = value.strip()
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        pass
    for timestamp_format in (
        "%m/%d/%Y %H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
    ):
        try:
            return datetime.strptime(normalized, timestamp_format)  # noqa: DTZ007
        except ValueError:
            continue
    raise ExperimentDatasetValidationError(
        f"Ground-truth row {row_number} has invalid {column_name} timestamp {value!r}."
    )
