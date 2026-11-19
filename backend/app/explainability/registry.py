"""Registry of recognized explainers and their implementation status."""

import logging
from dataclasses import dataclass

from app.core.constants import APP_LOGGER_NAME
from app.explainability.exceptions import ExplainerNotSupportedError
from app.explainability.schemas import ExplainerName

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.explainability")


@dataclass(frozen=True, slots=True)
class ExplainerSpec:
    """Describe an explainer entry without constructing an algorithm."""

    name: ExplainerName
    implemented: bool = False


class ExplainerRegistry:
    """Resolve canonical names for current and future explanation methods."""

    _EXPLAINER_NAMES: tuple[ExplainerName, ...] = ("SHAP", "LIME")

    def __init__(self) -> None:
        """Initialize recognized explainer placeholders in stable order."""
        self._specs = {
            name.casefold(): ExplainerSpec(name=name, implemented=name == "SHAP")
            for name in self._EXPLAINER_NAMES
        }
        logger.info("Initialized explainability registry with SHAP implementation.")

    def get(self, name: str) -> ExplainerSpec:
        """Return a recognized explainer or raise a typed error."""
        spec = self._specs.get(name.strip().casefold())
        if spec is None:
            raise ExplainerNotSupportedError(
                f"Explainer name is not registered: {name!r}."
            )
        return spec

    def list_explainers(self) -> tuple[ExplainerSpec, ...]:
        """Return registered explainers in deterministic order."""
        return tuple(self._specs[name.casefold()] for name in self._EXPLAINER_NAMES)

    def register(self, spec: ExplainerSpec) -> None:
        """Register or update the implementation status of a known explainer."""
        if spec.name not in self._EXPLAINER_NAMES:
            raise ExplainerNotSupportedError(
                f"Explainer name is not registered: {spec.name!r}."
            )
        self._specs[spec.name.casefold()] = spec
        logger.info(
            "Updated explainability registry: explainer=%s implemented=%s",
            spec.name,
            spec.implemented,
        )
