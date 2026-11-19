"""End-to-end feature dataset preparation and export orchestration."""

import logging

from app.core.constants import APP_LOGGER_NAME
from app.ml.balancer import ClassBalancer, DatasetBalancer
from app.ml.dataset import FeatureDatasetLoader, MLDatasetLoader
from app.ml.exporter import MLExporter
from app.ml.metadata import build_reproducibility_metadata
from app.ml.preprocessor import DatasetPreprocessor, ScalerDatasetPreprocessor
from app.ml.schemas import (
    BalanceConfig,
    BalancedSplitResult,
    DatasetLoadConfig,
    DatasetSplit,
    MLDataset,
    MLPipelineRequest,
    MLPipelineResult,
    PreprocessedSplitResult,
    PreprocessingConfig,
    SplitConfig,
    SplitResult,
)
from app.ml.splitter import DatasetSplitter, DeterministicDatasetSplitter
from app.ml.validator import MLDatasetValidator

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.ml.pipeline")


class MLPipeline:
    """Prepare, validate, and export deterministic ML dataset partitions."""

    def __init__(
        self,
        dataset_loader: MLDatasetLoader | None = None,
        dataset_splitter: DatasetSplitter | None = None,
        dataset_balancer: DatasetBalancer | None = None,
        dataset_preprocessor: DatasetPreprocessor | None = None,
        dataset_exporter: MLExporter | None = None,
        dataset_validator: MLDatasetValidator | None = None,
    ) -> None:
        """Create a pipeline boundary with injectable dataset stages."""
        self._dataset_loader = dataset_loader or FeatureDatasetLoader()
        self._dataset_splitter = dataset_splitter or DeterministicDatasetSplitter()
        self._dataset_balancer = dataset_balancer or ClassBalancer()
        self._dataset_preprocessor = dataset_preprocessor or ScalerDatasetPreprocessor()
        self._dataset_exporter = dataset_exporter or MLExporter()
        self._dataset_validator = dataset_validator or MLDatasetValidator()

    def load_dataset(self, config: DatasetLoadConfig) -> MLDataset:
        """Load and validate an engineered feature dataset using its config."""
        return self._dataset_loader.load(config)

    def split_dataset(
        self,
        dataset: MLDataset,
        config: SplitConfig | None = None,
    ) -> SplitResult:
        """Split a loaded dataset using the configured reproducible strategy."""
        selected_config = config or SplitConfig()
        return self._dataset_splitter.split(dataset, selected_config)

    def balance_split(
        self,
        split: SplitResult,
        config: BalanceConfig | None = None,
    ) -> BalancedSplitResult:
        """Balance only the training partition of an existing split."""
        return self._dataset_balancer.balance(split, config)

    def preprocess(
        self,
        split: SplitResult | BalancedSplitResult,
        config: PreprocessingConfig | None = None,
    ) -> PreprocessedSplitResult:
        """Fit preprocessing on training rows and transform all data splits."""
        return self._dataset_preprocessor.preprocess(
            split,
            config or PreprocessingConfig(),
        )

    def run(self, request: MLPipelineRequest) -> MLPipelineResult:
        """Run loading, splitting, balancing, preprocessing, validation, export."""
        logger.info(
            "ML dataset preparation started: dataset=%s",
            request.config.dataset.source.name,
        )
        source = request.dataset or self.load_dataset(request.config.dataset)
        split = self.split_dataset(source, request.config.split)
        balanced = self.balance_split(split, request.config.balance)
        prepared = self.preprocess(balanced, request.config.preprocessing)
        reproducibility = build_reproducibility_metadata(
            request.config.dataset.source.name,
            source,
            request.config,
            prepared,
        )
        validation = self._dataset_validator.validate(
            source,
            split,
            balanced,
            prepared,
            reproducibility,
            request.config,
        )
        export = self._dataset_exporter.export(prepared, reproducibility)
        logger.info(
            "ML dataset preparation completed: dataset=%s, fingerprint=%s",
            request.config.dataset.source.name,
            reproducibility.fingerprint,
        )
        return MLPipelineResult(
            split=DatasetSplit(
                train=prepared.train,
                validation=prepared.validation,
                test=prepared.test,
            ),
            preprocessing=prepared.metadata,
            run_id=reproducibility.fingerprint,
            balancing=balanced.metadata,
            reproducibility=reproducibility,
            validation=validation,
            export=export,
        )
