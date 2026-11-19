"""Tests for Real AI Model Integration in the Explainable Adaptive AI Privacy Firewall.

Validates:
- Data preprocessing & feature engineering vectorization
- Model loading from real joblib artifacts (LogisticRegression, DecisionTree, RandomForest, XGBoost)
- Real inference across all 4 classifier architectures
- TreeSHAP & local explainability attribution
- Calibrated risk score to firewall decision threshold bands (ALLOW, WARN, RESTRICT, BLOCK)
- FirewallModelPipeline metadata API response contracts
"""

from pathlib import Path

import pytest
from app.api.firewall import get_model_pipeline
from app.core.config import get_settings
from app.schemas.firewall import (
    FirewallEvaluationRequest,
    FirewallModelName,
    FirewallModelPipelineResponse,
)
from app.services.ai_engine import AIEngine
from app.services.audit_service import AuditService, InMemoryAuditRepository
from app.services.auth_service import UserRecord
from app.services.behavior_service import BehaviorService
from app.services.enforcement_engine import EnforcementEngine
from app.services.explainability_engine import ExplainabilityEngine
from app.services.firewall_service import FirewallService
from app.services.policy_engine import PolicyEngine


@pytest.fixture
def auth_user() -> UserRecord:
    """Fixture providing an authenticated security analyst user."""
    return UserRecord(
        username="secops_analyst",
        password_hash="hashed_password",
    )


@pytest.fixture
def model_dir() -> Path:
    """Fixture returning the configured model directory with persisted artifacts."""
    return get_settings().model_directory


@pytest.fixture
def real_firewall_service(model_dir: Path) -> FirewallService:
    """Fixture initializing FirewallService backed by real AI models and in-memory audit."""
    return FirewallService(
        behavior_service=BehaviorService(),
        ai_engine=AIEngine(model_directory=model_dir),
        explainability_engine=ExplainabilityEngine(),
        policy_engine=PolicyEngine(),
        enforcement_engine=EnforcementEngine(),
        audit_service=AuditService(repository=InMemoryAuditRepository()),
        enforce_firewall=True,
    )


def test_ai_engine_loads_all_four_models(model_dir: Path) -> None:
    """Ensure AI engine detects and successfully loads all 4 trained models."""
    ai = AIEngine(model_directory=model_dir)
    available = ai.available_models()
    for expected_model in ("LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"):
        assert expected_model in available


def test_feature_vectorization_and_metadata_resolution(model_dir: Path) -> None:
    """Test feature vectorization correctly maps behavioral indicators to model schema."""
    ai = AIEngine(model_directory=model_dir)
    features = {
        "indicator.usb": 1.0,
        "indicator.session": 7200.0,
        "indicator.login": 0.5,
        "behavioral_risk_index": 0.65,
    }
    pred = ai.predict(features, model_name="LogisticRegression", subject_id="PSF0133")
    assert pred.model_name == "LogisticRegression"
    assert 0.0 <= pred.confidence <= 1.0
    assert len(pred.probabilities) >= 1


@pytest.mark.parametrize(
    "model_name",
    ["LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"],
)
def test_real_model_inference_normal_behavior(
    real_firewall_service: FirewallService,
    model_name: FirewallModelName,
) -> None:
    """Verify clean benign baseline behavior is evaluated accurately by each model."""
    req = FirewallEvaluationRequest(
        features={
            "indicator.usb": 0.0,
            "indicator.session": 3600.0,
            "indicator.login": 0.0,
            "indicator.email": 0.0,
            "indicator.file": 0.0,
            "indicator.http": 0.0,
            "behavioral_risk_index": 0.05,
        },
        subject_id="AAS0442",
        resource="Company Intranet",
        action="read",
        model_name=model_name,
    )
    res = real_firewall_service.evaluate(req)

    assert res.decision in ("ALLOW", "WARN")
    assert res.risk_score <= 0.60
    assert res.explanation.model_name == model_name
    assert res.explanation.summary != ""


