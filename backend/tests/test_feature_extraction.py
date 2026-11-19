"""Tests for validated CERT row extraction and dataset routing."""

from collections.abc import Iterator
from datetime import date, datetime
from pathlib import Path

import pytest

from app.features import (
    AggregatedFeatureSet,
    AggregationWindow,
    BehavioralAggregator,
    BehavioralFeatureRecord,
    CERTCSVFeatureExtractor,
    CERTDataset,
    DeviceFeatureExtractor,
    EmailFeatureExtractor,
    FeatureAggregationError,
    FeatureColumnError,
    FeatureInputError,
    FeaturePipeline,
    FeaturePipelineResult,
    FeatureRecord,
    FeatureRowError,
    FeatureTimestampError,
    FileFeatureExtractor,
    HTTPFeatureExtractor,
    LDAPFeatureExtractor,
    LogonFeatureExtractor,
    ValidatedCSVRows,
)


@pytest.mark.parametrize(
    ("extractor_type", "dataset", "headers", "row"),
    [
        (
            LogonFeatureExtractor,
            CERTDataset.LOGON,
            ("id", "date", "user", "pc", "activity", "unknown"),
            {
                "id": "1",
                "date": "01/02/2010 07:10:00",
                "user": "alice",
                "pc": "PC-1",
                "activity": "Logon",
                "unknown": "ignored",
            },
        ),
        (
            FileFeatureExtractor,
            CERTDataset.FILE,
            ("date", "user", "pc", "filename"),
            {
                "date": "2010-01-02T07:10:00",
                "user": "alice",
                "pc": "PC-1",
                "filename": "file.txt",
            },
        ),
        (
            DeviceFeatureExtractor,
            CERTDataset.DEVICE,
            ("date", "user", "pc", "activity"),
            {
                "date": "2010-01-02 07:10:00",
                "user": "alice",
                "pc": "PC-1",
                "activity": "Connect",
            },
        ),
        (
            HTTPFeatureExtractor,
            CERTDataset.HTTP,
            ("date", "user", "pc", "url"),
            {
                "date": "2010-01-02T07:10:00Z",
                "user": "alice",
                "pc": "PC-1",
                "url": "https://example.invalid",
            },
        ),
        (
            EmailFeatureExtractor,
            CERTDataset.EMAIL,
            ("date", "user", "pc", "to", "content"),
            {
                "date": "2010-01-02",
                "user": "alice",
                "pc": "PC-1",
                "to": "bob@example.invalid",
                "content": "message",
            },
        ),
        (
            LDAPFeatureExtractor,
            CERTDataset.LDAP,
            ("user_id", "employee_name", "role", "unrecognized"),
            {
                "user_id": "alice",
                "employee_name": "Alice",
                "role": "Analyst",
                "unrecognized": "ignored",
            },
        ),
    ],
)
def test_dataset_extractors_create_typed_records(
    extractor_type: type[CERTCSVFeatureExtractor],
    dataset: CERTDataset,
    headers: tuple[str, ...],
    row: dict[str, str],
) -> None:
    """Each dataset extractor returns a typed record with known fields only."""
    result = extractor_type().extract(
        ValidatedCSVRows(dataset=dataset, headers=headers, rows=(row,))
    )

    assert isinstance(result, FeaturePipelineResult)
    assert result.dataset is dataset
    assert len(result.records) == 1
    record = result.records[0]
    assert record.dataset is dataset
    assert record.row_number == 2
    assert record.subject_id == "alice"
    assert "unrecognized" not in record.attributes
    if dataset is CERTDataset.LDAP:
        assert record.timestamp is None
        assert record.attributes["role"] == "Analyst"
    else:
        assert isinstance(record.timestamp, datetime)
        assert record.attributes.get("user") == "alice"


def test_feature_pipeline_routes_logon_rows() -> None:
    """Pipeline delegates validated input to the matching CERT extractor."""
    result = FeaturePipeline().extract(
        ValidatedCSVRows(
            dataset=CERTDataset.LOGON,
            headers=("date", "user", "pc"),
            rows=iter(
                [
                    {
                        "date": "2010-01-02T07:10:00",
                        "user": "alice",
                        "pc": "PC-1",
                    }
                ]
            ),
        )
    )

    assert result.records[0].subject_id == "alice"


