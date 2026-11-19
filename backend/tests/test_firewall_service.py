"""Unit tests for the AI Privacy Firewall policy engine."""

import pytest

from app.services.firewall_service import (
    FirewallBlockedError,
    PrivacyFirewall,
)


@pytest.mark.parametrize(
    ("confidence", "action", "risk_level"),
    [
        (0.95, "BLOCK", "Critical"),
        (0.80, "RESTRICT", "High"),
        (0.50, "WARN", "Medium"),
        (0.20, "ALLOW", "Low"),
    ],
)
def test_confidence_policy_and_notices(
    confidence: float,
    action: str,
    risk_level: str,
) -> None:
    firewall = PrivacyFirewall()
    decision = firewall.evaluate("insider", confidence, {})

    assert decision.firewall_action == action
    assert decision.risk_level == risk_level
    notice = firewall.notice(decision)
    assert (notice is None) is (action in {"ALLOW", "BLOCK"})


def test_block_enforcement_raises_with_stable_payload() -> None:
    firewall = PrivacyFirewall()
    decision = firewall.evaluate(
        "insider",
        0.95,
        {"indicator.usb": 1.0, "indicator.file": 1.0},
    )

    with pytest.raises(FirewallBlockedError) as error:
        firewall.enforce(decision, enabled=True)

    assert error.value.payload() == {
        "error": "Request blocked by AI Privacy Firewall",
        "policy_name": "high-confidence-block",
        "firewall_action": "BLOCK",
        "reasons": ["USB activity detected.", "File activity detected."],
    }


def test_logging_only_mode_allows_block_decision() -> None:
    firewall = PrivacyFirewall()
    decision = firewall.evaluate("insider", 0.95, {})

    firewall.enforce(decision, enabled=False)


@pytest.mark.parametrize("confidence", [-0.01, 1.01])
def test_confidence_out_of_range_is_rejected(confidence: float) -> None:
    with pytest.raises(ValueError, match="between 0 and 1"):
        PrivacyFirewall().evaluate("insider", confidence, {})
