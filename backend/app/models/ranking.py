"""Deterministic metric ranking for model comparison results."""

import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Literal, Protocol

from app.models.exceptions import ModelComparisonError

type RankingMetric = Literal[
    "accuracy",
    "precision",
    "recall",
    "f1_score",
    "roc_auc",
    "pr_auc",
    "log_loss",
]

_HIGHER_IS_BETTER: tuple[RankingMetric, ...] = (
    "accuracy",
    "precision",
    "recall",
    "f1_score",
    "roc_auc",
    "pr_auc",
)
_TIE_BREAKERS: tuple[str, ...] = (
    "roc_auc",
    "precision",
    "recall",
    "accuracy",
    "model_size_bytes",
    "prediction_time_seconds",
)


@dataclass(frozen=True, slots=True)
class RankingConfig:
    """Configure the primary metric used to sort model comparison rows."""

    primary_metric: RankingMetric = "f1_score"

    def __post_init__(self) -> None:
        """Validate supported ranking metrics."""
        if self.primary_metric not in (*_HIGHER_IS_BETTER, "log_loss"):
            raise ModelComparisonError(
                f"Unsupported primary ranking metric: {self.primary_metric!r}."
            )


class Rankable(Protocol):
    """Describe values consumed by the deterministic ranking function."""

    @property
    def model_name(self) -> str: ...

    @property
    def metrics(self) -> Mapping[str, float | None]: ...

    @property
    def model_size_bytes(self) -> int: ...

    @property
    def prediction_time_seconds(self) -> float: ...


def rank_models(
    results: Sequence[Rankable],
    config: RankingConfig | None = None,
) -> tuple[Rankable, ...]:
    """Return entries ranked with stable metric and name tie-breaks."""
    selected = config or RankingConfig()
    primary = selected.primary_metric
    higher_is_better = primary in _HIGHER_IS_BETTER

    def sort_key(result: Rankable) -> tuple[object, ...]:
        main_score = _metric_value(result.metrics, primary)
        primary_key: tuple[int, float] = (
            (0, -main_score)
            if higher_is_better and main_score is not None
            else (1, 0.0)
            if higher_is_better
            else (0, main_score)
            if main_score is not None
            else (1, 0.0)
        )
        tie_keys = tuple(
            _descending_metric_key(result.metrics, name)
            if name in _HIGHER_IS_BETTER
            else _ascending_value_key(getattr(result, name, None))
            for name in _TIE_BREAKERS
        )
        return (
            primary_key,
            *tie_keys,
            result.model_name.casefold(),
        )

    return tuple(sorted(results, key=sort_key))


def _metric_value(
    metrics: Mapping[str, float | None],
    name: str,
) -> float | None:
    """Return a finite metric value, treating null/nonfinite values as missing."""
    value = metrics.get(name)
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _descending_metric_key(
    metrics: Mapping[str, float | None],
    name: str,
) -> tuple[int, float]:
    """Sort a higher-is-better metric descending with missing values last."""
    value = _metric_value(metrics, name)
    return (0, -value) if value is not None else (1, 0.0)


def _ascending_value_key(value: object) -> tuple[int, float]:
    """Sort finite numeric size/timing values ascending with missing last."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return 1, 0.0
    number = float(value)
    return (0, number) if math.isfinite(number) else (1, 0.0)
