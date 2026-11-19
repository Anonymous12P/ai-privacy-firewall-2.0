"""Deterministic selection of user identifiers."""

import math
import random
from collections.abc import Iterable

from app.dataset_subset.exceptions import InvalidSubsetPercentageError


def validate_percentage(percentage: float) -> None:
    """Require a finite percentage greater than zero and at most one hundred."""
    if (
        isinstance(percentage, bool)
        or not isinstance(percentage, (int, float))
        or not math.isfinite(percentage)
        or percentage <= 0
        or percentage > 100
    ):
        raise InvalidSubsetPercentageError(
            "subset_percentage must be a finite number in the range (0, 100]."
        )


def select_users(
    user_ids: Iterable[str],
    percentage: float = 10.0,
    seed: int = 42,
) -> tuple[str, ...]:
    """Select a reproducible, rounded-up percentage of unique user identifiers."""
    validate_percentage(percentage)
    if isinstance(seed, bool) or not isinstance(seed, int):
        raise TypeError("seed must be an integer.")

    users = sorted({user_id.strip() for user_id in user_ids if user_id.strip()})
    if not users:
        return ()

    selected_count = min(len(users), max(1, math.ceil(len(users) * percentage / 100)))
    return tuple(random.Random(seed).sample(users, selected_count))