def test_pipeline_consumes_single_pass_rows() -> None:
    """The engine consumes row iterables once without retaining input source."""
    consumed: list[int] = []

    def rows() -> Iterator[dict[str, str]]:
        """Yield one row while recording each source iteration."""
        for index in range(2):
            consumed.append(index)
            yield {
                "date": "2010-01-02T07:10:00",
                "user": f"user-{index}",
                "pc": "PC-1",
            }

    result = FeaturePipeline().extract(
        ValidatedCSVRows(
            dataset=CERTDataset.LOGON,
            headers=("date", "user", "pc"),
            rows=rows(),
        )
    )

    assert consumed == [0, 1]
    assert len(result.records) == 2


def test_missing_required_column_is_reported_at_header_row() -> None:
    """Required source headers are validated and reported as row one."""
    with pytest.raises(FeatureColumnError) as error:
        LogonFeatureExtractor().extract(
            ValidatedCSVRows(
                dataset=CERTDataset.LOGON,
                headers=("date", "user"),
                rows=(),
            )
        )

    assert error.value.row_number == 1
    assert "pc" in str(error.value)


@pytest.mark.parametrize(
    ("timestamp", "error_type"),
    [
        ("not-a-date", FeatureTimestampError),
        ("", FeatureTimestampError),
        (None, FeatureTimestampError),
    ],
)
def test_invalid_timestamps_include_source_row(
    timestamp: str | None,
    error_type: type[FeatureTimestampError],
) -> None:
    """Empty and malformed event timestamps identify their CSV row number."""
    row = {"date": timestamp, "user": "alice", "pc": "PC-1"}
    with pytest.raises(error_type) as error:
        LogonFeatureExtractor().extract(
            ValidatedCSVRows(
                dataset=CERTDataset.LOGON,
                headers=("date", "user", "pc"),
                rows=(row,),
            )
        )

    assert error.value.row_number == 2


def test_empty_required_row_value_is_rejected_with_row_number() -> None:
    """Blank required non-timestamp values produce a row-addressed error."""
    with pytest.raises(FeatureRowError) as error:
        DeviceFeatureExtractor().extract(
            ValidatedCSVRows(
                dataset=CERTDataset.DEVICE,
                headers=("date", "user", "pc"),
                rows=(
                    {
                        "date": "2010-01-02T07:10:00",
                        "user": "alice",
                        "pc": "",
                    },
                ),
            )
        )

    assert error.value.row_number == 2
    assert "pc" in str(error.value)


def test_duplicate_headers_are_rejected() -> None:
    """Header duplicates after case normalization fail before row iteration."""
    with pytest.raises(FeatureColumnError):
        LogonFeatureExtractor().extract(
            ValidatedCSVRows(
                dataset=CERTDataset.LOGON,
                headers=("date", "Date", "user", "pc"),
                rows=(),
            )
        )


def test_dataset_mismatch_is_rejected() -> None:
    """An extractor cannot be used against a different dataset family."""
    with pytest.raises(FeatureInputError):
        LogonFeatureExtractor().extract(
            ValidatedCSVRows(
                dataset=CERTDataset.FILE,
                headers=("date", "user", "pc"),
                rows=(),
            )
        )


def test_empty_dataset_returns_empty_result() -> None:
    """Valid headers and no rows produce a valid empty result."""
    result = LDAPFeatureExtractor().extract(
        ValidatedCSVRows(
            dataset=CERTDataset.LDAP,
            headers=("user_id", "role"),
            rows=(),
        )
    )

    assert result.records == ()


def test_extractor_ignores_unknown_columns_even_when_values_are_not_text() -> None:
    """Unrecognized columns do not affect the typed record."""
    result = LogonFeatureExtractor().extract(
        ValidatedCSVRows(
            dataset=CERTDataset.LOGON,
            headers=("date", "user", "pc"),
            rows=(
                {
                    "date": "2010-01-02T07:10:00",
                    "user": "alice",
                    "pc": "PC-1",
                    "unrecognized": 42,  # type: ignore[dict-item]
                },
            ),
        )
    )

    assert result.records[0].attributes == {
        "date": "2010-01-02T07:10:00",
        "pc": "PC-1",
        "user": "alice",
    }


