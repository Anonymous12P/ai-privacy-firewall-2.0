# Sprint 7.2 — Model Training

## Step 1 — Architecture scaffold

### Scope

This step establishes typed boundaries for future model training. It does not
implement algorithms, fit model parameters, make inference predictions,
compute evaluation metrics, serialize artifacts, or provide explainability.

### Package structure

```text
backend/app/models/
├── __init__.py
├── base.py
├── factory.py
├── trainer.py
├── evaluator.py
├── registry.py
├── persistence.py
├── schemas.py
├── exceptions.py
└── pipeline.py
```

### Responsibilities

- **`base.py`** defines the abstract fit/predict model interface.
- **`factory.py`** validates requested model identifiers and provides an
  explicit typed not-implemented response until concrete constructors exist.
- **`trainer.py`** defines the training operation contract.
- **`evaluator.py`** defines the held-out evaluation contract; no metrics are
  calculated at this stage.
- **`registry.py`** lists recognized model names and whether an implementation
  is available.
- **`persistence.py`** defines model save/load boundaries without choosing a
  serialization format.
- **`schemas.py`** provides immutable typed configuration, request, prediction,
  training, and evaluation result dataclasses.
- **`exceptions.py`** defines typed errors for unknown models, placeholders,
  training, and persistence.
- **`pipeline.py`** defines the abstract orchestration interface.
- **`__init__.py`** exports the supported public contracts.

### Recognized model names

The registry recognizes `LogisticRegression`, `DecisionTree`, `RandomForest`,
`XGBoost`, `LightGBM`, and `CatBoost`. Names are looked up case-insensitively;
the canonical spellings are returned in registry order. After the baseline
steps, Logistic Regression, Decision Tree, Random Forest, and XGBoost are
implemented; the remaining recognized models continue to raise
`ModelNotImplementedError`. Unknown names raise `ModelNotSupportedError`.

### Extension points

Future steps can add concrete `Model` implementations, trainers and evaluators,
register constructors with `ModelFactory.register()`, and extend the pipeline.
The pipeline consumes the prepared data contract from `app.ml` without coupling
model implementation details into dataset preparation.

### Current limitations

The original architecture scaffold did not implement training, predictions,
evaluation, serialization, or model loading. Model support and configuration
validation are described by the later baseline sections below.

## Step 2 — Logistic regression baseline

`LogisticRegressionModel` implements the model interface with scikit-learn's
`LogisticRegression`. `ModelPipeline.train_logistic_regression()` (also exposed
through `ModelPipeline.run()`) consumes the prepared training, validation, and
test partitions, fits on training rows only, evaluates both held-out partitions,
and persists the resulting baseline. `ModelFactory` registers this implementation;
Decision Tree and Random Forest are covered in the following sections.

The configured parameters include `random_state`, `max_iter`, `penalty`,
`solver`, `C`, `class_weight`, and `multi_class`. The training seed supplies
`random_state` unless an explicit model hyperparameter overrides it. On recent
scikit-learn versions, `multi_class="ovr"` uses `OneVsRestClassifier` for
multiclass data because scikit-learn removed the legacy `multi_class` estimator
argument; `auto` and `multinomial` use the native estimator behavior.
Incompatible solver/penalty settings are rejected by scikit-learn and surfaced
as `ModelTrainingError`. Numeric, finite feature values and non-missing target
labels are required.

`predict()`, `predict_proba()`, and `decision_function()` preserve row ordering
and validate the feature schema against the fitted model. The evaluator reports
Accuracy, weighted Precision/Recall/F1, ROC-AUC, PR-AUC, confusion matrix,
classification report, and Log Loss for validation and test. AUC values are
`None` where the held-out labels do not support a meaningful calculation.

`JoblibModelPersistence` writes the trusted local model to a `.joblib` artifact
and writes a JSON sidecar containing estimator configuration, validation/test
metrics, feature names/count, target classes, scikit-learn version, and
SHA-256. Loading verifies the model digest before calling `joblib.load`; only
artifacts from trusted sources should be loaded because joblib uses Python
pickle serialization.

No explainability, hyperparameter search, threshold tuning, or deployment
inference service is included.

## Step 3 — Decision tree baseline

`DecisionTreeModel` implements the shared model contract with
scikit-learn's `DecisionTreeClassifier`. `ModelPipeline.train_decision_tree()`
trains only on the prepared training partition, evaluates validation and test
partitions with the shared classification evaluator, and persists the
resulting baseline. `ModelPipeline.run()` dispatches to this baseline and the
logistic-regression baseline. Random Forest is covered in Step 4; other
recognized model names remain explicit placeholders.

The tree configuration supports `criterion`, `max_depth`,
`min_samples_split`, `min_samples_leaf`, `max_features`, `class_weight`,
`random_state`, and `ccp_alpha`. The pipeline seed supplies `random_state`
unless an explicit value is provided. Invalid parameter values and malformed
or nonnumeric training data raise `ModelTrainingError`.

