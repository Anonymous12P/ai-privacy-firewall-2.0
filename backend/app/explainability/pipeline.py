"""SHAP-focused orchestration for explainability requests."""

from collections.abc import Sequence
from pathlib import Path

import numpy as np
from numpy.typing import NDArray

from app.explainability.exceptions import ExplainerNotImplementedError
from app.explainability.report import (
    ExplainabilityReportResult,
)
from app.explainability.report import (
    generate_reports as create_explainability_reports,
)
from app.explainability.schemas import (
    ExplainabilityResult,
    ExplainerConfig,
    ExplanationRequest,
    GlobalExplanation,
    LocalExplanation,
)
from app.explainability.shap_explainer import ShapExplainer
from app.ml.schemas import MLDataset
from app.models.base import Model


class ExplainabilityPipeline:
    """Generate SHAP explanations and reserve other registered methods."""

    def __init__(
        self,
        shap_explainer: ShapExplainer | None = None,
        output_directory: Path | None = None,
    ) -> None:
        """Create a pipeline with an injectable SHAP implementation."""
        self._shap_explainer = shap_explainer or ShapExplainer()
        self._output_directory = output_directory or (
            Path(__file__).resolve().parents[2] / "data" / "explainability"
        )

    def generate_shap(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
    ) -> ExplainabilityResult:
        """Generate SHAP values and metadata for a supported model."""
        return self._shap_explainer.generate(model, dataset, config)

    def global_importance(
        self,
        model: Model,
        dataset: MLDataset,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
    ) -> GlobalExplanation:
        """Generate global SHAP statistics and write three report formats."""
        destination = output_directory or self._output_directory
        return self._shap_explainer.global_importance(
            model,
            dataset,
            config,
            output_directory=destination,
        )

    def local_explanation(
        self,
        model: Model,
        encoded_feature_matrix: Sequence[Sequence[float]] | NDArray[np.float64],
        sample_index: int,
        config: ExplainerConfig | None = None,
        output_directory: Path | None = None,
    ) -> LocalExplanation:
        """Explain one encoded row and write local JSON and Markdown reports."""
        destination = output_directory or self._output_directory
        return self._shap_explainer.local_explanation(
            model,
            encoded_feature_matrix,
            sample_index,
            config=config,
            output_directory=destination,
        )

    def generate_reports(
        self,
        shap_result: ExplainabilityResult,
        global_explanation: GlobalExplanation,
        local_explanation: LocalExplanation | None = None,
        output_directory: Path | None = None,
    ) -> ExplainabilityReportResult:
        """Generate SHAP reports, visualizations, summary, and manifest."""
        destination = output_directory or self._output_directory
        return create_explainability_reports(
            shap_result,
            global_explanation,
            destination,
            local_explanation,
        )

    def run(self, request: ExplanationRequest) -> ExplainabilityResult:
        """Run the selected explainer or report its explicit placeholder."""
        if request.config.explainer != "SHAP":
            raise ExplainerNotImplementedError(
                f"{request.config.explainer} explanations are not implemented yet."
            )
        return self.generate_shap(
            request.model,
            request.dataset,
            request.config,
        )