@pytest.mark.parametrize(
    "model_name",
    ["DecisionTree", "XGBoost"],
)
def test_real_model_inference_threat_detection(
    real_firewall_service: FirewallService,
    model_name: FirewallModelName,
) -> None:
    """Verify high-risk anomalous behavioral indicators trigger elevated risk decisions in tree models."""
    req = FirewallEvaluationRequest(
        features={
            "indicator.usb": 5.0,
            "indicator.session": 86400.0,
            "indicator.login": 12.0,
            "indicator.file": 50.0,
            "behavioral_risk_index": 1.0,
            "component_score.usb": 1.0,
            "component_score.session": 1.0,
        },
        subject_id="PSF0133",
        resource="Customer Credit Card Vault",
        action="bulk_download",
        model_name=model_name,
    )
    res = real_firewall_service.evaluate(req)

    # Decisions must reflect elevated threat
    assert res.decision in ("WARN", "RESTRICT", "BLOCK")
    assert res.risk_level in ("Medium", "High", "Critical")
    assert res.explanation.model_name == model_name
    assert len(res.explanation.contributing_factors) > 0


def test_firewall_decision_threshold_mapping(real_firewall_service: FirewallService) -> None:
    """Validate policy engine deterministic threshold mapping from threat scores."""
    policy = real_firewall_service.policy_engine

    allow_decision = policy.evaluate(prediction="normal", confidence=0.10, features={})
    assert allow_decision.action == "ALLOW"
    assert allow_decision.risk_level == "Low"

    warn_decision = policy.evaluate(prediction="insider", confidence=0.55, features={})
    assert warn_decision.action == "WARN"
    assert warn_decision.risk_level == "Medium"

    restrict_decision = policy.evaluate(prediction="insider", confidence=0.75, features={})
    assert restrict_decision.action == "RESTRICT"
    assert restrict_decision.risk_level == "High"

    block_decision = policy.evaluate(prediction="insider", confidence=0.95, features={})
    assert block_decision.action == "BLOCK"
    assert block_decision.risk_level == "Critical"


def test_get_model_pipeline_metadata(real_firewall_service: FirewallService) -> None:
    """Validate FirewallService.get_model_pipeline returns real comparison and SHAP metadata."""
    pipeline_meta: FirewallModelPipelineResponse = real_firewall_service.get_model_pipeline()

    assert pipeline_meta.status == "LOADED_AND_OPERATIONAL"
    assert pipeline_meta.champion_model in ("DecisionTree", "RandomForest", "XGBoost", "LogisticRegression")
    assert len(pipeline_meta.models) == 4

    model_names = {m.model_name for m in pipeline_meta.models}
    assert model_names == {"LogisticRegression", "DecisionTree", "RandomForest", "XGBoost"}

    # Validate benchmark metric bounds
    for m in pipeline_meta.models:
        assert 0.90 <= m.accuracy <= 1.0
        assert 0.90 <= m.f1_score <= 1.0
        assert m.parameter_count > 0
        assert m.model_size_bytes > 0

    # Validate global SHAP feature importance
    assert len(pipeline_meta.global_features) >= 5
    top_feature = pipeline_meta.global_features[0]
    assert top_feature.rank == 1
    assert top_feature.percentage_contribution > 15.0  # Removable USB storage is > 30%

    # Validate dataset summary
    assert pipeline_meta.dataset.total_records > 10000
    assert "device" in pipeline_meta.dataset.source_record_counts

    # Validate threshold bands
    assert len(pipeline_meta.threshold_bands) == 4
    band_actions = [b.action for b in pipeline_meta.threshold_bands]
    assert band_actions == ["ALLOW", "WARN", "RESTRICT", "BLOCK"]


def test_api_firewall_model_pipeline_endpoint(
    auth_user: UserRecord,
    real_firewall_service: FirewallService,
) -> None:
    """Test REST API endpoint GET /api/firewall/model-pipeline."""
    response = get_model_pipeline(auth_user, real_firewall_service)
    assert isinstance(response, FirewallModelPipelineResponse)
    assert response.status == "LOADED_AND_OPERATIONAL"
    assert len(response.models) == 4
