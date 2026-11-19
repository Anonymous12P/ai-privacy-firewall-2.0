"""Tests for ML feature dataset loading, schema checks, and metadata."""

import hashlib
from pathlib import Path

import pyarrow as pa
import pytest
from pyarrow import parquet

from app.ml import (
    DatasetConfig,
    DatasetLoadConfig,
    DatasetMetadata,
    FeatureDatasetLoader,
    MLDataset,
    MLPipeline,
)
from app.ml.exceptions import (
    MLDatasetNotFoundError,
    MLInvalidSchemaError,
    MLTargetColumnError,
    MLUnsupportedFormatError,
)
from app.ml.schemas import MLPipelineRequest, MLPipelineResult


class LoadOnlyPipeline(MLPipeline):
    """Expose the dataset-loading method without implementing the ML workflow."""

    def run(self, request: MLPipelineRequest) -> MLPipelineResult:
        """Keep workflow execution unavailable in dataset-loading tests."""
        raise NotImplementedError


def _csv_file(path: Path) -> Path:
    """Write a small UTF-8 table with numeric and categorical features."""
    path.write_text(
        "risk_index,department,label,optional\n"
        "12.5,finance,alert,\n"
        "0,engineering,normal,value\n"
        "7.25,finance,alert,last\n",
        encoding="utf-8",
        newline="",
    )
    return path


def test_loads_csv_and_computes_ordered_metadata(tmp_path: Path) -> None:
    """CSV loading preserves columns and rows while reporting feature metadata."""
    source_path = _csv_file(tmp_path / "engineered.csv")
    config = DatasetLoadConfig(
        source=DatasetConfig(name="engineered", path=source_path, label_column="label")
    )

    dataset = FeatureDatasetLoader().load(config)

    assert isinstance(dataset, MLDataset)
    assert dataset.feature_names == ("risk_index", "department", "optional")
    assert dataset.label_name == "label"
    assert [row.subject_id for row in dataset.records] == [
        "row-00000001",
        "row-00000002",
        "row-00000003",
    ]
    assert [row.values for row in dataset.records] == [
        (12.5, "finance", None),
        (0.0, "engineering", "value"),
        (7.25, "finance", "last"),
    ]
    assert [row.label for row in dataset.records] == ["alert", "normal", "alert"]
    metadata = dataset.metadata
    assert isinstance(metadata, DatasetMetadata)
    assert metadata.file_format == "csv"
    assert metadata.row_count == 3
    assert metadata.column_count == 4
    assert metadata.column_names == ("risk_index", "department", "label", "optional")
    assert metadata.numerical_columns == ("risk_index",)
    assert metadata.categorical_columns == ("department", "optional")
    assert metadata.missing_value_counts == {
        "department": 0,
        "label": 0,
        "optional": 1,
        "risk_index": 0,
    }
    assert metadata.class_distribution == {"alert": 2, "normal": 1}
    assert metadata.sha256 == hashlib.sha256(source_path.read_bytes()).hexdigest()


def test_feature_column_selection_preserves_file_order(tmp_path: Path) -> None:
    """Configured columns filter fields without changing source relative order."""
    source_path = _csv_file(tmp_path / "selected.csv")
    config = DatasetLoadConfig(
        source=DatasetConfig(
            name="selected",
            path=source_path,
            feature_columns=("optional", "risk_index"),
            label_column="label",
        )
    )

    dataset = FeatureDatasetLoader().load(config)

    assert dataset.feature_names == ("risk_index", "optional")
    assert dataset.records[0].values == (12.5, None)


def test_loads_parquet_with_format_inferred_from_suffix(tmp_path: Path) -> None:
    """Parquet inputs are detected and schema types are retained."""
    source_path = tmp_path / "features.parquet"
    parquet.write_table(
        pa.table(
            {
                "count": pa.array([1, 2], type=pa.int64()),
                "team": ["red", "blue"],
                "target": [True, False],
            }
        ),
        source_path,
    )

    dataset = FeatureDatasetLoader().load(
        DatasetLoadConfig(
            source=DatasetConfig(
                name="parquet-features",
                path=source_path,
                label_column="target",
            )
        )
    )

    assert dataset.metadata.file_format == "parquet"
    assert dataset.feature_names == ("count", "team")
    assert dataset.metadata.numerical_columns == ("count",)
    assert dataset.metadata.categorical_columns == ("team",)
    assert dataset.metadata.class_distribution == {"False": 1, "True": 1}
    assert [row.label for row in dataset.records] == [True, False]


