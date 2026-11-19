"""Tests for configurable categorical encoding of risk feature batches."""

from dataclasses import replace
from datetime import date

import pytest

from app.features import (
    AggregationWindow,
    EncodedFeatureSet,
    FeatureEncoder,
    FeatureEncodingConfig,
    FeaturePipeline,
    RiskFeatureRecord,
    RiskFeatureSet,
)
from app.features.exceptions import FeatureEncodingError


def _record(
    subject_id: str = "alice",
    *,
    indicator: float | None = 2.5,
    index: float = 25.0,
) -> RiskFeatureRecord:
    """Create one risk record with numeric and categorical values."""
    return RiskFeatureRecord(
        subject_id=subject_id,
        window=AggregationWindow.DAILY,
        window_start=date(2024, 1, 1),
        window_end=date(2024, 1, 2),
        indicators={"email": indicator, "login": 0.25},
        component_scores={"email": 50.0, "login": 100.0},
        behavioral_risk_index=index,
    )


def _value_by_name(result: EncodedFeatureSet, index: int) -> dict[str, float]:
    """Pair a row's ordered values with the result's ordered feature names."""
    return dict(zip(result.feature_names, result.records[index].values, strict=True))


def test_one_hot_is_default_deterministic_and_preserves_numeric_values() -> None:
    """Default encoding creates stable one-hot fields and unchanged numerics."""
    records = (_record("zoe"), _record("alice", indicator=None))

    encoded = FeatureEncoder().encode(RiskFeatureSet(records))

    assert encoded.metadata.strategy == "one_hot"
    assert [row.subject_id for row in encoded.records] == ["alice", "zoe"]
    assert encoded.feature_names[-5:] == encoded.metadata.numeric_columns
    assert encoded.metadata.numeric_columns == (
        "indicator.email",
        "indicator.login",
        "component_score.email",
        "component_score.login",
        "behavioral_risk_index",
    )
    alice = _value_by_name(encoded, 0)
    assert alice["categorical.subject_id==alice"] == 1
    assert alice["categorical.subject_id==zoe"] == 0
    assert alice["indicator.email"] == 0.0
    assert alice["indicator.login"] == 0.25
    assert alice["component_score.email"] == 50.0
    assert alice["behavioral_risk_index"] == 25.0


def test_label_encoding_uses_sorted_vocab_and_configured_unknown_category() -> None:
    """Label values are deterministic and unknown inputs use reserved mapping."""
    config = FeatureEncodingConfig(
        strategy="label",
        known_categories={
            "subject_id": ("alice", "bob"),
            "window": ("daily",),
        },
        unseen_policy="unknown",
    )
    encoded = FeatureEncoder().encode(
        RiskFeatureSet((_record("charlie"), _record("alice"))), config
    )

    assert encoded.feature_names[0] == "categorical.subject_id"
    assert encoded.metadata.mappings["subject_id"] == {
        "alice": 0.0,
        "bob": 1.0,
        "__UNKNOWN__": 2.0,
    }
    assert _value_by_name(encoded, 0)["categorical.subject_id"] == 0.0
    assert _value_by_name(encoded, 1)["categorical.subject_id"] == 2.0


def test_frequency_encoding_uses_batch_frequencies_and_unknown_bucket() -> None:
    """Frequency mappings contain proportions and encode unseen as its bucket."""
    config = FeatureEncodingConfig(
        strategy="frequency",
        known_categories={"subject_id": ("alice",), "window": ("daily",)},
    )

    encoded = FeatureEncoder().encode(
        RiskFeatureSet((_record("alice"), _record("charlie"))), config
    )

    assert encoded.metadata.mappings["subject_id"] == {
        "alice": 0.5,
        "__UNKNOWN__": 0.5,
    }
    assert encoded.metadata.mappings["window"] == {"daily": 1.0, "__UNKNOWN__": 0.0}
    assert _value_by_name(encoded, 0)["categorical.subject_id"] == 0.5
    assert _value_by_name(encoded, 1)["categorical.subject_id"] == 0.5


