"""Sequential orchestration for experimental evaluation."""

import logging
import math
import time
from collections import Counter
from collections.abc import Callable, Iterable
from dataclasses import replace
from datetime import UTC, datetime
from pathlib import Path
from typing import cast

from app.core.constants import APP_LOGGER_NAME
from app.experiments.config import (
    SUPPORTED_EXPERIMENT_MODELS,
    ExperimentConfig,
)
from app.experiments.dataset_loader import (
    CERTExperimentDatasetLoader,
    ExperimentDatasetLoader,
)
from app.experiments.exceptions import (
    ExperimentConfigurationError,
    ExperimentExecutionError,
)
from app.experiments.schemas import (
    ExperimentArtifacts,
    ExperimentDatasetLoadResult,
    ExperimentEvaluationPartition,
    ExperimentExplainabilityReportResult,
    ExperimentExplainabilityResult,
    ExperimentFeatureEngineeringResult,
    ExperimentGlobalExplanation,
    ExperimentLocalExplanation,
    ExperimentMetadata,
    ExperimentMLPipelineResult,
    ExperimentModelComparisonResult,
    ExperimentModelName,
    ExperimentModelPipelineResult,
    ExperimentRankingMetric,
    ExperimentRunResult,
    ExperimentSHAPConfig,
    ExperimentSHAPResult,
)
from app.explainability.pipeline import ExplainabilityPipeline
from app.features.encoder import FeatureEncodingConfig
from app.features.pipeline import FeaturePipeline
from app.features.risk_scores import BehavioralRiskConfig
from app.features.schemas import (
    AggregationWindow,
    CERTGroundTruth,
    ValidatedCSVRows,
)
from app.features.temporal import TemporalFeatureConfig
from app.ml.exceptions import MLInvalidSchemaError, MLTargetColumnError
from app.ml.exporter import MLExporter
from app.ml.pipeline import MLPipeline
from app.ml.schemas import (
    BalanceConfig,
    DatasetConfig,
    DatasetLoadConfig,
    DatasetMetadata,
    MLDataset,
    MLPipelineConfig,
    MLPipelineRequest,
    MLRecord,
    PreprocessedSplitResult,
    PreprocessingConfig,
    SplitConfig,
)
from app.models.base import Model
from app.models.exceptions import ModelTrainingError
from app.models.persistence import ModelPersistence
from app.models.pipeline import ModelPipeline
from app.models.schemas import (
    ModelConfig,
    ModelPipelineResult,
    ModelTrainingConfig,
    ModelTrainingRequest,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.experiments.pipeline")
MLPipelineFactory = Callable[[Path | None], MLPipeline]
ModelPipelineFactory = Callable[[Path | None, ModelPersistence | None], ModelPipeline]
ExplainabilityPipelineFactory = Callable[[Path | None], ExplainabilityPipeline]
_EXPERIMENT_MODEL_NAMES: dict[str, ExperimentModelName] = {
    name: name for name in SUPPORTED_EXPERIMENT_MODELS
}


def _create_ml_pipeline(output_directory: Path | None) -> MLPipeline:
    """Create the existing ML pipeline with its configured artifact exporter."""
    return MLPipeline(dataset_exporter=MLExporter(output_directory))


def _create_model_pipeline(
    output_directory: Path | None,
    persistence: ModelPersistence | None,
) -> ModelPipeline:
    """Create the existing model pipeline with configured persistence options."""
    return ModelPipeline(
        persistence=persistence,
        artifact_directory=output_directory,
    )


def _create_explainability_pipeline(
    output_directory: Path | None,
) -> ExplainabilityPipeline:
    """Create the existing explainability pipeline for an output location."""
    return ExplainabilityPipeline(output_directory=output_directory)


class ExperimentPipeline:
    """Orchestrate the dataset, feature, ML, model, and explanation stages.

    The workflow connects stages in this order:
    Dataset -> FeaturePipeline -> MLPipeline -> ModelPipeline ->
    ModelPipeline comparison -> ExplainabilityPipeline.
    """

    def __init__(
        self,
        dataset_loader: ExperimentDatasetLoader | None = None,
        feature_pipeline: FeaturePipeline | None = None,
        ml_pipeline_factory: MLPipelineFactory | None = None,
        model_pipeline_factory: ModelPipelineFactory | None = None,
        explainability_pipeline_factory: ExplainabilityPipelineFactory | None = None,
    ) -> None:
        """Create the pipeline boundary with injectable stage implementations."""
        self._dataset_loader = (
            dataset_loader
            if dataset_loader is not None
            else CERTExperimentDatasetLoader()
        )
        self._feature_pipeline = (
            feature_pipeline if feature_pipeline is not None else FeaturePipeline()
        )
        self._ml_pipeline_factory = ml_pipeline_factory or _create_ml_pipeline
        self._model_pipeline_factory = model_pipeline_factory or _create_model_pipeline
        self._comparison_partitions: PreprocessedSplitResult | None = None
        self._comparison_training_results: tuple[ModelPipelineResult, ...] = ()
        self._explainability_dataset: MLDataset | None = None
        self._explainability_training_results: tuple[ModelPipelineResult, ...] = ()
        self._explainability_pipeline_factory = (
            explainability_pipeline_factory or _create_explainability_pipeline
        )

    def load_dataset(
        self,
        dataset_path: Path | None = None,
    ) -> ExperimentDatasetLoadResult:
        """Load validated CERT rows through the injected dataset loader."""
        logger.info(
            "Experiment dataset loading started: path=%s",
            dataset_path or "configured default",
        )
        return self._dataset_loader.load(dataset_path)

    def feature_engineering(
        self,
        sources: ValidatedCSVRows | Iterable[ValidatedCSVRows],
        window: AggregationWindow = AggregationWindow.DAILY,
        *,
        temporal_config: TemporalFeatureConfig | None = None,
        risk_config: BehavioralRiskConfig | None = None,
        encoding_config: FeatureEncodingConfig | None = None,
        ground_truth: CERTGroundTruth | None = None,
        output_directory: Path | None = None,
    ) -> ExperimentFeatureEngineeringResult:
        """Delegate feature extraction through artifact export exactly once."""
        logger.info("Experiment feature engineering delegation started.")
        if ground_truth is not None:
            return self._feature_pipeline.run(
                sources,
                window,
                temporal_config=temporal_config,
                risk_config=risk_config,
                encoding_config=encoding_config,
                ground_truth=ground_truth,
                output_directory=output_directory,
            )
        return self._feature_pipeline.run(
            sources,
            window,
            temporal_config=temporal_config,
            risk_config=risk_config,
            encoding_config=encoding_config,
            output_directory=output_directory,
        )

    def machine_learning(
        self,
        feature_result: ExperimentFeatureEngineeringResult,
        *,
        dataset_load_config: DatasetLoadConfig | None = None,
        split_config: SplitConfig | None = None,
        balance_config: BalanceConfig | None = None,
        preprocessing_config: PreprocessingConfig | None = None,
        output_directory: Path | None = None,
    ) -> ExperimentMLPipelineResult:
        """Adapt encoded features to the ML input contract and delegate once."""
        encoded = feature_result.encoded
        if encoded.target_column is None or any(
            record.label is None for record in encoded.records
        ):
            raise ExperimentConfigurationError(
                "Supervised model training cannot proceed because the experiment "
                "dataset contains no target column or target labels. Provide the "
                "CERT answers/insiders.csv ground truth."
            )
        selected_dataset_config = dataset_load_config or DatasetLoadConfig(
            source=DatasetConfig(
                name="experiment-features",
                path=feature_result.export.artifact_paths.get("features.parquet"),
                feature_columns=encoded.feature_names,
                label_column=encoded.target_column,
            ),
            format="parquet",
        )
        source_config = selected_dataset_config.source
        target_column = source_config.label_column or encoded.target_column
        if target_column != encoded.target_column:
            raise MLTargetColumnError(
                f"Configured target column {target_column!r} does not match the "
                f"encoded target {encoded.target_column!r}."
            )
        if source_config.label_column is None:
            source_config = replace(source_config, label_column=target_column)
            selected_dataset_config = replace(
                selected_dataset_config,
                source=source_config,
            )
        requested_features = set(source_config.feature_columns)
        if target_column in requested_features:
            raise MLInvalidSchemaError(
                "The target column must not also be selected as a feature."
            )
        missing_features = requested_features - set(encoded.feature_names)
        if missing_features:
            raise MLInvalidSchemaError(
                "Configured feature columns are missing: "
                f"{', '.join(sorted(missing_features))}."
            )
        feature_indexes = tuple(
            index
            for index, name in enumerate(encoded.feature_names)
            if name != target_column
            and (not requested_features or name in requested_features)
        )
        feature_names = tuple(encoded.feature_names[index] for index in feature_indexes)
        if not feature_names:
            raise MLInvalidSchemaError(
                "The experiment dataset must contain at least one feature column."
            )
        records = tuple(
            MLRecord(
                subject_id=f"{record.subject_id}_{row_number:06d}",
                values=tuple(record.values[index] for index in feature_indexes),
                label=record.label,
            )
            for row_number, record in enumerate(encoded.records, start=1)
        )
        class_distribution = dict(
            sorted(
                Counter(
                    str(record.label) for record in records if record.label is not None
                ).items()
            )
        )
        dataset = MLDataset(
            feature_names=feature_names,
            records=records,
            label_name=target_column,
            metadata=DatasetMetadata(
                source_path=source_config.path,
                file_format=selected_dataset_config.format,
                sha256=feature_result.export.sha256.get("features.parquet", ""),
                row_count=len(encoded.records),
                column_count=len(encoded.feature_names) + 1,
                column_names=(*encoded.feature_names, target_column),
                feature_names=feature_names,
                numerical_columns=feature_names,
                class_distribution=class_distribution,
            ),
        )
        selected_split_config = split_config or SplitConfig()
        request = MLPipelineRequest(
            config=MLPipelineConfig(
                dataset=selected_dataset_config,
                split=selected_split_config,
                balance=balance_config or BalanceConfig(),
                preprocessing=preprocessing_config or PreprocessingConfig(),
            ),
            dataset=dataset,
        )
        logger.info(
            "Experiment ML pipeline delegation started: rows=%d, features=%d",
            len(dataset.records),
            len(dataset.feature_names),
        )
        ml_pipeline = self._ml_pipeline_factory(output_directory)
        return ml_pipeline.run(request)

    def model_training(
        self,
        ml_result: ExperimentMLPipelineResult,
        *,
        selected_models: tuple[ExperimentModelName, ...] = ("LogisticRegression",),
        random_seed: int = 42,
        output_directory: Path | None = None,
        persistence: ModelPersistence | None = None,
        training_configs: tuple[ModelTrainingConfig, ...] = (),
    ) -> ExperimentModelPipelineResult | tuple[ExperimentModelPipelineResult, ...]:
        """Delegate each selected model to the existing model pipeline."""
        selected = tuple(selected_models)
        if not selected:
            raise ModelTrainingError("At least one model must be selected.")
        unsupported = tuple(
            name for name in selected if name not in SUPPORTED_EXPERIMENT_MODELS
        )
        if unsupported:
            raise ModelTrainingError(
                f"Unsupported experiment model selection: {', '.join(unsupported)}."
            )
        if len(set(selected)) != len(selected):
            raise ModelTrainingError("Selected models must not contain duplicates.")

        supplied_configs = {config.model.name: config for config in training_configs}
        if len(supplied_configs) != len(training_configs):
            raise ModelTrainingError("Training configs must have unique model names.")
        unexpected_configs = set(supplied_configs) - set(selected)
        if unexpected_configs:
            raise ModelTrainingError(
                "Training configs were provided for unselected models: "
                f"{', '.join(sorted(unexpected_configs))}."
            )

        split = ml_result.split
        partitions = (split.train, split.validation, split.test)
        configured_targets = {
            config.target_column
            for config in supplied_configs.values()
            if config.target_column is not None
        }
        if len(configured_targets) > 1:
            raise ModelTrainingError(
                "Selected model training configs must use the same target column."
            )
        target_column = next(iter(configured_targets), None)
        if target_column is None:
            target_column = (
                ml_result.preprocessing.target_column or split.train.label_name
            )
        if target_column is not None:
            adapted_partitions = tuple(
                (
                    partition
                    if partition.label_name == target_column
                    else replace(partition, label_name=target_column)
                )
                for partition in partitions
            )
        else:
            adapted_partitions = partitions
        prepared = PreprocessedSplitResult(
            train=adapted_partitions[0],
            validation=adapted_partitions[1],
            test=adapted_partitions[2],
            metadata=ml_result.preprocessing,
        )
        self._comparison_partitions = None
        self._comparison_training_results = ()
        model_pipeline = self._model_pipeline_factory(output_directory, persistence)
        results: list[ExperimentModelPipelineResult] = []
        for model_name in selected:
            training_config = supplied_configs.get(model_name)
            if training_config is None:
                training_config = ModelTrainingConfig(
                    model=ModelConfig(name=model_name),
                    random_seed=random_seed,
                )
            logger.info(
                "Experiment model pipeline delegation started: model=%s, seed=%d",
                model_name,
                training_config.random_seed,
            )
            request = ModelTrainingRequest(
                dataset=prepared,
                config=training_config,
            )
            results.append(model_pipeline.run(request))
        self._comparison_partitions = prepared
        self._comparison_training_results = tuple(results)
        self._explainability_dataset = prepared.test
        self._explainability_training_results = tuple(results)
        if len(results) == 1:
            return results[0]
        return tuple(results)

    def compare_models(
        self,
        trained_models: (
            ExperimentModelPipelineResult | tuple[ExperimentModelPipelineResult, ...]
        ),
        *,
        output_directory: Path | None = None,
        primary_metric: ExperimentRankingMetric = "f1_score",
        evaluation_partition: ExperimentEvaluationPartition = "test",
        random_seed: int = 42,
        generate_chart: bool = True,
        model_configs: tuple[ModelConfig, ...] | None = None,
    ) -> ExperimentModelComparisonResult:
        """Delegate comparison for results from this pipeline's training call.

        The models package comparison contract consumes prepared partitions,
        not training results. The latest training call's partitions are reused,
        and its result objects identify the model configurations to compare.
        """
        supplied_results = (
            trained_models if isinstance(trained_models, tuple) else (trained_models,)
        )
        if not self._comparison_training_results or self._comparison_partitions is None:
            raise ExperimentExecutionError(
                "Model comparison requires a successful model_training() call "
                "on this ExperimentPipeline instance."
            )
        if len(supplied_results) != len(self._comparison_training_results) or any(
            supplied is not trained
            for supplied, trained in zip(
                supplied_results,
                self._comparison_training_results,
                strict=True,
            )
        ):
            raise ExperimentExecutionError(
                "Model comparison results must be the exact outputs from the "
                "latest model_training() call."
            )

        selected_configs = model_configs
        if selected_configs is None:
            configs: list[ModelConfig] = []
            for result in supplied_results:
                model_name = _EXPERIMENT_MODEL_NAMES.get(
                    result.training.metadata.model_name
                )
                if model_name is None:
                    raise ExperimentExecutionError(
                        "A trained result contains an unsupported comparison model: "
                        f"{result.training.metadata.model_name!r}."
                    )
                configs.append(
                    ModelConfig(
                        name=model_name,
                        hyperparameters=result.training.metadata.hyperparameters,
                    )
                )
            selected_configs = tuple(configs)

        model_pipeline = self._model_pipeline_factory(output_directory, None)
        logger.info(
            "Experiment model comparison delegation started: models=%d, metric=%s",
            len(supplied_results),
            primary_metric,
        )
        return model_pipeline.compare_models(
            self._comparison_partitions,
            output_directory,
            model_configs=selected_configs,
            primary_metric=primary_metric,
            evaluation_partition=evaluation_partition,
            random_seed=random_seed,
            generate_chart=generate_chart,
        )

    def explainability(
        self,
        trained_models: (
            ExperimentModelPipelineResult | tuple[ExperimentModelPipelineResult, ...]
        ),
        *,
        shap_config: ExperimentSHAPConfig | None = None,
        dataset: MLDataset | None = None,
        local_sample_index: int | None = 0,
        output_directory: Path | None = None,
    ) -> ExperimentExplainabilityResult | tuple[ExperimentExplainabilityResult, ...]:
        """Delegate SHAP, importance, local explanations, and reporting.

        The existing explainability package exposes SHAP configuration and
        output-directory parameters. Report and visualization behavior is
        configured internally by its existing report pipeline.
        """
        supplied_results = (
            trained_models if isinstance(trained_models, tuple) else (trained_models,)
        )
        if (
            not self._explainability_training_results
            or self._explainability_dataset is None
        ):
            raise ExperimentExecutionError(
                "Explainability requires a successful model_training() call "
                "on this ExperimentPipeline instance."
            )
        if len(supplied_results) != len(self._explainability_training_results) or any(
            supplied is not trained
            for supplied, trained in zip(
                supplied_results,
                self._explainability_training_results,
                strict=True,
            )
        ):
            raise ExperimentExecutionError(
                "Explainability results must be the exact outputs from the "
                "latest model_training() call."
            )

        explanation_dataset = dataset or self._explainability_dataset
        if local_sample_index is not None and not (
            0 <= local_sample_index < len(explanation_dataset.records)
        ):
            raise ExperimentExecutionError(
                "local_sample_index must identify a row in the explanation dataset."
            )

        explainability_pipeline = self._explainability_pipeline_factory(
            output_directory
        )
        results: list[ExperimentExplainabilityResult] = []
        for trained_result in supplied_results:
            trained_model = trained_result.training.trained_model
            if not isinstance(trained_model, Model):
                raise ExperimentExecutionError(
                    "The model training result does not contain a supported "
                    "trained Model instance."
                )
            model_name = trained_result.training.metadata.model_name
            logger.info(
                "Experiment explainability delegation started: model=%s, rows=%d",
                model_name,
                len(explanation_dataset.records),
            )
            shap_result: ExperimentSHAPResult = explainability_pipeline.generate_shap(
                trained_model,
                explanation_dataset,
                shap_config,
            )
            global_explanation: ExperimentGlobalExplanation = (
                explainability_pipeline.global_importance(
                    trained_model,
                    explanation_dataset,
                    shap_config,
                    output_directory,
                )
            )
            local_explanation: ExperimentLocalExplanation | None = None
            if local_sample_index is not None:
                encoded_matrix = _numeric_feature_matrix(explanation_dataset)
                local_explanation = explainability_pipeline.local_explanation(
                    trained_model,
                    encoded_matrix,
                    local_sample_index,
                    shap_config,
                    output_directory,
                )
            report: ExperimentExplainabilityReportResult = (
                explainability_pipeline.generate_reports(
                    shap_result,
                    global_explanation,
                    local_explanation,
                    output_directory,
                )
            )
            results.append(
                ExperimentExplainabilityResult(
                    model_name=model_name,
                    shap=shap_result,
                    global_explanation=global_explanation,
                    local_explanation=local_explanation,
                    report=report,
                )
            )
        if len(results) == 1:
            return results[0]
        return tuple(results)

    def run(
        self,
        config: ExperimentConfig,
        *,
        window: AggregationWindow = AggregationWindow.DAILY,
        temporal_config: TemporalFeatureConfig | None = None,
        risk_config: BehavioralRiskConfig | None = None,
        encoding_config: FeatureEncodingConfig | None = None,
        dataset_load_config: DatasetLoadConfig | None = None,
        split_config: SplitConfig | None = None,
        balance_config: BalanceConfig | None = None,
        preprocessing_config: PreprocessingConfig | None = None,
        training_configs: tuple[ModelTrainingConfig, ...] = (),
        persistence: ModelPersistence | None = None,
        primary_metric: ExperimentRankingMetric = "f1_score",
        evaluation_partition: ExperimentEvaluationPartition = "test",
        comparison_model_configs: tuple[ModelConfig, ...] | None = None,
        generate_chart: bool = True,
        shap_config: ExperimentSHAPConfig | None = None,
        explanation_dataset: MLDataset | None = None,
        local_sample_index: int | None = 0,
    ) -> ExperimentRunResult:
        """Run all stages sequentially, preserving each stage's result object."""
        started = time.perf_counter()
        selected_models = tuple(config.selected_models)
        unsupported_models = tuple(
            name for name in selected_models if name not in SUPPORTED_EXPERIMENT_MODELS
        )
        if not selected_models or unsupported_models:
            raise ExperimentConfigurationError(
                "selected_models must contain one or more supported models: "
                f"{', '.join(SUPPORTED_EXPERIMENT_MODELS)}."
            )

        dataset_result = self.load_dataset(config.dataset_path)
        if dataset_result.ground_truth is None:
            feature_result = self.feature_engineering(
                dataset_result.datasets,
                window,
                temporal_config=temporal_config,
                risk_config=risk_config,
                encoding_config=encoding_config,
                output_directory=config.feature_directory,
            )
        else:
            feature_result = self.feature_engineering(
                dataset_result.datasets,
                window,
                temporal_config=temporal_config,
                risk_config=risk_config,
                encoding_config=encoding_config,
                ground_truth=dataset_result.ground_truth,
                output_directory=config.feature_directory,
            )
        ml_result = self.machine_learning(
            feature_result,
            dataset_load_config=dataset_load_config,
            split_config=split_config,
            balance_config=balance_config,
            preprocessing_config=preprocessing_config,
            output_directory=config.output_directory,
        )
        trained_models = self.model_training(
            ml_result,
            selected_models=cast(tuple[ExperimentModelName, ...], selected_models),
            random_seed=config.random_seed,
            output_directory=config.output_directory,
            persistence=persistence,
            training_configs=training_configs,
        )
        comparison_result = self.compare_models(
            trained_models,
            output_directory=config.output_directory,
            primary_metric=primary_metric,
            evaluation_partition=evaluation_partition,
            random_seed=config.random_seed,
            generate_chart=generate_chart,
            model_configs=comparison_model_configs,
        )
        explanation_results = self.explainability(
            trained_models,
            shap_config=shap_config,
            dataset=explanation_dataset,
            local_sample_index=local_sample_index,
            output_directory=config.explainability_directory,
        )
        completed_at = datetime.now(UTC)
        return ExperimentRunResult(
            config=config,
            metadata=ExperimentMetadata(
                experiment_name=config.experiment_name,
                dataset_path=config.dataset_path,
                random_seed=config.random_seed,
                selected_models=selected_models,
                generated_at=completed_at,
            ),
            artifacts=ExperimentArtifacts(),
            dataset=dataset_result,
            feature_engineering=feature_result,
            machine_learning=ml_result,
            model_training=trained_models,
            comparison=comparison_result,
            explainability=explanation_results,
            execution_duration_seconds=time.perf_counter() - started,
        )


def _numeric_feature_matrix(dataset: MLDataset) -> tuple[tuple[float, ...], ...]:
    """Adapt validated ML records to the local explainer's numeric matrix API."""
    matrix: list[tuple[float, ...]] = []
    for row_number, record in enumerate(dataset.records, start=1):
        if len(record.values) != len(dataset.feature_names):
            raise ExperimentExecutionError(
                f"Explanation row {row_number} does not match the feature schema."
            )
        values: list[float] = []
        for column_name, value in zip(
            dataset.feature_names, record.values, strict=True
        ):
            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not math.isfinite(value)
            ):
                raise ExperimentExecutionError(
                    f"Explanation feature {column_name!r} in row {row_number} "
                    "must be finite and numeric."
                )
            values.append(float(value))
        matrix.append(tuple(values))
    return tuple(matrix)