def _event(
    dataset: CERTDataset,
    subject_id: str,
    timestamp: str,
    **attributes: str,
) -> FeatureRecord:
    """Create one typed event for aggregation tests."""
    return FeatureRecord(
        dataset=dataset,
        row_number=2,
        subject_id=subject_id,
        timestamp=datetime.fromisoformat(timestamp),
        attributes=attributes,
    )


def _dataset_result(
    dataset: CERTDataset,
    records: tuple[FeatureRecord, ...],
) -> FeaturePipelineResult:
    """Create a typed dataset extraction result for aggregation tests."""
    return FeaturePipelineResult(dataset=dataset, records=records)


@pytest.mark.parametrize(
    ("window", "expected_start", "expected_end"),
    [
        (AggregationWindow.DAILY, "2024-01-03", "2024-01-04"),
        (AggregationWindow.WEEKLY, "2024-01-01", "2024-01-08"),
        (AggregationWindow.MONTHLY, "2024-01-01", "2024-02-01"),
    ],
)
def test_aggregator_groups_by_configured_calendar_window(
    window: AggregationWindow,
    expected_start: str,
    expected_end: str,
) -> None:
    """Daily, Monday-start weekly, and calendar-month windows are supported."""
    result = _dataset_result(
        CERTDataset.LOGON,
        (
            _event(CERTDataset.LOGON, "alice", "2024-01-03T08:00:00", pc="PC-1"),
            _event(CERTDataset.LOGON, "alice", "2024-01-03T17:00:00", pc="PC-2"),
            _event(CERTDataset.LOGON, "alice", "2024-01-08T09:00:00", pc="PC-1"),
        ),
    )

    aggregated = BehavioralAggregator().aggregate((result,), window)

    expected_count = 1 if window is AggregationWindow.MONTHLY else 2
    assert len(aggregated.records) == expected_count
    first = aggregated.records[0]
    assert first.window_start.isoformat() == expected_start
    assert first.window_end.isoformat() == expected_end


def test_aggregator_merges_independently_aggregated_dataset_types() -> None:
    """Source event counts and unique entity counts remain dataset-specific."""
    logon = _dataset_result(
        CERTDataset.LOGON,
        (
            _event(CERTDataset.LOGON, "alice", "2024-01-03T08:00:00", pc="PC-1"),
            _event(CERTDataset.LOGON, "alice", "2024-01-03T09:00:00", pc="PC-1"),
        ),
    )
    file_events = _dataset_result(
        CERTDataset.FILE,
        (
            _event(
                CERTDataset.FILE,
                "alice",
                "2024-01-03T10:00:00",
                pc="PC-1",
                filename="a.txt",
            ),
            _event(
                CERTDataset.FILE,
                "alice",
                "2024-01-03T11:00:00",
                pc="PC-1",
                filename="b.txt",
            ),
        ),
    )

    aggregate = BehavioralAggregator().aggregate((file_events, logon))

    assert aggregate.source_datasets == (CERTDataset.FILE, CERTDataset.LOGON)
    assert len(aggregate.records) == 1
    record = aggregate.records[0]
    assert record.event_counts == {"file": 2, "logon": 2}
    assert record.unique_entity_counts == {
        "file.filename": 2,
        "file.pc": 1,
        "logon.pc": 1,
    }


