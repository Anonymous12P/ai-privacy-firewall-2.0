"""End-to-end tests for reproducible ML dataset preparation and export."""

import hashlib
import json
from dataclasses import replace
from pathlib import Path

import pytest
from pyarrow import parquet

from app.ml import (
    BalanceConfig,
    DatasetConfig,
    DatasetLoadConfig,
    MLExporter,
    MLPipeline,
    MLPipelineConfig,
    MLPipelineRequest,
    MLPipelineResult,
    PreprocessingConfig,
    SplitConfig,
)
from app.ml.exceptions import MLExportError, MLValidationError
from app.ml.metadata import build_reproducibility_metadata, source_sha256
from app.ml.validator import MLDatasetValidator


def test_default_export_directory_is_backend_data_ml() -> None:
    """Production exports resolve to the requested backend data location."""
    expected = Path(__file__).resolve().parents[1] / "data" / "ml"

    assert MLExporter().output_directory == expected


def _source_csv(path: Path) -> Path:
    """Create a real small, imbalanced feature dataset with reproducible rows."""
    lines = ["activity_count,risk_score,label"]
    lines.extend(
        f"{index},{index / 10:.1f},{'normal' if index < 30 else 'alert'}"
        for index in range(40)
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="")
    return path


def _request(source_path: Path) -> MLPipelineRequest:
    """Configure the full workflow, including train-only oversampling."""
    return MLPipelineRequest(
        config=MLPipelineConfig(
            dataset=DatasetLoadConfig(
                source=DatasetConfig(
                    name="cert-features",
                    path=source_path,
                    label_column="label",
                )
            ),
            split=SplitConfig(random_seed=17),
            balance=BalanceConfig(
                strategy="random_over",
                random_seed=29,
            ),
            preprocessing=PreprocessingConfig(scaling_strategy="standard"),
        )
    )


def _artifact_hashes(result: MLPipelineResult) -> dict[str, str]:
    """Collect completed export digests from an ML pipeline result."""
    assert result.export is not None
    export = result.export
    return {artifact.filename: artifact.sha256 for artifact in export.artifacts}


def test_pipeline_runs_all_stages_and_exports_reproducibly(tmp_path: Path) -> None:
    """The public run API produces stable outputs without changing source data."""
    source_path = _source_csv(tmp_path / "source.csv")
    source_bytes = source_path.read_bytes()
    output_directory = tmp_path / "ml-output"
    pipeline = MLPipeline(dataset_exporter=MLExporter(output_directory))
    request = _request(source_path)

    first = pipeline.run(request)
    first_hashes = _artifact_hashes(first)
    second = pipeline.run(request)

    assert first.run_id == second.run_id
    assert first_hashes == _artifact_hashes(second)
    assert source_path.read_bytes() == source_bytes
    assert first.validation is not None and first.validation.success
    assert first.reproducibility is not None
    assert (
        first.reproducibility.source_sha256 == hashlib.sha256(source_bytes).hexdigest()
    )
    assert first.balancing is not None
    assert first.balancing.strategy == "random_over"
    assert first.balancing.after_row_count > first.balancing.before_row_count
    assert len(first.split.train.records) == first.balancing.after_row_count
    assert first.reproducibility is not None
    assert len(first.split.validation.records) == (
        first.reproducibility.validation_row_count
    )
    assert first.export is not None
    assert first.export.output_directory == output_directory

    expected_artifact_names = {
        "cert-features_train.csv",
        "cert-features_train.parquet",
        "cert-features_validation.csv",
        "cert-features_validation.parquet",
        "cert-features_test.csv",
        "cert-features_test.parquet",
        "ml_metadata.json",
        "ml_summary.md",
        "ml_manifest.json",
    }
    assert set(first_hashes) == expected_artifact_names
    manifest = json.loads((output_directory / "ml_manifest.json").read_text())
    assert {item["filename"] for item in manifest["artifacts"]} == (
        expected_artifact_names - {"ml_manifest.json"}
    )
    assert all(len(item["sha256"]) == 64 for item in manifest["artifacts"])

    train_csv = output_directory / "cert-features_train.csv"
    assert train_csv.read_text(encoding="utf-8").splitlines()[0] == (
        "activity_count,risk_score,label"
    )
    train_parquet = parquet.read_table(output_directory / "cert-features_train.parquet")
    assert train_parquet.column_names == ["activity_count", "risk_score", "label"]
    assert train_parquet.num_rows == len(first.split.train.records)