The adapter exposes ordered `predict()` and `predict_proba()` operations,
`decision_path()` node traversals, and `apply()` leaf identifiers. Feature
importances are paired with the original feature names in schema order. The
shared evaluator reports Accuracy, weighted Precision/Recall/F1, ROC-AUC,
PR-AUC, confusion matrix, classification report, and Log Loss.

The JSON model sidecar includes the full configuration, feature names,
validation/test metrics, scikit-learn version, SHA-256 digest, feature
importances, criterion, tree depth, leaf count, and node count. The artifact is
persisted with the existing joblib mechanism; only trusted joblib files should
be loaded.

## Step 4 — Random forest baseline

`RandomForestModel` wraps scikit-learn's `RandomForestClassifier`.
`ModelPipeline.train_random_forest()` trains from the training partition,
evaluates validation and test partitions using the shared classifier evaluator,
and persists the model. `ModelPipeline.run()` dispatches to Logistic Regression,
Decision Tree, or Random Forest; other recognized model names remain
placeholders.

Configuration supports `n_estimators`, `criterion`, `max_depth`,
`min_samples_split`, `min_samples_leaf`, `max_features`, `bootstrap`,
`oob_score`, `class_weight`, `random_state`, and `n_jobs`. The pipeline seed
provides `random_state` unless explicitly overridden. OOB scoring is rejected
unless bootstrap sampling is enabled. Input features must be finite numeric
values, and at least two target classes are required.

The adapter provides ordered `predict()`, `predict_proba()`,
`predict_log_proba()`, `apply()` leaf indices per tree, and `decision_path()`
node indices across the forest. The shared evaluator reports Accuracy,
weighted Precision/Recall/F1, ROC-AUC, PR-AUC, confusion matrix, classification
report, and Log Loss. When configured, the fitted forest's OOB score is
included in evaluation output and artifact metadata.

The model sidecar records the full configuration, feature names and
importances, scikit-learn version, validation/test metrics, SHA-256, OOB score,
and ensemble tree-count/depth/node-count statistics. Random Forest
feature importances are impurity-based and should be interpreted with the usual
high-cardinality and correlated-feature caveats.

## Step 5 — XGBoost baseline

`XGBoostModel` uses the official `xgboost.XGBClassifier`. XGBoost is an optional
dependency, installed from the backend directory with
`pip install -e ".[xgboost]"`. Model construction and package import remain
available without it; fitting without the extra raises `ModelDependencyError`
with the installation command.

Configuration supports `n_estimators`, `learning_rate`, `max_depth`,
`min_child_weight`, `subsample`, `colsample_bytree`, `gamma`, `reg_alpha`,
`reg_lambda`, `objective`, `eval_metric`, `random_state`, and `n_jobs`. With
`objective="auto"`, binary targets use `binary:logistic` and multiclass targets
use `multi:softprob`. Explicit objectives must match the target class count.
Target labels are internally encoded for XGBoost and decoded on prediction.
Input features must be finite numeric values; mixed primitive target types are
not supported.

`ModelPipeline.train_xgboost()` trains on the training partition, evaluates
validation and test partitions using the shared classification evaluator, and
persists the joblib model and JSON sidecar. Predictions preserve row order;
the adapter also exposes class probabilities, boosting-round leaf assignments,
and feature importances aligned to the source schema. The evaluator reports
Accuracy, weighted Precision/Recall/F1, ROC-AUC, PR-AUC, confusion matrix,
classification report, and Log Loss.

The sidecar includes configuration, feature names/importances, XGBoost version,
booster type, resolved objective, both evaluation results, and SHA-256 of the
serialized model. Only trusted joblib files should be loaded.

## Step 6 — Model comparison and best-model selection

`ModelPipeline.compare_models()` (and the public `compare_models()` function)
trains the selected implemented baselines against the same training partition
and evaluates each against the same validation or test partition. By default
it compares Logistic Regression, Decision Tree, Random Forest, and XGBoost;
the optional XGBoost dependency must be installed when that default selection
is used. The output directory defaults to `backend/data/models/comparison/`.

The comparison reports Accuracy, weighted Precision, Recall, and F1-score,
ROC-AUC, PR-AUC, Log Loss, training duration, prediction duration, serialized
model size, and learned parameter count when available. Model configurations
and all metrics are retained in the report. Training time and prediction time
are observational measurements and may vary between runs.

Ranking defaults to descending F1-score. Ties are resolved by descending
ROC-AUC, Precision, Recall, and Accuracy, then ascending serialized model size
and prediction time, and finally case-insensitive model name. Missing or
non-finite scores rank after defined scores. The primary metric can be set to
any reported metric; Log Loss is ranked ascending.

The workflow writes `model_comparison.json`, `model_comparison.csv`, and
`model_comparison.md`. A F1-score chart (`model_comparison.png`) is generated
when Matplotlib is installed and chart generation is enabled; otherwise the
comparison completes without a chart. No model selection is persisted as a
deployable artifact, and this framework does not tune hyperparameters or
perform statistical significance testing.
