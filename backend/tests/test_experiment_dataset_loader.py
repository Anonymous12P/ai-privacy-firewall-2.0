"""Synthetic tests for the CERT experiment dataset loader."""

import csv
import hashlib
from datetime import UTC
from pathlib import Path
from typing import cast
from unittest.mock import Mock

import pytest
from app.experiments import (
    CERTExperimentDatasetLoader,
    ExperimentDatasetLoader,
    ExperimentDatasetLoadResult,
    ExperimentPipeline,
)
from app.experiments.dataset_loader import DEFAULT_EXPERIMENT_DATASET_DIRECTORY
from app.experiments.exceptions import (
    ExperimentDatasetNotFoundError,
    ExperimentDatasetReadError,
    ExperimentDatasetValidationError,
)
from app.features.pipeline import FeaturePipeline
from app.features.schemas import CERTDataset, ValidatedCSVRows

ROOT_HEADERS = ["id", "date", "user", "pc", "activity"]


def _write_csv(
    path: Path,
    headers: list[str],
    rows: list[list[str]],
) -> None:
    """Write a synthetic CSV fixture under a temporary dataset directory."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, lineterminator="\n")
        writer.writerow(headers)
        writer.writerows(rows)


def _create_dataset(root: Path) -> Path:
    """Create synthetic behavioral, LDAP, and ignored dataset files."""
    for filename, rows in (
        ("logon.csv", [["L1", "01/01/2010 08:00:00", "U1", "PC1", "Logon"]]),
        ("device.csv", [["D1", "01/01/2010 08:01:00", "U1", "PC1", "Connect"]]),
        ("file.csv", [["F1", "01/01/2010 08:02:00", "U1", "PC1", "a.txt"]]),
        ("http.csv", [["H1", "01/01/2010 08:03:00", "U1", "PC1", "example"]]),
        (
            "email.csv",
            [["E1", "01/01/2010 08:04:00", "U1", "PC1", "U2"]],
        ),
    ):
        _write_csv(root / filename, ROOT_HEADERS, rows)

    _write_csv(
        root / "ldap.csv",
        ["user_id", "employee_name"],
        [["U1", "Canonical User"]],
    )
    _write_csv(
        root / "LDAP" / "nested" / "2010-01.csv",
        ["user_id", "employee_name"],
        [["U1", "Snapshot User"]],
    )
    ignored_csv = root / "answers" / "nested" / "r3.1-2.csv"
    ignored_csv.parent.mkdir(parents=True, exist_ok=True)
    ignored_csv.write_bytes(b"\xff\xfe not UTF-8 CSV")
    (root / ".hidden").mkdir(parents=True, exist_ok=True)
    (root / ".hidden" / "secret.csv").write_bytes(b"not CSV")
    (root / "subset_manifest.json").write_text("{}", encoding="utf-8")
    (root / "subset_report.md").write_text("report", encoding="utf-8")
    (root / "readme.txt").write_text("text", encoding="utf-8")
    (root / "LICENSE").write_text("license", encoding="utf-8")
    return root


def test_default_and_configurable_dataset_directory(tmp_path: Path) -> None:
    assert DEFAULT_EXPERIMENT_DATASET_DIRECTORY == (
        Path(__file__).parents[1] / "data" / "raw" / "cert_r4.2_subset"
    )
    assert CERTExperimentDatasetLoader().dataset_directory == (
        DEFAULT_EXPERIMENT_DATASET_DIRECTORY
    )
    assert CERTExperimentDatasetLoader(tmp_path).dataset_directory == tmp_path


def test_loader_returns_validated_csv_rows_and_metadata(tmp_path: Path) -> None:
    root = _create_dataset(tmp_path / "subset")

    result = CERTExperimentDatasetLoader(root).load()

    assert isinstance(result, ExperimentDatasetLoadResult)
    assert [source.dataset for source in result.datasets] == [
        CERTDataset.DEVICE,
        CERTDataset.EMAIL,
        CERTDataset.FILE,
        CERTDataset.HTTP,
        CERTDataset.LDAP,
        CERTDataset.LOGON,
    ]
    assert all(isinstance(source, ValidatedCSVRows) for source in result.datasets)
    assert result.datasets[0].headers == tuple(ROOT_HEADERS)
    assert tuple(result.datasets[0].rows) == (
        {
            "id": "D1",
            "date": "01/01/2010 08:01:00",
            "user": "U1",
            "pc": "PC1",
            "activity": "Connect",
        },
    )
    ldap_rows = tuple(result.datasets[4].rows)
    assert result.datasets[4].headers == ("user_id", "employee_name")
    assert ldap_rows == ({"user_id": "U1", "employee_name": "Canonical User"},)

    metadata = result.metadata
    assert metadata.dataset_path == root.resolve()
    assert metadata.file_count == 6
    assert metadata.row_counts == (
        ("device.csv", 1),
        ("email.csv", 1),
        ("file.csv", 1),
        ("http.csv", 1),
        ("ldap.csv", 1),
        ("logon.csv", 1),
    )
    assert len(metadata.dataset_sha256) == 64
    assert metadata.loaded_at.tzinfo == UTC


def test_loader_ignores_unsupported_extensions_hidden_and_answers_paths(
    tmp_path: Path,
) -> None:
    root = _create_dataset(tmp_path / "subset")

    result = CERTExperimentDatasetLoader(root).load()

    loaded_paths = {path for path, _ in result.metadata.row_counts}
    assert loaded_paths == {
        "device.csv",
        "email.csv",
        "file.csv",
        "http.csv",
        "ldap.csv",
        "logon.csv",
    }


def test_loader_reads_canonical_insider_ground_truth_without_as_behavioral_data(
    tmp_path: Path,
) -> None:
    root = tmp_path / "subset"
    _write_csv(
        root / "logon.csv",
        ROOT_HEADERS,
        [["L1", "01/05/2010 08:00:00", "U1", "PC1", "Logon"]],
    )
    _write_csv(
        root / "answers" / "insiders.csv",
        ["dataset", "scenario", "details", "user", "start", "end"],
        [
            [
                "4.2",
                "1",
                "r4.2-1-U1.csv",
                "U1",
                "01/05/2010 10:00:00",
                "01/08/2010 12:00:00",
            ]
        ],
    )

    result = CERTExperimentDatasetLoader(root).load()

    assert tuple(source.dataset for source in result.datasets) == (CERTDataset.LOGON,)
    assert result.ground_truth is not None
    assert result.ground_truth.target_column == "insider"
    assert len(result.ground_truth.intervals) == 1
    interval = result.ground_truth.intervals[0]
    assert interval.subject_id == "U1"
    assert interval.start.isoformat(sep=" ") == "2010-01-05 10:00:00"
    assert interval.end.isoformat(sep=" ") == "2010-01-08 12:00:00"
    assert result.metadata.row_counts == (
        ("answers/insiders.csv", 1),
        ("logon.csv", 1),
    )
    assert result.metadata.file_count == 2


def test_loader_preserves_deterministic_file_order_and_row_order(
    tmp_path: Path,
) -> None:
    root = tmp_path / "subset"
    _write_csv(
        root / "logon.csv",
        ROOT_HEADERS,
        [
            ["L2", "01/01/2010 08:02:00", "U2", "PC2", "Logon"],
            ["L1", "01/01/2010 08:01:00", "U1", "PC1", "Logon"],
        ],
    )
    _write_csv(
        root / "ldap.csv",
        ["user_id", "role"],
        [["U0", "canonical"]],
    )
    _write_csv(
        root / "LDAP" / "z.csv",
        ["user_id", "role"],
        [["U2", "second"]],
    )
    _write_csv(
        root / "LDAP" / "nested" / "a.csv",
        ["user_id", "role"],
        [["U1", "first"]],
    )

    first = CERTExperimentDatasetLoader(root).load()
    second = CERTExperimentDatasetLoader(root).load()

    assert [name for name, _ in first.metadata.row_counts] == [
        "ldap.csv",
        "logon.csv",
    ]
    assert sum(source.dataset is CERTDataset.LDAP for source in first.datasets) == 1
    assert first.metadata.row_counts == second.metadata.row_counts
    assert first.metadata.dataset_sha256 == second.metadata.dataset_sha256
    logon = next(
        source for source in first.datasets if source.dataset is CERTDataset.LOGON
    )
    rows = tuple(logon.rows)
    assert [row["id"] for row in rows] == ["L2", "L1"]
    assert [
        (row_number, row["id"]) for row_number, row in enumerate(rows, start=2)
    ] == [
        (2, "L2"),
        (3, "L1"),
    ]


def test_loader_skips_ldap_snapshots_and_forwards_only_canonical_ldap(
    tmp_path: Path,
    caplog: pytest.LogCaptureFixture,
) -> None:
    root = tmp_path / "subset"
    _write_csv(root / "ldap.csv", ["user_id", "role"], [["U1", "canonical"]])
    _write_csv(root / "LDAP" / "nested" / "history.csv", ["user_id"], [["U2"]])
    _write_csv(root / "logon.csv", ROOT_HEADERS, [["L1", "date", "U1", "PC1", "Logon"]])

    with caplog.at_level("INFO"):
        loaded = CERTExperimentDatasetLoader(root).load()

    ldap_sources = tuple(
        source for source in loaded.datasets if source.dataset is CERTDataset.LDAP
    )
    assert len(ldap_sources) == 1
    assert loaded.metadata.row_counts == (("ldap.csv", 1), ("logon.csv", 1))
    assert tuple(ldap_sources[0].rows) == ({"user_id": "U1", "role": "canonical"},)
    assert "Skipping LDAP snapshot: ldap/nested/history.csv" in caplog.text

    feature_pipeline = Mock(spec=FeaturePipeline)
    ExperimentPipeline(
        feature_pipeline=cast(FeaturePipeline, feature_pipeline)
    ).feature_engineering(loaded.datasets)
    feature_pipeline.run.assert_called_once()
    forwarded_sources = feature_pipeline.run.call_args.args[0]
    assert forwarded_sources is loaded.datasets
    assert sum(source.dataset is CERTDataset.LDAP for source in forwarded_sources) == 1


@pytest.mark.parametrize(
    ("headers", "rows", "message"),
    [
        ([], [], "empty header row"),
        (["id", "user", "pc"], [], "missing required headers"),
        (["id", "", "user", "pc"], [], "empty header"),
        (["id", "date", "user", "USER", "pc"], [], "duplicate header"),
        (ROOT_HEADERS, [["1", "date", "user", "pc"]], "expected 5"),
    ],
)
def test_loader_rejects_invalid_headers_and_row_lengths(
    tmp_path: Path,
    headers: list[str],
    rows: list[list[str]],
    message: str,
) -> None:
    root = tmp_path / "subset"
    _write_csv(root / "logon.csv", headers, rows)

    with pytest.raises(ExperimentDatasetValidationError, match=message):
        CERTExperimentDatasetLoader(root).load()


def test_loader_rejects_empty_file_and_malformed_or_non_utf8_csv(
    tmp_path: Path,
) -> None:
    root = tmp_path / "subset"
    root.mkdir()
    (root / "logon.csv").write_bytes(b"")
    with pytest.raises(ExperimentDatasetValidationError, match="empty"):
        CERTExperimentDatasetLoader(root).load()

    _write_csv(root / "logon.csv", ROOT_HEADERS, [])
    (root / "logon.csv").write_text(
        'id,date,user,pc,activity\n"unfinished',
        encoding="utf-8",
    )
    with pytest.raises(ExperimentDatasetReadError, match="validate dataset CSV"):
        CERTExperimentDatasetLoader(root).load()

    (root / "logon.csv").write_bytes(b"\xff\xfe\xff")
    with pytest.raises(ExperimentDatasetReadError, match="validate dataset CSV"):
        CERTExperimentDatasetLoader(root).load()


def test_loader_skips_unsupported_csvs_and_loads_supported_files(
    tmp_path: Path,
    caplog: pytest.LogCaptureFixture,
) -> None:
    root = tmp_path / "subset"
    _write_csv(root / "psychometric.csv", ["user_id"], [["U1"]])
    _write_csv(root / "future_dataset.csv", ["value"], [["ignored"]])
    _write_csv(root / "logon.csv", ROOT_HEADERS, [["L1", "date", "U1", "PC1", "Logon"]])

    with caplog.at_level("INFO"):
        result = CERTExperimentDatasetLoader(root).load()

    assert tuple(source.dataset for source in result.datasets) == (CERTDataset.LOGON,)
    assert result.metadata.row_counts == (("logon.csv", 1),)
    assert "Skipping unsupported CERT dataset: psychometric.csv" in caplog.text
    assert "Skipping unsupported CERT dataset: future_dataset.csv" in caplog.text


def test_loader_rejects_missing_directory(tmp_path: Path) -> None:
    with pytest.raises(ExperimentDatasetNotFoundError):
        CERTExperimentDatasetLoader(tmp_path / "missing").load()


def test_dataset_hash_matches_ordered_file_content_hashes(tmp_path: Path) -> None:
    root = _create_dataset(tmp_path / "subset")
    result = CERTExperimentDatasetLoader(root).load()
    digest = hashlib.sha256()
    for relative_path, _ in result.metadata.row_counts:
        file_digest = hashlib.sha256((root / relative_path).read_bytes()).digest()
        digest.update(relative_path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(file_digest)

    assert result.metadata.dataset_sha256 == digest.hexdigest()


def test_pipeline_load_dataset_delegates_to_injected_loader(
    tmp_path: Path,
) -> None:
    expected = CERTExperimentDatasetLoader(_create_dataset(tmp_path / "subset")).load()

    class LoaderStub(ExperimentDatasetLoader):
        def __init__(self) -> None:
            self.received_path: Path | None = None

        def load(self, dataset_path: Path | None = None) -> ExperimentDatasetLoadResult:
            self.received_path = dataset_path
            return expected

    loader = LoaderStub()
    loaded = ExperimentPipeline(dataset_loader=loader).load_dataset(
        tmp_path / "selected"
    )

    assert loaded is expected
    assert loader.received_path == tmp_path / "selected"


def test_row_iterable_detects_source_change_after_validation(tmp_path: Path) -> None:
    root = tmp_path / "subset"
    _write_csv(root / "logon.csv", ROOT_HEADERS, [])
    result = CERTExperimentDatasetLoader(root).load()
    with (root / "logon.csv").open("a", encoding="utf-8") as stream:
        stream.write("extra\n")

    with pytest.raises(ExperimentDatasetReadError, match="changed after validation"):
        next(iter(result.datasets[0].rows))
