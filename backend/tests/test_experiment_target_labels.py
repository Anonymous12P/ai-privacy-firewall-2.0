"""Synthetic end-to-end coverage for CERT ground-truth target propagation."""

import csv
import json
from datetime import date, timedelta
from pathlib import Path

from pyarrow import parquet

from app.experiments import CERTExperimentDatasetLoader, ExperimentPipeline
from app.features.schemas import CERTDataset
from app.ml.schemas import MLPipelineResult
from app.models.schemas import ModelPipelineResult


def _write_csv(
    path: Path,
    headers: tuple[str, ...],
    rows: tuple[tuple[str, ...], ...],
) -> None:
    """Write a synthetic input CSV."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream, lineterminator="\n")
        writer.writerow(headers)
        writer.writerows(rows)


def _create_labeled_dataset(root: Path) -> None:
    first_day = date(2023, 1, 1)
    logon_rows = tuple(
        (
            f"L{offset:03}",
            f"{first_day + timedelta(days=offset):%m/%d/%Y} 08:00:00",
            "U001",
            f"PC{offset % 3}",
            "Logon",
        )
        for offset in range(24)
    )
    _write_csv(
        root / "logon.csv",
        ("id", "date", "user", "pc", "activity"),
        logon_rows,
    )
    _write_csv(
        root / "answers" / "insiders.csv",
        ("dataset", "scenario", "details", "user", "start", "end"),
        (
            (
                "4.2",
                "1",
                "synthetic-U001.csv",
                "U001",
                "01/06/2023 00:00:00",
                "01/12/2023 23:59:59",
            ),
        ),
    )


def test_target_is_preserved_in_feature_parquet_and_ml_preprocessing(
    tmp_path: Path,
) -> None:
    dataset_root = tmp_path / "cert_subset"
    feature_directory = tmp_path / "features"
    _create_labeled_dataset(dataset_root)
    pipeline = ExperimentPipeline(
        dataset_loader=CERTExperimentDatasetLoader(dataset_root)
    )

    loaded = pipeline.load_dataset()
    assert tuple(source.dataset for source in loaded.datasets) == (CERTDataset.LOGON,)
    assert loaded.ground_truth is not None
    engineered = pipeline.feature_engineering(
        loaded.datasets,
        ground_truth=loaded.ground_truth,
        output_directory=feature_directory,
    )

    assert engineered.encoded.target_column == "insider"
    expected_labels = tuple(
        (
            "insider"
            if date(2023, 1, 6) <= record.window_start <= date(2023, 1, 12)
            else "normal"
        )
        for record in engineered.encoded.records
    )
    assert tuple(record.label for record in engineered.encoded.records) == (
        expected_labels
    )

    feature_parquet = engineered.export.artifact_paths["features.parquet"]
    table = parquet.read_table(feature_parquet)
    assert "insider" in table.column_names
    assert table.column("insider").to_pylist() == list(expected_labels)
    feature_metadata = json.loads(
        engineered.export.artifact_paths["feature_metadata.json"].read_text(
            encoding="utf-8"
        )
    )
    assert feature_metadata["target_column"] == "insider"

    ml_result = pipeline.machine_learning(
        engineered,
        output_directory=tmp_path / "ml",
    )

    assert isinstance(ml_result, MLPipelineResult)
    assert ml_result.preprocessing.target_column == "insider"
    assert ml_result.preprocessing.feature_names == ml_result.split.train.feature_names
    assert ml_result.split.train.label_name == "insider"
    assert ml_result.split.validation.label_name == "insider"
    assert ml_result.split.test.label_name == "insider"
    assert {
        record.label
        for partition in (
            ml_result.split.train,
            ml_result.split.validation,
            ml_result.split.test,
        )
        for record in partition.records
    } == {"insider", "normal"}
    trained = pipeline.model_training(
        ml_result,
        selected_models=("LogisticRegression",),
        output_directory=tmp_path / "models",
    )
    assert isinstance(trained, ModelPipelineResult)
    assert trained.training.metadata.target_column == "insider"