def test_aggregator_carries_latest_ldap_attributes_to_user_windows() -> None:
    """LDAP values from the greatest row number are carried into each window."""
    events = _dataset_result(
        CERTDataset.LOGON,
        (
            _event(CERTDataset.LOGON, "alice", "2024-01-03T08:00:00", pc="PC-1"),
            _event(CERTDataset.LOGON, "alice", "2024-01-04T08:00:00", pc="PC-1"),
            _event(CERTDataset.LOGON, "bob", "2024-01-03T08:00:00", pc="PC-2"),
        ),
    )
    ldap = _dataset_result(
        CERTDataset.LDAP,
        (
            FeatureRecord(
                CERTDataset.LDAP,
                2,
                "alice",
                None,
                {"role": "Analyst", "department": "Finance"},
            ),
            FeatureRecord(
                CERTDataset.LDAP,
                3,
                "alice",
                None,
                {"role": "Senior Analyst", "department": "Finance"},
            ),
        ),
    )

    aggregate = BehavioralAggregator().aggregate((events, ldap))
    records_by_key = {
        (record.subject_id, record.window_start): record for record in aggregate.records
    }

    assert records_by_key[("alice", date(2024, 1, 3))].ldap_attributes["role"] == (
        "Senior Analyst"
    )
    assert (
        records_by_key[("alice", date(2024, 1, 4))].ldap_attributes["department"]
        == "Finance"
    )
    assert records_by_key[("bob", date(2024, 1, 3))].ldap_attributes == {}


def test_aggregator_tracks_first_and_last_timestamps_deterministically() -> None:
    """Records are sorted regardless of source row order."""
    result = _dataset_result(
        CERTDataset.HTTP,
        (
            _event(CERTDataset.HTTP, "alice", "2024-01-03T17:00:00", url="b"),
            _event(CERTDataset.HTTP, "alice", "2024-01-03T08:00:00", url="a"),
        ),
    )

    aggregate = BehavioralAggregator().aggregate((result,))

    assert aggregate.records[0].first_timestamp == datetime.fromisoformat(
        "2024-01-03T08:00:00"
    )
    assert aggregate.records[0].last_timestamp == datetime.fromisoformat(
        "2024-01-03T17:00:00"
    )


def test_aggregator_is_independent_of_dataset_input_order() -> None:
    """Merged output sorts sources, users, and calendar windows deterministically."""
    logon = _dataset_result(
        CERTDataset.LOGON,
        (_event(CERTDataset.LOGON, "zara", "2024-01-03T08:00:00", pc="PC-1"),),
    )
    http = _dataset_result(
        CERTDataset.HTTP,
        (_event(CERTDataset.HTTP, "alice", "2024-01-03T09:00:00", url="a"),),
    )

    first = BehavioralAggregator().aggregate((logon, http))
    second = BehavioralAggregator().aggregate((http, logon))

    assert first == second
    assert [record.subject_id for record in first.records] == ["alice", "zara"]


def test_aggregator_rejects_mixed_naive_and_aware_timestamps() -> None:
    """Chronologically ambiguous mixed timezone styles fail explicitly."""
    result = _dataset_result(
        CERTDataset.LOGON,
        (
            _event(CERTDataset.LOGON, "alice", "2024-01-03T08:00:00", pc="PC-1"),
            _event(
                CERTDataset.LOGON,
                "alice",
                "2024-01-03T09:00:00+00:00",
                pc="PC-1",
            ),
        ),
    )

    with pytest.raises(FeatureAggregationError):
        BehavioralAggregator().aggregate((result,))


def test_pipeline_runs_full_workflow_and_exports_features(tmp_path: Path) -> None:
    """Pipeline executes all feature stages and writes output artifacts."""
    result = FeaturePipeline().run(
        (
            ValidatedCSVRows(
                dataset=CERTDataset.LOGON,
                headers=("date", "user", "pc"),
                rows=(
                    {"date": "2024-01-03T08:00:00", "user": "alice", "pc": "PC-1"},
                    {"date": "2024-01-03T09:00:00", "user": "alice", "pc": "PC-2"},
                ),
            ),
        ),
        window=AggregationWindow.DAILY,
        output_directory=tmp_path / "processed",
    )

    assert isinstance(result.aggregated, AggregatedFeatureSet)
    assert isinstance(result.aggregated.records[0], BehavioralFeatureRecord)
    assert result.aggregated.records[0].event_counts == {"logon": 2}
    assert len(result.temporal.records) == len(result.risk.records) == 1
    assert result.export.artifact_paths["features.csv"].is_file()
    assert result.export.artifact_paths["features.parquet"].is_file()
