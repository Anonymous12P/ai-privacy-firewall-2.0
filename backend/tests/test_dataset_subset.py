"""Tests for deterministic user-based CERT dataset subsetting."""

import csv
import hashlib
import json
import math
import runpy
import sys
from datetime import UTC, datetime
from pathlib import Path

import pytest

from app.dataset_subset import (
    DatasetCSVError,
    DatasetDirectoryError,
    DatasetSubsetConfig,
    DatasetSubsetError,
    DatasetSubsetPipeline,
    DatasetSubsetResult,
    InvalidSubsetPercentageError,
    MissingDatasetFileError,
    UnsafeOutputDirectoryError,
    UserColumnNotFoundError,
    select_users,
    validate_percentage,
)
from app.dataset_subset.__main__ import _build_parser
from app.dataset_subset.utils import (
    find_user_column,
    read_user_ids,
    sha256_file,
)

USERS = ("U001", "U002", "U003", "U004")


def _write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    """Write fixture CSV data, creating any needed parent directories."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, lineterminator="\n")
        writer.writerow(header)
        writer.writerows(rows)


def _make_dataset(
    root: Path,
    *,
    include_answers: bool = True,
    include_ldap: bool = True,
) -> Path:
    """Create a small representative CERT directory tree."""
    root.mkdir(parents=True, exist_ok=True)
    tables = {
        "logon.csv": ("user", "activity"),
        "device.csv": ("user", "activity"),
        "file.csv": ("user", "filename"),
        "email.csv": ("user", "to"),
        "http.csv": ("user", "url"),
        "psychometric.csv": ("user_id", "score"),
    }
    for filename, (user_column, value_column) in tables.items():
        _write_csv(
            root / filename,
            [user_column, value_column],
            [[user, f"{filename}-{user}"] for user in USERS],
        )
    if include_ldap:
        _write_csv(
            root / "LDAP" / "2010-01.csv",
            ["user_id", "role"],
            [[user, f"role-{user}"] for user in USERS],
        )
        _write_csv(
            root / "LDAP" / "nested" / "2010-02.csv",
            ["user_id", "role"],
            [[user, f"nested-{user}"] for user in USERS],
        )
    if include_answers:
        _write_csv(
            root / "answers" / "insiders.csv",
            ["user", "scenario"],
            [[user, f"scenario-{user}"] for user in USERS],
        )
    return root


def _read_csv(path: Path) -> list[list[str]]:
    """Return all records in a generated CSV fixture."""
    with path.open("r", encoding="utf-8", newline="") as stream:
        return list(csv.reader(stream))


def _config(
    source: Path, output: Path, percentage: float = 50.0
) -> DatasetSubsetConfig:
    """Build a test configuration with a fixed seed."""
    return DatasetSubsetConfig(source, output, percentage, 42)


def test_select_users_is_deterministic_unique_and_rounded_up() -> None:
    first = select_users(["u3", "u1", "u2", "u1", ""], 34, 17)
    second = select_users(["u2", "u1", "u3", "u1"], 34, 17)

    assert first == second
    assert len(first) == 2
    assert select_users(["only"], 1, 0) == ("only",)
    assert select_users([], 10, 0) == ()
    with pytest.raises(TypeError, match="seed"):
        select_users(["U1"], 10, True)


@pytest.mark.parametrize("percentage", [0, -1, 100.1, math.inf, math.nan, True])
def test_invalid_percentage_is_rejected(percentage: float) -> None:
    with pytest.raises(InvalidSubsetPercentageError):
        validate_percentage(percentage)


def test_percentage_boundaries_and_configuration_seed_validation(
    tmp_path: Path,
) -> None:
    validate_percentage(100)
    with pytest.raises(TypeError, match="random_seed"):
        DatasetSubsetConfig(tmp_path, tmp_path / "out", 10, True)


def test_user_id_reading_and_column_detection(tmp_path: Path) -> None:
    path = tmp_path / "users.csv"
    _write_csv(path, [" Employee ", "user_id"], [["A", " U1 "], ["B", "U2"]])

    assert read_user_ids(path) == {"U1", "U2"}
    assert find_user_column(["USER", "date"], path) == 0


def test_missing_user_column_and_empty_user_identifier_raise(tmp_path: Path) -> None:
    path = tmp_path / "bad.csv"
    _write_csv(path, ["employee"], [["U1"]])
    with pytest.raises(UserColumnNotFoundError):
        read_user_ids(path)

    _write_csv(path, ["user"], [[""]])
    with pytest.raises(DatasetSubsetError, match="Missing user identifier"):
        read_user_ids(path)

    path.write_text("", encoding="utf-8")
    with pytest.raises(DatasetCSVError, match="no header"):
        read_user_ids(path)

    path.write_text('user\n"unfinished', encoding="utf-8")
    with pytest.raises(DatasetCSVError, match="Unable to read user identifiers"):
        read_user_ids(path)

    with pytest.raises(DatasetCSVError, match="Unable to read user identifiers"):
        read_user_ids(tmp_path / "missing.csv")


def test_sha256_file_matches_standard_digest(tmp_path: Path) -> None:
    path = tmp_path / "bytes.bin"
    path.write_bytes(b"subset fixture")

    assert sha256_file(path) == hashlib.sha256(path.read_bytes()).hexdigest()


def test_result_percentage_is_zero_when_total_users_is_zero(tmp_path: Path) -> None:
    config = _config(tmp_path / "source", tmp_path / "output")
    result = DatasetSubsetResult(
        config=config,
        total_users=0,
        selected_users=(),
        files=(),
        generated_at=datetime.now(UTC),
        report_json_path=tmp_path / "output" / "subset_report.json",
        report_markdown_path=tmp_path / "output" / "subset_report.md",
        manifest_path=tmp_path / "output" / "subset_manifest.json",
    )

    assert result.actual_percentage == 0


def test_pipeline_copies_related_rows_and_generates_reports_and_manifest(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "source")
    output = tmp_path / "subset"
    original_files = {
        path.relative_to(source): path.read_bytes()
        for path in source.rglob("*")
        if path.is_file()
    }

    result = DatasetSubsetPipeline(_config(source, output)).run()

    assert result.total_users == 4
    assert result.selected_user_count == 2
    assert result.actual_percentage == 50
    assert len(result.files) == 9
    assert result.report_json_path.is_file()
    assert result.report_markdown_path.is_file()
    assert result.manifest_path.is_file()
    assert all(record.rows_copied == 2 for record in result.files)
    for record in result.files:
        copied = output / Path(record.output_path).relative_to(output)
        rows = _read_csv(copied)
        assert {row[0] for row in rows[1:]} == set(result.selected_users)
        assert record.sha256 == hashlib.sha256(copied.read_bytes()).hexdigest()
    assert {
        path.relative_to(source): path.read_bytes()
        for path in source.rglob("*")
        if path.is_file()
    } == original_files

    report = json.loads(result.report_json_path.read_text(encoding="utf-8"))
    manifest = json.loads(result.manifest_path.read_text(encoding="utf-8"))
    assert report["users"]["selected_user_ids"] == list(result.selected_users)
    assert report["files"][0]["sha256"] == result.files[0].sha256
    assert "SHA-256" in result.report_markdown_path.read_text(encoding="utf-8")
    assert manifest["configuration"]["random_seed"] == 42
    assert manifest["files"][0]["rows_copied"] == 2


def test_repeated_runs_with_same_seed_produce_identical_subset_data(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "source")
    first = DatasetSubsetPipeline(_config(source, tmp_path / "first")).run()
    second = DatasetSubsetPipeline(_config(source, tmp_path / "second")).run()

    assert first.selected_users == second.selected_users
    first_hashes = {
        Path(record.output_path).relative_to(tmp_path / "first"): record.sha256
        for record in first.files
    }
    second_hashes = {
        Path(record.output_path).relative_to(tmp_path / "second"): record.sha256
        for record in second.files
    }
    assert first_hashes == second_hashes


def test_pipeline_handles_optional_insiders_file_outside_dataset_root(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "raw" / "cert_r4.2", include_answers=False)
    _write_csv(
        tmp_path / "raw" / "answers" / "insiders.csv",
        ["user", "scenario"],
        [[user, f"scenario-{user}"] for user in USERS],
    )
    result = DatasetSubsetPipeline(_config(source, tmp_path / "subset", 100)).run()

    insider_record = next(
        record for record in result.files if "insiders.csv" in record.output_path
    )
    assert insider_record.source_path.endswith("answers\\insiders.csv")
    assert (tmp_path / "subset" / "answers" / "insiders.csv").is_file()
    assert result.selected_user_count == 4


def test_pipeline_allows_absent_insiders_and_rejects_non_file_answer(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "without-answers", include_answers=False)
    result = DatasetSubsetPipeline(
        _config(source, tmp_path / "without-answer-output")
    ).run()
    assert all("insiders.csv" not in record.source_path for record in result.files)

    invalid_source = _make_dataset(
        tmp_path / "invalid-answer",
        include_answers=False,
    )
    (invalid_source / "answers" / "insiders.csv").mkdir(parents=True)
    with pytest.raises(MissingDatasetFileError, match="not a regular file"):
        DatasetSubsetPipeline(
            _config(invalid_source, tmp_path / "invalid-answer-output")
        ).run()


def test_pipeline_rejects_missing_required_file_and_ldap_directory(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "missing-file")
    (source / "device.csv").unlink()
    with pytest.raises(MissingDatasetFileError, match="device.csv"):
        DatasetSubsetPipeline(_config(source, tmp_path / "out")).run()

    source_without_ldap = _make_dataset(
        tmp_path / "missing-ldap",
        include_ldap=False,
    )
    with pytest.raises(MissingDatasetFileError, match="LDAP"):
        DatasetSubsetPipeline(_config(source_without_ldap, tmp_path / "out-ldap")).run()

    source_with_empty_ldap = _make_dataset(
        tmp_path / "empty-ldap",
        include_ldap=False,
    )
    (source_with_empty_ldap / "LDAP").mkdir()
    with pytest.raises(MissingDatasetFileError, match="no CSV snapshots"):
        DatasetSubsetPipeline(
            _config(source_with_empty_ldap, tmp_path / "empty-ldap-output")
        ).run()


def test_pipeline_validates_source_and_prevents_overlapping_output(
    tmp_path: Path,
) -> None:
    with pytest.raises(DatasetDirectoryError):
        DatasetSubsetPipeline(_config(tmp_path / "missing", tmp_path / "output")).run()

    source = _make_dataset(tmp_path / "source")
    with pytest.raises(UnsafeOutputDirectoryError):
        DatasetSubsetPipeline(_config(source, source / "output")).run()
    with pytest.raises(UnsafeOutputDirectoryError):
        DatasetSubsetPipeline(_config(source, source.parent)).run()

    source_file = tmp_path / "not-a-directory"
    source_file.write_text("not a dataset", encoding="utf-8")
    with pytest.raises(DatasetDirectoryError):
        DatasetSubsetPipeline(_config(source_file, tmp_path / "separate")).run()


def test_pipeline_rejects_empty_logon_users_and_missing_row_user(
    tmp_path: Path,
) -> None:
    source = _make_dataset(tmp_path / "empty-logon")
    _write_csv(source / "logon.csv", ["user"], [])
    with pytest.raises(DatasetSubsetError, match="No user identifiers"):
        DatasetSubsetPipeline(_config(source, tmp_path / "out")).run()

    source = _make_dataset(tmp_path / "empty-row")
    _write_csv(source / "device.csv", ["user"], [[""]])
    with pytest.raises(DatasetCSVError, match="Missing user identifier"):
        DatasetSubsetPipeline(_config(source, tmp_path / "out-row")).run()

    source = _make_dataset(tmp_path / "empty-csv-header")
    (source / "device.csv").write_text("", encoding="utf-8")
    with pytest.raises(DatasetCSVError, match="no header"):
        DatasetSubsetPipeline(
            _config(source, tmp_path / "empty-csv-header-output")
        ).run()

    source = _make_dataset(tmp_path / "malformed-csv")
    (source / "device.csv").write_text('user\n"unfinished', encoding="utf-8")
    with pytest.raises(DatasetCSVError, match="Unable to subset CSV file"):
        DatasetSubsetPipeline(_config(source, tmp_path / "malformed-csv-output")).run()


def test_cli_parser_and_entry_point_use_supplied_paths(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    defaults = _build_parser().parse_args([])
    assert defaults.percentage == 10.0
    assert defaults.seed == 42

    source = _make_dataset(tmp_path / "source")
    output = tmp_path / "cli-output"
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "dataset_subset",
            "--source-directory",
            str(source),
            "--output-directory",
            str(output),
            "--percentage",
            "25",
            "--seed",
            "11",
        ],
    )

    runpy.run_path(
        str(Path(__file__).parents[1] / "app" / "dataset_subset" / "__main__.py"),
        run_name="__main__",
    )

    assert (output / "subset_report.json").is_file()
