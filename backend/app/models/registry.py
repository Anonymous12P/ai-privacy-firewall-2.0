"""Registry of recognized model names and their implementation availability."""

from dataclasses import dataclass

from app.models.exceptions import ModelNotSupportedError
from app.models.schemas import ModelName


@dataclass(frozen=True, slots=True)
class ModelSpec:
    """Describe a recognized model type without constructing an algorithm."""

    name: ModelName
    implemented: bool = False


class ModelRegistry:
    """Resolve canonical names for model implementations planned for later."""

    _MODEL_NAMES: tuple[ModelName, ...] = (
        "LogisticRegression",
        "DecisionTree",
        "RandomForest",
        "XGBoost",
        "LightGBM",
        "CatBoost",
    )

    def __init__(self) -> None:
        """Initialize registry entries for the planned supported model types."""
        self._specs = {
            name.casefold(): ModelSpec(name=name) for name in self._MODEL_NAMES
        }

    def get(self, name: str) -> ModelSpec:
        """Return the registered model specification or raise a typed error."""
        spec = self._specs.get(name.strip().casefold())
        if spec is None:
            raise ModelNotSupportedError(f"Model name is not registered: {name!r}.")
        return spec

    def list_models(self) -> tuple[ModelSpec, ...]:
        """Return recognized model specifications in deterministic order."""
        return tuple(self._specs[name.casefold()] for name in self._MODEL_NAMES)

    def register(self, spec: ModelSpec) -> None:
        """Register a recognized model specification for future implementations."""
        self._specs[spec.name.casefold()] = spec
