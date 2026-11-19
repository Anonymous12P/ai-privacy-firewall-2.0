"""Import and contract tests for the machine-learning architecture scaffold."""

import inspect
from importlib import import_module
from pathlib import Path

from app.ml import (
    BalanceConfig,
    DatasetBalancer,
    DatasetConfig,
    DatasetLoadConfig,
    DatasetPreprocessor,
    DatasetSchemaValidator,
    DatasetSplit,
    DatasetSplitter,
    MLDataset,
    MLDatasetLoader,
    MLDatasetValidator,
    MLExporter,
    MLLabel,
    MLPipeline,
    MLPipelineConfig,
    MLPipelineRequest,
    MLPipelineResult,
    MLRecord,
    MLValue,
    PreprocessedDataset,
    PreprocessingConfig,
    PreprocessingMetadata,
    SplitConfig,
)
from app.ml import __all__ as ml_public_names
from app.ml.exceptions import (
    MLBalancingError,
    MLDatasetError,
    MLError,
    MLPipelineError,
    MLPreprocessingError,
    MLSplitError,
)


def test_all_ml_modules_import() -> None:
    """Every requested ML architecture module is importable."""
    modules = tuple(
        import_module(f"app.ml.{module_name}")
        for module_name in (
            "balancer",
            "dataset",
            "exceptions",
            "exporter",
            "metadata",
            "pipeline",
            "preprocessor",
            "schemas",
            "splitter",
            "validator",
        )
    )
    assert len(modules) == 10
    assert isinstance(MLDatasetValidator(), MLDatasetValidator)


def test_schemas_and_configuration_can_be_instantiated() -> None:
    """Dataset, split, balance, and preprocessing contracts are typed values."""
    source = DatasetConfig(
        name="encoded-features",
        path=Path("data/processed/features.parquet"),
        feature_columns=("event_count", "risk_index"),
        label_column="label",
    )
    load_config = DatasetLoadConfig(source=source)
    split_config = SplitConfig(random_seed=17)
    balance_config = BalanceConfig(strategy="random_over")
    preprocessing_config = PreprocessingConfig(scaling_strategy="standard")
    pipeline_config = MLPipelineConfig(
        dataset=load_config,
        split=split_config,
        balance=balance_config,
        preprocessing=preprocessing_config,
    )
    feature_value: MLValue = 2.5
    label: MLLabel = "positive"
    record = MLRecord(
        subject_id="user-001",
        values=(feature_value, "category"),
        label=label,
    )
    dataset = MLDataset(
        feature_names=("event_count", "category"),
        records=(record,),
        label_name="label",
    )
    partition = DatasetSplit(train=dataset, validation=dataset, test=dataset)
    metadata = PreprocessingMetadata(
        feature_names=dataset.feature_names,
        strategy="standard",
        fitted=False,
    )
    preprocessed = PreprocessedDataset(dataset=dataset, metadata=metadata)
    request = MLPipelineRequest(config=pipeline_config, dataset=dataset)
    result = MLPipelineResult(
        split=partition,
        preprocessing=metadata,
        run_id="architecture-only",
    )

    assert request.config.dataset == load_config
    assert preprocessed.dataset == dataset
    assert result.split.train.records == (record,)


def test_contract_interfaces_are_abstract() -> None:
    """Stage boundaries are available but have no implementation behavior."""
    contracts = (
        DatasetBalancer,
        DatasetSchemaValidator,
        DatasetSplitter,
        DatasetPreprocessor,
        MLDatasetLoader,
    )

    assert all(contract.__abstractmethods__ for contract in contracts)
    assert not inspect.isabstract(MLPipeline)


def test_public_api_exports_contracts_and_exceptions() -> None:
    """Package __all__ exposes the declared public architecture surface."""
    public_names = (
        "BalanceConfig",
        "DatasetBalancer",
        "DatasetConfig",
        "DatasetLoadConfig",
        "DatasetSchemaValidator",
        "DatasetSplit",
        "DatasetSplitter",
        "DeterministicDatasetSplitter",
        "DatasetPreprocessor",
        "MLBalancingError",
        "MLDataset",
        "MLDatasetError",
        "MLDatasetLoader",
        "MLError",
        "MLPipeline",
        "MLPipelineConfig",
        "MLPipelineError",
        "MLPipelineRequest",
        "MLPipelineResult",
        "MLPreprocessingError",
        "MLExporter",
        "MLExportResult",
        "MLReproducibilityMetadata",
        "MLValidationResult",
        "MLDatasetValidator",
        "MLRecord",
        "MLSplitError",
        "PreprocessedDataset",
        "PreprocessingConfig",
        "PreprocessingMetadata",
        "SplitConfig",
        "SplitMetadata",
        "SplitResult",
    )

    assert all(name in ml_public_names for name in public_names)
    assert issubclass(MLError, Exception)
    assert issubclass(MLDatasetError, MLError)
    assert issubclass(MLSplitError, MLError)
    assert issubclass(MLBalancingError, MLError)
    assert issubclass(MLPreprocessingError, MLError)
    assert isinstance(MLExporter(), MLExporter)
    assert issubclass(MLPipelineError, MLError)
