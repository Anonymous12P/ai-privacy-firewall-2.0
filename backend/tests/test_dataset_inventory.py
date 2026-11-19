"""Tests for read-only dataset inventory, statistics, and report generation."""

import csv
import hashlib
import json
from pathlib import Path

import pytest

from app.dataset_inventory import (
    DatasetCSVError,
    DatasetDirectoryError,
    DatasetEncodingError,
    DatasetInventory,
    DatasetNotFoundError,
    DatasetReportGenerator,
    DatasetScanner,
    DatasetStatistics,
)
from app.dataset_inventory.schemas import (
    DatasetInventoryResult,
    DatasetStatisticsResult,
)


def _write_csv(path: Path, rows: list[list[str]], encoding: str = "utf-8") -> None:
    """Write a small generic CSV fixture for inventory tests."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding=encoding, newline="") as stream:
        writer = csv.writer(stream)
        writer.writerows(rows)


def _analyze(
    dataset_root: Path,
) -> tuple[
    DatasetScanner,
    DatasetInventoryResult,
    DatasetStatisticsResult,
]:
    """Build inventory and statistics for a temporary dataset directory."""
    scanner = DatasetScanner(dataset_root)
    inventory = DatasetInventory(scanner).build()
    statistics = DatasetStatistics(scanner).calculate(inventory)
    return scanner, inventory, statistics


def test_missing_dataset_directory_raises_typed_error(tmp_path: Path) -> None:
    """A missing input directory is reported as a dataset-specific error."""
    with pytest.raises(DatasetNotFoundError):
        DatasetScanner(tmp_path / "missing").scan()


def test_invalid_dataset_directory_raises_typed_error(tmp_path: Path) -> None:
    """A regular file cannot be used as the dataset directory."""
    invalid_root = tmp_path / "not-a-folder"
    invalid_root.write_text("fixture", encoding="utf-8")

    with pytest.raises(DatasetDirectoryError):
        DatasetScanner(invalid_root).scan()


def test_empty_dataset_directory_returns_empty_inventory(tmp_path: Path) -> None:
    """An empty directory produces an honest empty inventory and statistics."""
    _, inventory, statistics = _analyze(tmp_path)

    assert inventory.files == ()
    assert statistics.files == ()
    assert statistics.total_rows == 0


def test_nested_csv_inventory_has_hash_metadata_and_relative_paths(
    tmp_path: Path,
) -> None:
    """Nested CSV files are discovered without losing their relative paths."""
    dataset_root = tmp_path / "dataset"
    source = dataset_root / "nested" / "events.csv"
    _write_csv(source, [["name", "count"], ["A", "1"], ["B", "2"]])

    records = DatasetScanner(dataset_root).scan()

    assert len(records) == 1
    assert records[0].filename == "events.csv"
    assert records[0].relative_path == "nested/events.csv"
    assert records[0].size_bytes == source.stat().st_size
    assert records[0].rows == 2
    assert records[0].columns == ("name", "count")
    assert records[0].column_count == 2
    assert records[0].encoding == "utf-8"
    assert records[0].delimiter == ","
    assert records[0].sha256 == hashlib.sha256(source.read_bytes()).hexdigest()
    assert records[0].modified_at.tzinfo is not None


def test_inventory_and_statistics_ignore_answers_directory(tmp_path: Path) -> None:
    """Ground-truth CSVs are excluded from both inventory and analysis."""
    dataset_root = tmp_path / "cert_r4.2"
    _write_csv(
        dataset_root / "logon.csv",
        [["id", "user"], ["1", "U001"]],
    )
    _write_csv(
        dataset_root / "LDAP" / "2010-01.csv",
        [["user_id", "role"], ["U001", "analyst"]],
    )
    answers_file = dataset_root / "answers" / "nested" / "r3.1-2.csv"
    answers_file.parent.mkdir(parents=True, exist_ok=True)
    answers_file.write_bytes(b"\xff\xfe\x00\x00not a behavioral CSV")

    _, inventory, statistics = _analyze(dataset_root)

    assert {record.relative_path for record in inventory.files} == {
        "logon.csv",
        "LDAP/2010-01.csv",
    }
    assert {record.relative_path for record in statistics.files} == {
        "logon.csv",
        "LDAP/2010-01.csv",
    }
    assert inventory.total_rows == 2
    assert statistics.total_rows == 2


def test_large_csv_is_scanned_streaming(tmp_path: Path) -> None:
    """A sizable generated generic CSV is counted without dataframe loading."""
    source = tmp_path / "large.csv"
    with source.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(["identifier", "value"])
        for index in range(50_000):
            writer.writerow([index, f"value-{index % 20}"])

    record = DatasetScanner(tmp_path).scan()[0]

    assert record.rows == 50_000
    assert record.column_count == 2


def test_wrong_encoding_raises_typed_error(tmp_path: Path) -> None:
    """Unsupported UTF-32 or binary-like input is not guessed as text."""
    source = tmp_path / "wrong-encoding.csv"
    source.write_bytes(b"\xff\xfe\x00\x00" + "a,b\n1,2\n".encode("utf-32-le"))

    with pytest.raises(DatasetEncodingError):
        DatasetScanner(tmp_path).scan()


def test_windows_1252_encoding_is_identified(tmp_path: Path) -> None:
    """A valid Windows-1252 file is decoded and labelled explicitly."""
    source = tmp_path / "legacy.csv"
    _write_csv(source, [["label"], ["caf\u00e9"]], encoding="cp1252")

    record = DatasetScanner(tmp_path).scan()[0]

    assert record.encoding == "cp1252"
    assert tuple(DatasetScanner(tmp_path).iter_rows(record)) == (("caf\u00e9",),)


def test_statistics_capture_missing_duplicate_and_column_types(
    tmp_path: Path,
) -> None:
    """Statistics count missing cells and duplicates and infer basic types."""
    _write_csv(
        tmp_path / "events.csv",
        [
            ["name", "count", "created"],
            ["alpha", "1", "2024-01-02"],
            ["beta", "", "2024-01-03"],
            ["alpha", "1", "2024-01-02"],
        ],
    )
    _, inventory, statistics = _analyze(tmp_path)

    assert inventory.files[0].rows == 3
    file_statistics = statistics.files[0]
    assert file_statistics.row_count == 3
    assert file_statistics.column_count == 3
    assert file_statistics.missing_values == {"name": 0, "count": 1, "created": 0}
    assert file_statistics.duplicate_rows == 1
    assert file_statistics.numeric_columns == ("count",)
    assert file_statistics.date_columns == ("created",)
    assert file_statistics.categorical_columns == ("name",)
    assert file_statistics.memory_estimate_bytes > 0


def test_inventory_and_statistics_reports_are_generated(
    tmp_path: Path,
) -> None:
    """All requested reports serialize data and explicit empty states."""
    dataset_root = tmp_path / "raw" / "cert_r4.2"
    _write_csv(dataset_root / "nested" / "events.csv", [["id"], ["one"]])
    _, inventory, statistics = _analyze(dataset_root)
    output_dir = tmp_path / "interim"

    paths = DatasetReportGenerator(output_dir).generate(inventory, statistics)

    assert [path.name for path in paths] == [
        "dataset_inventory.json",
        "dataset_statistics.json",
        "dataset_summary.md",
    ]
    inventory_json = json.loads(paths[0].read_text(encoding="utf-8"))
    statistics_json = json.loads(paths[1].read_text(encoding="utf-8"))
    summary = paths[2].read_text(encoding="utf-8")
    assert inventory_json["files"][0]["relative_path"] == "nested/events.csv"
    assert statistics_json["files"][0]["row_count"] == 1
    for section in (
        "Dataset Overview",
        "Folder Structure",
        "Files",
        "Rows",
        "Columns",
        "Potential Join Keys",
        "Data Types",
        "Missing Values",
        "Duplicate Counts",
    ):
        assert section in summary


def test_empty_report_states_no_dataset_analysis(tmp_path: Path) -> None:
    """Reports for an empty source directory do not imply dataset findings."""
    dataset_root = tmp_path / "raw" / "cert_r4.2"
    dataset_root.mkdir(parents=True)
    _, inventory, statistics = _analyze(dataset_root)

    paths = DatasetReportGenerator(tmp_path / "interim").generate(
        inventory,
        statistics,
    )

    assert "No CSV files were found" in paths[2].read_text(encoding="utf-8")
    assert json.loads(paths[0].read_text(encoding="utf-8"))["files"] == []


def test_report_output_cannot_be_inside_raw_dataset(tmp_path: Path) -> None:
    """Report writes are refused inside the scanned source directory."""
    source_root = tmp_path / "dataset"
    source_root.mkdir()
    _, inventory, statistics = _analyze(source_root)

    with pytest.raises(DatasetDirectoryError):
        DatasetReportGenerator(source_root / "reports").generate(
            inventory,
            statistics,
        )


def test_scanner_rejects_csv_symbolic_links_when_supported(
    tmp_path: Path,
) -> None:
    """CSV symlinks are not followed outside or inside the source root."""
    dataset_root = tmp_path / "dataset"
    dataset_root.mkdir()
    target = tmp_path / "target.csv"
    _write_csv(target, [["id"], ["1"]])
    link = dataset_root / "linked.csv"
    try:
        link.symlink_to(target)
    except (OSError, NotImplementedError):
        pytest.skip("Symbolic links are unavailable in this environment.")

    with pytest.raises(DatasetDirectoryError):
        DatasetScanner(dataset_root).scan()


def test_csv_parse_errors_are_typed(tmp_path: Path) -> None:
    """Malformed quoted CSV input produces a clear parser exception."""
    (tmp_path / "malformed.csv").write_text(
        'name,value\n"unterminated,1\n',
        encoding="utf-8",
    )

    with pytest.raises(DatasetCSVError):
        DatasetScanner(tmp_path).scan()