def test_missing_categories_can_be_ignored_or_encoded() -> None:
    """Missing category policy controls one-hot representation."""
    records = RiskFeatureSet((_record(""),))
    ignored = FeatureEncoder().encode(
        records,
        FeatureEncodingConfig(missing_policy="ignore", unseen_policy="ignore"),
    )
    represented = FeatureEncoder().encode(
        records,
        FeatureEncodingConfig(missing_policy="category", unseen_policy="ignore"),
    )

    ignored_values = _value_by_name(ignored, 0)
    assert not any(
        name.startswith("categorical.subject_id==") for name in ignored_values
    )
    assert "categorical.subject_id==__MISSING__" in represented.feature_names
    assert _value_by_name(represented, 0)["categorical.subject_id==__MISSING__"] == 1


def test_missing_values_can_be_rejected() -> None:
    """Missing categorical values raise an explicit encoder error."""
    with pytest.raises(FeatureEncodingError, match="Missing categorical value"):
        FeatureEncoder().encode(
            RiskFeatureSet((_record(""),)),
            FeatureEncodingConfig(missing_policy="error"),
        )


def test_numeric_missing_values_use_configured_replacement_only() -> None:
    """Configured numeric missing values replace nulls without scaling others."""
    encoded = FeatureEncoder().encode(
        RiskFeatureSet((_record(indicator=None),)),
        FeatureEncodingConfig(numeric_missing_value=-7.5),
    )

    values = _value_by_name(encoded, 0)
    assert values["indicator.email"] == -7.5
    assert values["indicator.login"] == 0.25
    assert values["component_score.email"] == 50.0
    assert values["behavioral_risk_index"] == 25.0


@pytest.mark.parametrize("policy", ["ignore", "unknown"])
def test_unseen_values_follow_configured_policy(policy: str) -> None:
    """Unknown vocabulary entries map to an unknown bucket or neutral value."""
    config = FeatureEncodingConfig(
        strategy="label",
        known_categories={"subject_id": ("alice",), "window": ("daily",)},
        unseen_policy=policy,  # type: ignore[arg-type]
    )

    encoded = FeatureEncoder().encode(RiskFeatureSet((_record("zoe"),)), config)

    expected = 1.0 if policy == "unknown" else -1.0
    assert _value_by_name(encoded, 0)["categorical.subject_id"] == expected


def test_unseen_values_can_be_rejected() -> None:
    """Unknown vocabulary entries raise rather than silently encoding."""
    config = FeatureEncodingConfig(
        known_categories={"subject_id": ("alice",), "window": ("daily",)},
        unseen_policy="error",
    )
    with pytest.raises(FeatureEncodingError, match="Unseen category"):
        FeatureEncoder().encode(RiskFeatureSet((_record("zoe"),)), config)


def test_invalid_configuration_raises_typed_error() -> None:
    """Unsupported strategies and invalid feature selection are rejected."""
    for build_config in (
        lambda: FeatureEncodingConfig(strategy="ordinal"),  # type: ignore[arg-type]
        lambda: FeatureEncodingConfig(categorical_fields=("hostname",)),
        lambda: FeatureEncodingConfig(numeric_missing_value=float("nan")),
        lambda: FeatureEncodingConfig(
            known_categories={"subject_id": ("alice", "alice")}
        ),
    ):
        with pytest.raises(FeatureEncodingError):
            build_config()


def test_empty_batch_with_known_vocabulary_has_stable_columns() -> None:
    """Configured vocabularies provide deterministic feature shape for empty data."""
    encoded = FeatureEncoder().encode(
        RiskFeatureSet(()),
        FeatureEncodingConfig(
            known_categories={"subject_id": ("alice",), "window": ("daily",)}
        ),
    )

    assert encoded.records == ()
    assert "categorical.subject_id==alice" in encoded.feature_names
    assert encoded.metadata.numeric_columns == ()


def test_pipeline_exposes_encoding_stage() -> None:
    """FeaturePipeline delegates risk encoding to its encoder component."""
    risk_features = RiskFeatureSet((_record(),))

    encoded = FeaturePipeline().encode_risk(risk_features)

    assert isinstance(encoded, EncodedFeatureSet)
    assert encoded.records[0].subject_id == "alice"


def test_encoder_does_not_mutate_input_risk_records() -> None:
    """Encoding leaves source mappings and risk values untouched."""
    original = _record()
    before = replace(original)

    FeatureEncoder().encode(RiskFeatureSet((original,)))

    assert original == before
