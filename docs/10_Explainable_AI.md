# Explainable AI

## Sprint 7.3 — Explainable AI

### Scope

This module provides typed explanation contracts and SHAP explanations for the
four existing classification adapters. It does not produce visualizations or
support LIME.

### Package structure

```text
backend/app/explainability/
├── __init__.py
├── base.py
├── exceptions.py
├── pipeline.py
├── report.py
├── registry.py
├── schemas.py
├── shap_explainer.py
└── visualization.py
```

### Responsibilities

- **`base.py`** defines the abstract `ExplanationGenerator` interface for
  global and local explanations.
- **`schemas.py`** defines typed configuration, explanation requests, global
  and local explanation records, and result containers.
- **`shap_explainer.py`** selects the official `LinearExplainer` for Logistic
  Regression and `TreeExplainer` for Decision Tree, Random Forest, and XGBoost.
- **`registry.py`** tracks recognized explainers and their implementation
  status. SHAP is the initial integration target; LIME is reserved for later.
- **`pipeline.py`** provides SHAP generation and request-based orchestration.
- **`report.py`** serializes SHAP/global/local results and creates a report
  summary and integrity manifest.
- **`visualization.py`** generates optional global, top-10, and local SHAP
  charts when Matplotlib is available.
- **`exceptions.py`** provides typed errors for unrecognized, unimplemented,
  and invalidly registered explainers.
- **`__init__.py`** exposes the stable public API.

### Contracts and extension points

`ExplainerConfig` selects a registered explainer and carries a random seed and
implementation-specific options. `ExplanationRequest` composes the existing
model and ML dataset contracts. `GlobalExplanation` and `LocalExplanation`
represent aggregate and per-subject contributions. `ExplainabilityPipeline`
provides `generate_shap()` and request-based `run()` orchestration.

## Sprint 7.3 Step 2 — SHAP integration

SHAP is an optional dependency, installed from the backend directory with
`pip install -e ".[shap]"`. Without it, explanation generation raises
`ExplainerDependencyError` with the install command. The registered SHAP entry
is marked implemented; LIME remains recognized but reserved.

`ShapExplainer.generate()` returns `ExplainabilityResult`. `shap_values` are
normalized to sample × feature × model-output order, while `expected_values`
hold the base value for each output and `feature_names` preserve the model's
fitted feature order. Metadata records explainer type, SHAP version, adapter
type, feature and sample counts, elapsed time, and an ISO-8601 UTC timestamp.
The supplied dataset rows are explained in input order. For LinearExplainer,
the supplied feature matrix is also used as the interventional background.

Supported adapters expose their fitted estimator through a narrow
`shap_estimator` property. The integration validates feature schema against
the fitted model. `explain_global()` aggregates mean absolute SHAP values by
feature, and `explain_local()` returns the SHAP contributions for exactly one
matching subject ID.

## Sprint 7.3 Step 3 — Global SHAP feature importance

`ExplainabilityPipeline.global_importance()` aggregates the absolute and signed
SHAP contributions for every feature across all explained samples and model
outputs. Each typed `FeatureImportance` record includes mean absolute SHAP,
mean signed SHAP, population standard deviation, percentage of total mean
absolute contribution, positive and negative contribution counts, and rank.
Percentages are based on the sum of mean absolute SHAP values and total 100%
when that sum is nonzero. If every feature has zero contribution, percentages
are allocated equally so the report remains normalized. Features are ranked by
descending mean absolute SHAP; ties are ordered by feature name.

The pipeline writes `global_feature_importance.json`,
`global_feature_importance.csv`, and `global_feature_importance.md` under its
configured output directory (by default `backend/data/explainability/`).
Providing `output_directory` to the method overrides the destination and
missing directories are created automatically. JSON and Markdown include the
SHAP run metadata and report paths; CSV contains one ranked row per feature.

## Sprint 7.3 Step 4 — Local SHAP explanations

`ExplainabilityPipeline.local_explanation()` accepts a fitted supported model,
a non-empty finite encoded feature matrix, and a zero-based sample index. It
checks the matrix width and order against the model's fitted feature schema,
uses the full matrix as the LinearExplainer background, and explains only the
selected row. Tree explainers operate on that same selected row.

The typed `LocalExplanation` includes the predicted class, its corresponding
class probability, the matching SHAP expected value, input feature values,
and per-feature SHAP contributions ranked by descending absolute contribution.
Feature-name ordering resolves equal-contribution ties. The metadata includes
SHAP/model types, version, selected sample index, feature/sample counts,
execution duration, timestamp, predicted class and probability, expected
value, and report paths.

Reports are written as `local_explanation_<sample>.json` and
`local_explanation_<sample>.md` in the configured output directory, which
defaults to `backend/data/explainability/`. Invalid indices, malformed
matrices, and unsupported models raise typed `ExplainabilityError` or
`ExplainerNotSupportedError` exceptions rather than producing partial reports.

## Sprint 7.3 Step 5 — SHAP reports and visualizations

`ExplainabilityPipeline.generate_reports()` accepts existing SHAP values,
global importance, and an optional local explanation. It writes
`shap_report.json`, `shap_report.csv`, and `shap_report.md`, plus
`explainability_summary.md` and `explainability_manifest.json`. The CSV has one
row per sample, feature, and output class. JSON includes the raw SHAP values,
expected values, global statistics, optional local example, dataset dimensions,
and artifact locations.

Matplotlib produces `global_feature_importance.png`,
`top10_feature_importance.png`, and, when a local result is supplied,
`local_explanation_<sample>.png`. If Matplotlib is unavailable, the PNG
generation is skipped and the reports and manifest are still written.

The summary documents the model, explainer, dataset dimensions, top global
features, optional local prediction, generated artifacts, and timestamps. The
manifest records SHA-256, byte size, and file timestamp for each generated
report/image, along with SHAP version, model type, generation time, and output
directory. A manifest cannot include its own hash; the manifest declares that
self-hashing is excluded. Artifact paths and timestamps are specific to the
current filesystem/run.

### Current limitations and roadmap

LIME and model adapters other than Logistic Regression, Decision Tree, Random
Forest, and XGBoost are not supported. Visualizations are optional and require
Matplotlib. SHAP compatibility can vary by SHAP, scikit-learn, and XGBoost
versions; the optional SHAP dependency is excluded from the default runtime
installation.
