"""End-to-end tests for feature validation, metadata, and artifact export."""

import csv
import hashlib
import json
from datetime import date
from pathlib import Path

import pyarrow.parquet as pq
import pytest

from app.features import (
    CERTDataset,
    FeaturePipeline,
    FeaturePipelineError,
    ValidatedCSVRows,
)
from app.features.exceptions import FeatureValidationError
from app.features.schemas import (
    EncodedFeatureRecord,
    EncodedFeatureSet,
    FeatureEncodingMetadata,
)
from app.features.validator import FeatureSetValidator


def _sources() -> tuple[ValidatedCSVRows, ...]:
    """Create input records with deterministic logon behavior."""
    return (
        ValidatedCSVRows(
            dataset=CERTDataset.LOGON,
            headers=("date", "user", "pc", "activity"),
            rows=(
                {
                    "date": "2024-01-03T08:00:00",
                    "user": "alice",
                    "pc": "PC-1",
                    "activity": "Logon",
                },
                {
                    "date": "2024-01-03T18:00:00",
                    "user": "alice",
                    "pc": "PC-1",
                    "activity": "Logoff",
                },
            ),
        ),
    )


def _digest(path: Path) -> str:
    """Compute SHA-256 for a generated artifact."""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_pipeline_exports_csv_parquet_metadata_summary_and_manifest(
    tmp_path: Path,
) -> None:
    """A complete run validates features and produces all expected artifacts."""
    output = tmp_path / "nested" / "processed"

    result = FeaturePipeline().run(_sources(), output_directory=output)

    expected_names = {
        "features.csv",
        "features.parquet",
        "feature_metadata.json",
        "feature_summary.md",
        "pipeline_manifest.json",
    }
    assert set(result.export.artifact_paths) == expected_names
    assert all(path.is_file() for path in result.export.artifact_paths.values())

    with result.export.artifact_paths["features.csv"].open(
        encoding="utf-8",
        newline="",
    ) as csv_file:
        rows = list(csv.reader(csv_file))
    assert rows[0] == list(result.encoded.feature_names)
    assert len(rows) == len(result.encoded.records) + 1

    table = pq.read_table(result.export.artifact_paths["features.parquet"])
    assert table.num_rows == len(result.encoded.records)
    assert tuple(table.column_names) == result.encoded.feature_names

    metadata = json.loads(
        result.export.artifact_paths["feature_metadata.json"].read_text(
            encoding="utf-8"
        )
    )
    assert metadata["source_datasets"] == ["logon"]
    assert metadata["source_record_counts"] == {"logon": 2}
    assert metadata["exported_row_count"] == 1
    assert "generated_at" in metadata

    manifest = json.loads(
        result.export.artifact_paths["pipeline_manifest.json"].read_text(
            encoding="utf-8"
        )
    )
    assert manifest["row_count"] == 1
    assert manifest["feature_count"] == len(result.encoded.feature_names)
    for artifact in manifest["artifacts"]:
        filename = artifact["filename"]
        assert artifact["sha256"] == _digest(output / filename)

    summary = result.export.artifact_paths["feature_summary.md"].read_text(
        encoding="utf-8"
    )
    assert "## Dataset Overview" in summary
    assert f"- Rows: {len(result.encoded.records)}" in summary


def test_dataset_artifacts_are_byte_reproducible_across_runs(
    tmp_path: Path,
) -> None:
    """Equivalent inputs produce identical CSV, Parquet, and summary bytes."""
    output = tmp_path / "processed"
    pipeline = FeaturePipeline()
    first = pipeline.run(_sources(), output_directory=output)
    first_hashes = dict(first.export.sha256)
    second = pipeline.run(_sources(), output_directory=output)

    for name in ("features.csv", "features.parquet", "feature_summary.md"):
        assert first_hashes[name] == second.export.sha256[name]


def test_pipeline_rejects_empty_source_collection(tmp_path: Path) -> None:
    """A full run cannot silently produce a misleading empty data export."""
    with pytest.raises(FeaturePipelineError, match="at least one source"):
        FeaturePipeline().run((), output_directory=tmp_path)


def test_validator_rejects_non_finite_numeric_features() -> None:
    """Invalid numeric payloads fail before any export starts."""
    encoded = EncodedFeatureSet(
        feature_names=("score",),
        records=(
            EncodedFeatureRecord(
                subject_id="alice",
                values=(float("nan"),),
                window_start=date(2024, 1, 1),
                window_end=date(2024, 1, 2),
            ),
        ),
        metadata=FeatureEncodingMetadata(
            strategy="one_hot",
            mappings={},
            encoded_columns={},
            numeric_columns=("score",),
            missing_policy="category",
            unseen_policy="unknown",
        ),
    )

    with pytest.raises(FeatureValidationError, match="non-finite"):
        FeatureSetValidator().validate(encoded)


def test_validator_rejects_mismatched_row_width() -> None:
    """Rows cannot be exported when their value count differs from schema."""
    encoded = EncodedFeatureSet(
        feature_names=("first", "second"),
        records=(
            EncodedFeatureRecord(
                subject_id="alice",
                values=(1.0,),
                window_start=date(2024, 1, 1),
                window_end=date(2024, 1, 2),
            ),
        ),
        metadata=FeatureEncodingMetadata(
            strategy="one_hot",
            mappings={},
            encoded_columns={},
            numeric_columns=("first", "second"),
            missing_policy="category",
            unseen_policy="unknown",
        ),
    )

    with pytest.raises(FeatureValidationError, match="expected 2"):
        FeatureSetValidator().validate(encoded)
