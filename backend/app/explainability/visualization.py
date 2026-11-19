"""Optional Matplotlib visualizations for typed SHAP explanation results."""

import importlib
import logging
from pathlib import Path
from types import ModuleType

from app.core.constants import APP_LOGGER_NAME
from app.explainability.exceptions import ExplainabilityError
from app.explainability.schemas import (
    ExplainabilityResult,
    GlobalExplanation,
    LocalExplanation,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.explainability")


def generate_visualizations(
    shap_result: ExplainabilityResult,
    global_explanation: GlobalExplanation,
    output_directory: Path,
    local_explanation: LocalExplanation | None = None,
) -> tuple[Path, ...]:
    """Write supported SHAP charts, returning no paths if Matplotlib is absent."""
    pyplot = _load_pyplot()
    if pyplot is None:
        logger.info("Skipping SHAP visualizations: Matplotlib is not installed.")
        return ()

    output_directory.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    try:
        paths.append(
            _bar_chart(
                pyplot,
                tuple(
                    (item.feature_name, item.mean_absolute_shap_value)
                    for item in global_explanation.feature_importance
                ),
                output_directory / "global_feature_importance.png",
                "Global SHAP Feature Importance",
            )
        )
        paths.append(
            _bar_chart(
                pyplot,
                tuple(
                    (item.feature_name, item.mean_absolute_shap_value)
                    for item in global_explanation.feature_importance[:10]
                ),
                output_directory / "top10_feature_importance.png",
                "Top 10 Global SHAP Features",
            )
        )
        if local_explanation is not None and local_explanation.sample_index is not None:
            paths.append(
                _bar_chart(
                    pyplot,
                    tuple(
                        (item.feature_name, item.contribution)
                        for item in local_explanation.feature_contributions
                    ),
                    output_directory
                    / f"local_explanation_{local_explanation.sample_index}.png",
                    (
                        "Local SHAP Explanation — Sample "
                        f"{local_explanation.sample_index}"
                    ),
                )
            )
    except (OSError, RuntimeError, ValueError, TypeError) as exc:
        raise ExplainabilityError(
            f"Unable to generate SHAP visualizations: {exc}"
        ) from exc
    finally:
        pyplot.close("all")

    return tuple(paths)


def _load_pyplot() -> ModuleType | None:
    """Import pyplot without requiring the optional Matplotlib dependency."""
    try:
        matplotlib = importlib.import_module("matplotlib")
        matplotlib.use("Agg")
        return importlib.import_module("matplotlib.pyplot")
    except ImportError:
        return None


def _bar_chart(
    pyplot: ModuleType,
    values: tuple[tuple[str, float], ...],
    path: Path,
    title: str,
) -> Path:
    """Render a bar chart with labels and a deterministic input order."""
    if not values:
        raise ExplainabilityError("Cannot create a feature chart without values.")
    figure, axis = pyplot.subplots(figsize=(10, max(4, len(values) * 0.35)))
    names = [name for name, _ in reversed(values)]
    scores = [score for _, score in reversed(values)]
    axis.barh(names, scores)
    axis.set_title(title)
    axis.set_xlabel("SHAP contribution")
    figure.tight_layout()
    figure.savefig(path, dpi=150)
    pyplot.close(figure)
    return path
