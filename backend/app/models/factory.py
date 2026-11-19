"""Model factory for implemented and planned model algorithms."""

from collections.abc import Callable

from app.models.base import Model
from app.models.decision_tree import (
    DecisionTreeModel,
    decision_tree_config_from_mapping,
)
from app.models.exceptions import ModelNotImplementedError, ModelRegistrationError
from app.models.logistic_regression import (
    LogisticRegressionModel,
    logistic_config_from_mapping,
)
from app.models.random_forest import (
    RandomForestModel,
    random_forest_config_from_mapping,
)
from app.models.registry import ModelRegistry, ModelSpec
from app.models.schemas import ModelConfig, ModelName
from app.models.xgboost_model import XGBoostModel, xgboost_config_from_mapping


class ModelFactory:
    """Resolve model names and report recognized-but-unimplemented algorithms."""

    def __init__(self, registry: ModelRegistry | None = None) -> None:
        """Create a factory backed by the supplied or default registry."""
        self._registry = registry or ModelRegistry()
        self._constructors: dict[str, Callable[[ModelConfig], Model]] = {}
        self.register(
            "LogisticRegression",
            lambda config: LogisticRegressionModel(
                logistic_config_from_mapping(config.hyperparameters)
            ),
        )
        self.register(
            "DecisionTree",
            lambda config: DecisionTreeModel(
                decision_tree_config_from_mapping(config.hyperparameters)
            ),
        )
        self.register(
            "RandomForest",
            lambda config: RandomForestModel(
                random_forest_config_from_mapping(config.hyperparameters)
            ),
        )
        self.register(
            "XGBoost",
            lambda config: XGBoostModel(
                xgboost_config_from_mapping(config.hyperparameters)
            ),
        )

    def register(
        self,
        name: ModelName,
        constructor: Callable[[ModelConfig], Model],
    ) -> None:
        """Register a future concrete model constructor for a recognized name."""
        spec = self._registry.get(name)
        key = spec.name.casefold()
        if key in self._constructors:
            raise ModelRegistrationError(
                f"A constructor is already registered for {spec.name!r}."
            )
        self._constructors[key] = constructor
        self._registry.register(ModelSpec(name=spec.name, implemented=True))

    def create(self, config: ModelConfig) -> Model:
        """Construct a registered model or raise a typed placeholder."""
        spec = self._registry.get(config.name)
        constructor = self._constructors.get(spec.name.casefold())
        if constructor is None:
            raise ModelNotImplementedError(
                f"Model {spec.name!r} is recognized but not implemented yet."
            )
        return constructor(config)
