"""Streaming orchestration for reproducible user-based dataset subsets."""

import csv
import logging
from pathlib import Path

from app.dataset_subset.exceptions import (
    DatasetCSVError,
    DatasetDirectoryError,
    DatasetSubsetError,
    MissingDatasetFileError,
    UnsafeOutputDirectoryError,
)
from app.dataset_subset.manifest import DatasetSubsetManifest
from app.dataset_subset.report import DatasetSubsetReport
from app.dataset_subset.schemas import (
    DatasetSubsetConfig,
    DatasetSubsetResult,
    SubsetFileRecord,
    utc_now,
)
from app.dataset_subset.selector import select_users
from app.dataset_subset.utils import find_user_column, read_user_ids, sha256_file

logger = logging.getLogger("ai_privacy_firewall.dataset_subset")

REQUIRED_CSV_FILES = (
    "logon.csv",
    "device.csv",
    "file.csv",
    "email.csv",
    "http.csv",
    "psychometric.csv",
)


class DatasetSubsetPipeline:
    """Create a subset while streaming source and output CSV records."""

    def __init__(
        self,
        config: DatasetSubsetConfig | None = None,
        report_generator: DatasetSubsetReport | None = None,
        manifest_generator: DatasetSubsetManifest | None = None,
    ) -> None:
        """Initialize the pipeline with injectable configuration and writers."""
        self.config = config or DatasetSubsetConfig()
        self.report_generator = report_generator or DatasetSubsetReport()
        self.manifest_generator = manifest_generator or DatasetSubsetManifest()

    def run(self) -> DatasetSubsetResult:
        """Create all subset files, then write reports and the manifest."""
        source_root = self._validate_source_directory()
        output_root = self._validate_output_directory(source_root)
        files = self._discover_files(source_root)
        logon_path = source_root / "logon.csv"
        user_ids = read_user_ids(logon_path)
        if not user_ids:
            raise DatasetSubsetError(
                f"No user identifiers were found in the logon file: {logon_path}"
            )
        selected_users = select_users(
            user_ids,
            self.config.subset_percentage,
            self.config.random_seed,
        )
        output_root.mkdir(parents=True, exist_ok=True)

        file_records = tuple(
            self._copy_selected_rows(
                source_root, output_root, source_path, selected_users
            )
            for source_path in files
        )
        generated_at = utc_now()
        result = DatasetSubsetResult(
            config=self.config,
            total_users=len(user_ids),
            selected_users=selected_users,
            files=file_records,
            generated_at=generated_at,
            report_json_path=output_root / "subset_report.json",
            report_markdown_path=output_root / "subset_report.md",
            manifest_path=output_root / "subset_manifest.json",
        )
        self.report_generator.generate(result)
        self.manifest_generator.generate(result)
        logger.info(
            "Dataset subset generated: selected_users=%d, total_users=%d, files=%d",
            result.selected_user_count,
            result.total_users,
            len(result.files),
        )
        return result

    def _validate_source_directory(self) -> Path:
        """Resolve the source root and report invalid paths explicitly."""
        source_root = self.config.source_directory.expanduser().resolve()
        if not source_root.exists() or not source_root.is_dir():
            raise DatasetDirectoryError(
                f"Dataset source directory does not exist or is not a directory: "
                f"{source_root}"
            )
        return source_root

    def _validate_output_directory(self, source_root: Path) -> Path:
        """Prevent output writes anywhere inside or above the source dataset."""
        output_root = self.config.output_directory.expanduser().resolve()
        if (
            output_root == source_root
            or output_root in source_root.parents
            or source_root in output_root.parents
        ):
            raise UnsafeOutputDirectoryError(
                "Output directory must not overlap the source dataset directory."
            )
        return output_root

    def _discover_files(self, source_root: Path) -> tuple[Path, ...]:
        """Find the required CERT tables, LDAP snapshots, and optional answer key."""
        files: list[Path] = []
        for filename in REQUIRED_CSV_FILES:
            path = source_root / filename
            if not path.is_file():
                raise MissingDatasetFileError(
                    f"Required dataset file is missing: {path}"
                )
            files.append(path)

        ldap_directory = source_root / "LDAP"
        if not ldap_directory.is_dir():
            raise MissingDatasetFileError(
                f"Required LDAP directory is missing: {ldap_directory}"
            )
        ldap_files = tuple(
            sorted(
                (
                    path
                    for path in ldap_directory.rglob("*.csv")
                    if path.is_file() and path.suffix.casefold() == ".csv"
                ),
                key=lambda path: path.relative_to(source_root).as_posix().casefold(),
            )
        )
        if not ldap_files:
            raise MissingDatasetFileError(
                f"LDAP directory contains no CSV snapshots: {ldap_directory}"
            )
        files.extend(ldap_files)

        for answer_path in (
            source_root / "answers" / "insiders.csv",
            source_root.parent / "answers" / "insiders.csv",
        ):
            if answer_path.exists():
                if not answer_path.is_file():
                    raise MissingDatasetFileError(
                        f"Optional insiders file is not a regular file: {answer_path}"
                    )
                files.append(answer_path)
                break
        return tuple(files)

    def _copy_selected_rows(
        self,
        source_root: Path,
        output_root: Path,
        source_path: Path,
        selected_users: tuple[str, ...],
    ) -> SubsetFileRecord:
        """Copy rows whose user field belongs to the selected user set."""
        relative_path = self._relative_source_path(source_root, source_path)
        output_path = output_root / Path(relative_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        selected = set(selected_users)
        rows_copied = 0
        try:
            with (
                source_path.open("r", encoding="utf-8-sig", newline="") as source,
                output_path.open("w", encoding="utf-8", newline="") as destination,
            ):
                reader = csv.reader(source, strict=True)
                writer = csv.writer(destination, lineterminator="\n")
                header = next(reader, None)
                if not header:
                    raise DatasetCSVError(f"CSV file has no header: {source_path}")
                user_index = find_user_column(header, source_path)
                writer.writerow(header)
                for row_number, row in enumerate(reader, start=2):
                    if user_index >= len(row) or not row[user_index].strip():
                        raise DatasetCSVError(
                            f"Missing user identifier in {source_path} "
                            f"at row {row_number}."
                        )
                    if row[user_index].strip() in selected:
                        writer.writerow(row)
                        rows_copied += 1
        except (OSError, UnicodeError, csv.Error) as exc:
            raise DatasetCSVError(
                f"Unable to subset CSV file {source_path}: {exc}"
            ) from exc

        record = SubsetFileRecord(
            source_path=self._display_source_path(source_root, source_path),
            output_path=str(output_path),
            rows_copied=rows_copied,
            sha256=sha256_file(output_path),
        )
        logger.debug(
            "Subset CSV written: source=%s, rows=%d, sha256=%s",
            record.source_path,
            record.rows_copied,
            record.sha256,
        )
        return record

    @staticmethod
    def _relative_source_path(source_root: Path, source_path: Path) -> str:
        """Return a safe relative output path for both dataset and answers files."""
        try:
            return source_path.relative_to(source_root).as_posix()
        except ValueError:
            return "answers/insiders.csv"

    @staticmethod
    def _display_source_path(source_root: Path, source_path: Path) -> str:
        """Display source files relative to the dataset root when possible."""
        try:
            return source_path.relative_to(source_root).as_posix()
        except ValueError:
            return "answers\\insiders.csv"