def test_pipeline_accepts_in_memory_dataset_with_content_digest(
    tmp_path: Path,
) -> None:
    """Caller-supplied datasets get a deterministic content-based source hash."""
    source_path = _source_csv(tmp_path / "input.csv")
    pipeline = MLPipeline(dataset_exporter=MLExporter(tmp_path / "outputs"))
    loaded = pipeline.load_dataset(_request(source_path).config.dataset)
    memory_dataset = replace(
        loaded,
        metadata=replace(loaded.metadata, source_path=None, sha256=""),
    )
    config = _request(source_path).config
    in_memory_config = replace(
        config,
        dataset=DatasetLoadConfig(
            source=DatasetConfig(name="cert-features", label_column="label")
        ),
    )
    request = MLPipelineRequest(config=in_memory_config, dataset=memory_dataset)

    result = pipeline.run(request)

    assert result.reproducibility is not None
    assert result.reproducibility.source_sha256 == source_sha256(memory_dataset)


def test_export_rejects_path_like_dataset_names(tmp_path: Path) -> None:
    """Artifact naming cannot escape the configured export directory."""
    source_path = _source_csv(tmp_path / "source.csv")
    config = MLPipelineConfig(
        dataset=DatasetLoadConfig(
            source=DatasetConfig(
                name="../outside",
                path=source_path,
                label_column="label",
            )
        ),
        split=SplitConfig(random_seed=17),
        balance=BalanceConfig(strategy="none"),
        preprocessing=PreprocessingConfig(),
    )

    with pytest.raises(MLExportError, match="Dataset name"):
        MLPipeline(dataset_exporter=MLExporter(tmp_path / "exports")).run(
            MLPipelineRequest(config=config)
        )


def test_validator_detects_tampered_fingerprint(tmp_path: Path) -> None:
    """A changed reproducibility fingerprint blocks export-ready validation."""
    source_path = _source_csv(tmp_path / "source.csv")
    request = _request(source_path)
    pipeline = MLPipeline(dataset_exporter=MLExporter(tmp_path / "first"))
    source = pipeline.load_dataset(request.config.dataset)
    split = pipeline.split_dataset(source, request.config.split)
    balanced = pipeline.balance_split(split, request.config.balance)
    prepared = pipeline.preprocess(balanced, request.config.preprocessing)
    metadata = build_reproducibility_metadata(
        request.config.dataset.source.name,
        source,
        request.config,
        prepared,
    )
    tampered = replace(metadata, fingerprint="0" * 64)
    with pytest.raises(MLValidationError, match="fingerprint"):
        MLDatasetValidator().validate(
            source,
            split,
            balanced,
            prepared,
            tampered,
            request.config,
        )

    altered_record = replace(
        prepared.train.records[0],
        values=(999.0, *prepared.train.records[0].values[1:]),
    )
    altered_train = replace(
        prepared.train,
        records=(altered_record, *prepared.train.records[1:]),
    )
    altered_prepared = replace(prepared, train=altered_train)
    altered_metadata = build_reproducibility_metadata(
        request.config.dataset.source.name,
        source,
        request.config,
        altered_prepared,
    )
    with pytest.raises(MLValidationError, match="preprocessing integrity"):
        MLDatasetValidator().validate(
            source,
            split,
            balanced,
            altered_prepared,
            altered_metadata,
            request.config,
        )