def test_pipeline_exposes_configured_dataset_loading(tmp_path: Path) -> None:
    """MLPipeline delegates load_dataset to its injected/default loader."""
    source_path = _csv_file(tmp_path / "pipeline.csv")
    pipeline = LoadOnlyPipeline()

    dataset = pipeline.load_dataset(
        DatasetLoadConfig(
            source=DatasetConfig(
                name="pipeline", path=source_path, label_column="label"
            )
        )
    )

    assert dataset.metadata.row_count == 3
    assert dataset.label_name == "label"


def test_missing_file_raises_typed_error(tmp_path: Path) -> None:
    """Nonexistent paths raise the dedicated not-found exception."""
    config = DatasetLoadConfig(
        source=DatasetConfig(name="missing", path=tmp_path / "missing.csv")
    )

    with pytest.raises(MLDatasetNotFoundError):
        FeatureDatasetLoader().load(config)


def test_missing_target_column_raises_typed_error(tmp_path: Path) -> None:
    """A missing configured target is not silently treated as a feature."""
    config = DatasetLoadConfig(
        source=DatasetConfig(
            name="target-missing",
            path=_csv_file(tmp_path / "target.csv"),
            label_column="target",
        )
    )

    with pytest.raises(MLTargetColumnError, match="target"):
        FeatureDatasetLoader().load(config)


@pytest.mark.parametrize(
    ("filename", "configured_format"),
    (("features.txt", "auto"), ("features.csv", "parquet")),
)
def test_unsupported_format_raises_typed_error(
    tmp_path: Path,
    filename: str,
    configured_format: str,
) -> None:
    """Unsupported file formats and suffix conflicts are explicit."""
    source_path = tmp_path / filename
    source_path.write_text("a\n1\n", encoding="utf-8")
    config = DatasetLoadConfig(
        source=DatasetConfig(name="invalid-format", path=source_path),
        format=configured_format,  # type: ignore[arg-type]
    )

    with pytest.raises(MLUnsupportedFormatError):
        FeatureDatasetLoader().load(config)


def test_invalid_empty_dataset_schema_raises_typed_error(tmp_path: Path) -> None:
    """A header-only table is invalid as a training dataset."""
    source_path = tmp_path / "empty.csv"
    source_path.write_text("feature,label\n", encoding="utf-8")
    config = DatasetLoadConfig(
        source=DatasetConfig(name="empty", path=source_path, label_column="label")
    )

    with pytest.raises(MLInvalidSchemaError, match="data row"):
        FeatureDatasetLoader().load(config)


def test_invalid_requested_feature_column_raises_typed_error(tmp_path: Path) -> None:
    """Missing configured predictors are rejected before materializing rows."""
    config = DatasetLoadConfig(
        source=DatasetConfig(
            name="feature-missing",
            path=_csv_file(tmp_path / "feature.csv"),
            feature_columns=("unknown",),
        )
    )

    with pytest.raises(MLInvalidSchemaError, match="unknown"):
        FeatureDatasetLoader().load(config)


def test_invalid_utf8_csv_raises_typed_schema_error(tmp_path: Path) -> None:
    """CSV decoding failures are reported as invalid dataset input."""
    source_path = tmp_path / "bad-encoding.csv"
    source_path.write_bytes(b"feature\n\xff\n")
    config = DatasetLoadConfig(
        source=DatasetConfig(name="bad-encoding", path=source_path)
    )

    with pytest.raises(MLInvalidSchemaError):
        FeatureDatasetLoader().load(config)


def test_csv_loader_does_not_change_source_file(tmp_path: Path) -> None:
    """Loading and metadata calculation leave source bytes unchanged."""
    source_path = _csv_file(tmp_path / "immutable.csv")
    original = source_path.read_bytes()

    FeatureDatasetLoader().load(
        DatasetLoadConfig(
            source=DatasetConfig(
                name="immutable", path=source_path, label_column="label"
            )
        )
    )

    assert source_path.read_bytes() == original
