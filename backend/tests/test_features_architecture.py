"""Import and schema-contract tests for the feature architecture scaffold."""

from datetime import UTC, datetime

import app.features.aggregations
import app.features.behavioral
import app.features.encoder
import app.features.exceptions
import app.features.extractor
import app.features.pipeline
import app.features.risk_scores
import app.features.temporal
from app.features import (
    EncodedFeatureSet,
    FeatureContext,
    FeatureEncodingMetadata,
    FeatureGroup,
    FeatureRequest,
    FeatureSet,
    FeatureValue,
    RiskLevel,
    RiskScore,
)
from app.features.aggregations import AggregationStrategy
from app.features.behavioral import BehavioralFeatureExtractor
from app.features.encoder import FeatureEncoderContract
from app.features.exceptions import FeatureError
from app.features.extractor import FeatureExtractor
from app.features.risk_scores import RiskScoreCalculator
from app.features.temporal import TemporalFeatureExtractor


def test_feature_modules_import() -> None:
    """All public feature architecture modules import successfully."""
    assert app.features.aggregations is not None
    assert app.features.behavioral is not None
    assert app.features.encoder is not None
    assert app.features.exceptions is not None
    assert app.features.extractor is not None
    assert app.features.pipeline is not None
    assert app.features.risk_scores is not None
    assert app.features.temporal is not None


def test_feature_schemas_can_be_instantiated() -> None:
    """Typed feature contracts hold representative domain values."""
    start = datetime(2026, 1, 1, tzinfo=UTC)
    end = datetime(2026, 1, 2, tzinfo=UTC)
    request = FeatureRequest(
        subject_id="subject-001",
        window_start=start,
        window_end=end,
    )
    context = FeatureContext(request=request, reference_time=end)
    behavioral_group = FeatureGroup(
        name="behavioral",
        values={"event_count": 3, "label": "example"},
    )
    feature_set = FeatureSet(
        subject_id=request.subject_id,
        window_start=start,
        window_end=end,
        groups=(behavioral_group,),
    )
    encoded = EncodedFeatureSet(
        feature_names=("event_count",),
        records=(),
        metadata=FeatureEncodingMetadata(
            strategy="one_hot",
            mappings={},
            encoded_columns={},
            numeric_columns=(),
            missing_policy="category",
            unseen_policy="unknown",
        ),
    )
    score = RiskScore(
        subject_id=request.subject_id,
        value=0.25,
        level=RiskLevel.LOW,
        scored_at=end,
    )

    assert context.request == request
    assert feature_set.groups == (behavioral_group,)
    assert encoded.records == ()
    assert score.level is RiskLevel.LOW


def test_contracts_are_abstract() -> None:
    """No interface can be instantiated before behavior is intentionally added."""
    abstract_contracts = (
        AggregationStrategy,
        BehavioralFeatureExtractor,
        FeatureEncoderContract,
        FeatureExtractor,
        RiskScoreCalculator,
        TemporalFeatureExtractor,
    )
    assert all(contract.__abstractmethods__ for contract in abstract_contracts)


def test_feature_value_alias_accepts_declared_scalar_types() -> None:
    """FeatureValue supports the declared scalar contract."""
    values: tuple[FeatureValue, ...] = (1, 1.5, "value", True, None)

    assert len(values) == 5


def test_feature_error_hierarchy_is_importable() -> None:
    """The public base exception is usable by callers."""
    assert issubclass(FeatureError, Exception)
