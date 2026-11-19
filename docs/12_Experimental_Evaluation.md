# Experimental Evaluation

## Sprint 7.4 Step 1: architecture foundation

The `app.experiments` package establishes typed contracts for a future
experimental evaluation module with interfaces, immutable data structures,
and sequential experiment execution.

## Architecture and responsibilities

- `config.py` defines the immutable `ExperimentConfig`, including the dataset
  and output paths, random seed, selected model names, experiment name, feature
  directory, explainability directory, and aggregation window. It validates
  configuration and creates output directories on construction.
- `schemas.py` defines immutable metadata, artifact, result, and validated
  dataset contracts shared across future stages.
- `dataset_loader.py` defines the abstract boundary and the CERT r4.2 subset
  implementation for obtaining validated feature-stage rows.
- `pipeline.py` defines the injectable stage boundaries and sequential
  end-to-end `run()` workflow.
- `runner.py` defines the `ExperimentRunner` contract and
  `DefaultExperimentRunner`, which delegates to `ExperimentPipeline`.
- `exporter.py` defines the abstract artifact export boundary.
- `metadata.py` defines the abstract reproducibility metadata provider.
- `exceptions.py` defines typed configuration, dataset, and execution errors.
- `__init__.py` re-exports the package's public contracts.

## Workflow and extension points

`ExperimentPipeline.run()` orchestrates the implemented stages sequentially:

1. Load and validate source dataset rows.
2. Delegate feature engineering and feature artifact export.
3. Delegate ML dataset creation, splitting, balancing, preprocessing, and export.
4. Delegate training for the configured model selection.
5. Delegate comparison for the selected models.
6. Delegate SHAP, global importance, optional local explanation, and reports.
7. Collect the original stage results and execution metadata in an immutable
   `ExperimentRunResult`.

The pipeline does not run stages concurrently, retry failures, cache stage
outputs, or wrap exceptions from failed stages. A failure stops subsequent
stages and propagates to the caller. Stage result objects are retained in the
aggregate without rewriting their contents. Frozen dataclasses provide stable
typed boundaries for configuration and results; concrete stage implementations
remain dependency-injectable.

Execution metadata captures the experiment name, configured dataset path,
random seed, selected models, and UTC completion timestamp. The run result
also records elapsed duration. Reproducibility still depends on the existing
stages and their supplied configuration; metadata does not inspect the runtime
environment or itself guarantee reproducibility.

## Sprint 7.4 Step 2: CERT dataset loading

`CERTExperimentDatasetLoader` defaults to
`backend/data/raw/cert_r4.2_subset/`. A different directory can be supplied
when constructing the loader or to `load()`. The loader returns an
`ExperimentDatasetLoadResult` containing `ValidatedCSVRows` objects imported
from the Feature Engineering package; it does not define a duplicate row
schema.

Supported root tables are `logon.csv`, `device.csv`, `file.csv`, `http.csv`,
`email.csv`, and the canonical root-level `ldap.csv`. LDAP history/snapshot
CSVs beneath `LDAP/` (including nested directories) are skipped with an INFO
message such as `Skipping LDAP snapshot: ldap/<filename>.csv`; they do not
produce additional LDAP datasets. Unsupported CERT CSV files (including
`psychometric.csv` and future unknown root-level CSV names) are skipped with
an INFO log message of the form
`Skipping unsupported CERT dataset: <filename>`. Supported files continue to
be validated and loaded. Other extensions, hidden paths, and files in any
`answers/` directory are ignored as behavioral tables. The canonical
`answers/insiders.csv` is separately loaded as ground-truth metadata when
present; it is not passed to feature extraction as a behavioral dataset.
Ground-truth rows require `user`, `start`, and `end` columns.

CSV files are decoded as UTF-8 (a UTF-8 BOM is accepted). The loader validates
that each supported CSV is non-empty, has non-empty unique headers, contains
the required columns (`date`, `user`, and `pc` for event tables; `user_id` for
LDAP), and has consistent record widths. Invalid encoding or CSV syntax and
files changing during validation/iteration produce typed dataset errors.
Headers and record order are preserved. Feature-stage row numbers are the
one-based CSV record ordinals including the header (first data row is row 2).

Load metadata records the resolved source directory, a deterministic dataset
SHA-256 derived from each relative CSV path and content digest, file count,
per-file data-row counts, and a UTC load timestamp. Files are scanned to
validate and calculate metadata; their rows are exposed through replayable
iterables so the loader does not retain large datasets in memory. Reproducible
content hashes and ordering are stable for unchanged files; load timestamps
vary by run. When `answers/insiders.csv` exists, its content hash and row count
are included in the load metadata along with parsed insider activity intervals.

`ExperimentPipeline.load_dataset()` delegates to its injected
`ExperimentDatasetLoader`, using the default CERT loader unless one is
provided. The full experiment `run()` remains abstract.

## Sprint 8.1 Step 3: Feature Engineering integration

`ExperimentPipeline.feature_engineering()` delegates the supplied
`ValidatedCSVRows` object or iterable of those objects directly to the injected
`app.features.FeaturePipeline`. The feature pipeline receives the aggregation
window and optional temporal, behavioral-risk, encoding, and output-directory
overrides. Its `FeatureEngineeringRunResult` is returned unchanged, and
feature-stage exceptions propagate to the caller.

This boundary does not duplicate feature extraction or transform the result.
It performs no ML preprocessing, ML dataset creation, splitting, balancing,
scaling, model training, model evaluation, SHAP generation, or report
generation. The feature package owns its existing feature generation and
feature-artifact export behavior.

For CERT supervised runs, the canonical insider answer intervals flow
alongside the behavioral sources to the feature pipeline. After aggregation
and encoding, each user/window row is joined to those authoritative intervals:
windows overlapping an interval receive the `insider` target value, and other
windows receive `normal`. No target is inferred from behavioral feature values.
The encoded feature schema remains separate from the target schema, while
`insider` and each row's label are included in the CSV, Parquet, and feature
metadata artifacts.

## Sprint 8.1 Step 4: Machine Learning Pipeline integration

`ExperimentPipeline.machine_learning()` adapts the already encoded
`FeatureEngineeringRunResult` into the existing ML package's `MLDataset`
input contract, preserving the encoded feature names, row identifiers, and
numeric values. It packages that dataset with a caller-provided
`DatasetLoadConfig` (or a default config referencing the feature Parquet
artifact), plus the optional split, balancing, and preprocessing configs, in
the existing `MLPipelineRequest`.

The method delegates once to the existing `MLPipeline.run()` and returns its
`MLPipelineResult` unchanged. The optional output directory is passed to the
ML pipeline factory, which configures the existing `MLExporter`; no ML pipeline
implementation or ML output is rewritten by the experiment package. Pipeline
errors propagate unchanged.

The adapter obtains the target name and per-row label values from the encoded
feature result, populates `MLDataset.label_name` and `MLRecord.label`, and keeps
labels out of the model feature values. The target column is added to a default
`DatasetLoadConfig`; an explicitly configured target must match the encoded
target, and selecting it as a feature is rejected. Stratification is enabled
by the existing default split configuration, while an explicitly supplied
split configuration is forwarded unchanged. If ground truth is unavailable
and the encoded result has no target column or labels, the experiment raises
`ExperimentConfigurationError` before invoking `MLPipeline`; supervised
training does not continue with fabricated labels.

Each adapted `MLRecord.subject_id` is a deterministic row identifier formed
from the original subject ID and its one-based source row ordinal (for example,
`EMP001_000001`). This keeps repeated behavioral windows for the same person
distinct while preserving input order and retaining the original subject ID
within the identifier. The ML package's existing integrity validator and
splitter therefore receive unique source row identities without changing
feature-engineering or ML behavior.

This is integration wiring only: no preprocessing or feature-selection logic
is duplicated in the experiment package. Configured partitioning, balancing,
preprocessing, validation, and ML artifact export continue to follow the
existing ML package behavior. This step adds no model training, evaluation,
explainability, or experiment report generation.

## Sprint 8.1 Step 5: Model Training integration

`ExperimentPipeline.model_training()` adapts the already split and preprocessed
partitions from the `MLPipelineResult` into the existing models package's
`PreprocessedSplitResult`. It delegates each selected registered model to
`ModelPipeline.run()` using a `ModelTrainingRequest`; it does not train models
or alter the results itself.

The ModelPipeline contract compares each partition's `MLDataset.label_name`
with `ModelTrainingConfig.target_column` (or, when unset, the training
partition's own `label_name`). The adapter resolves the target from an explicit
training config first, then `PreprocessingMetadata.target_column`, and finally
the training partition's `label_name`. It ensures the train, validation, and
test dataset wrappers all expose that exact name. When a wrapper needs a name
restored, only that immutable wrapper is copied; feature names, records,
feature values, and row labels remain unchanged. Conflicting explicit target
names across selected model configs are rejected. This aligns the adapter with
ModelPipeline's target comparison without changing ML or training behavior.

The supported selections are `LogisticRegression`, `DecisionTree`,
`RandomForest`, and `XGBoost`. By default one Logistic Regression model is
selected. Multiple selections are delegated individually and return a tuple
of the unchanged `ModelPipelineResult` objects; a single selection returns
that unchanged result directly. Optional per-model `ModelTrainingConfig`
objects are passed through as supplied. Otherwise each request uses the
configured random seed. The output directory is supplied as the model
pipeline's artifact directory, and an optional existing `ModelPersistence`
implementation is injected into that pipeline.

This step does not duplicate model algorithms, training configuration
handling, evaluation logic, explainability generation, or experiment report
generation. The existing model pipeline's own behavior and outputs remain
unchanged.

## Sprint 8.1 Step 6: Model Comparison integration

`ExperimentPipeline.compare_models()` accepts the result or result tuple from
the latest successful `model_training()` call on the same pipeline instance.
The experiment pipeline retains that call's prepared partitions and uses the
result metadata to select the model names and hyperparameters. It delegates
once to the existing `ModelPipeline.compare_models()` and returns the
`ModelComparisonResult` unchanged.

The comparison stage forwards the output directory, primary ranking metric,
evaluation partition, random seed, chart-generation flag, and optional model
configurations supported by `ModelPipeline.compare_models()`. The existing
comparison implementation owns comparison behavior, metric calculation,
ranking, and its reports. Its tie-breaking behavior is fixed and deterministic
in the existing ranking implementation; the current comparison API does not
expose a tie-breaker override, so the experiment wrapper does not add or
simulate one.

The existing comparator accepts prepared partitions rather than previously
trained `ModelPipelineResult` objects. Accordingly, the supplied training
results identify the model configurations, while comparison delegates those
configurations and the retained partitions to the existing comparator, which
performs its documented comparison workflow. No comparison, ranking,
evaluation metric, or reporting logic is implemented by the experiment
package.

## Sprint 8.1 Step 7: Explainability integration

`ExperimentPipeline.explainability()` accepts the result or result tuple from
the latest successful `model_training()` call on that same pipeline instance.
It uses the result's trained `Model` and defaults to the retained test
partition; callers may supply a different `MLDataset`. For each model, it
delegates SHAP generation, global feature importance, optional local
explanation, and report generation to the existing `ExplainabilityPipeline`.
The generated stage result objects are returned by identity inside an
`ExperimentExplainabilityResult`; multiple models return a tuple of those
containers. Local explanations default to sample index 0 and can be omitted
by setting `local_sample_index=None`.

The SHAP `ExplainerConfig` is forwarded unchanged to the SHAP, global, and
local methods. The output directory is passed to the existing pipeline and
its output-producing methods. The current explainability package has no
separate report-configuration or visualization-configuration parameters:
report formats and visualizations follow its existing `generate_reports()`
behavior. The integration does not add or emulate configuration options that
the existing API does not expose.

No SHAP/LIME algorithm, report serialization, or visualization logic is
implemented in the experiment package. Explainability failures propagate from
the existing pipeline unchanged.

## Sprint 8.1 Step 8: End-to-end experiment runner

`ExperimentPipeline.run()` executes the complete workflow in strict order:
dataset loading, feature engineering, ML preparation, model training, model
comparison, explainability, and result aggregation. It invokes the existing
stage integration methods exactly once, forwarding the relevant configuration
objects and output locations from `ExperimentConfig` and its keyword options.
The dataset path controls loading; feature output uses `feature_directory`;
ML, training, and comparison use `output_directory`; explainability uses
`explainability_directory`.

The immutable `ExperimentRunResult` retains stage result objects without
rewriting them and includes `ExperimentMetadata` with the experiment name,
dataset path, selected models, random seed, and UTC completion timestamp. It
also records elapsed duration in seconds. Failures propagate immediately and
prevent downstream stages from running; there are no retries, caching,
parallel stages, background tasks, CLI, or API endpoints.

Run reproducibility depends on the fixed seed and configurations forwarded to
the existing modules, as well as deterministic behavior of those modules and
unchanged inputs. The execution timestamp and duration are expected to vary.

## Sprint 8.1 Step 9: Default experiment runner

`DefaultExperimentRunner` accepts an injected `ExperimentPipeline` and creates
the default pipeline when none is supplied. Its `run()` method logs the start,
delegates exactly once to `pipeline.run(config)`, measures elapsed wall-clock
duration, logs successful completion, and returns the same
`ExperimentRunResult` object without modification.

Configuration and execution errors from the pipeline are logged and re-raised
unchanged. Unexpected exceptions are logged and wrapped in
`ExperimentExecutionError` with the original exception chained as the cause.
The runner adds no stage orchestration or feature, ML, training, comparison,
explainability, report, or dataset behavior of its own.

## Sprint 8.2 Step 1: experiment execution CLI

Run the workflow from the backend directory with:

```powershell
python -m app.experiments
```

The CLI builds `ExperimentConfig` and delegates execution to
`DefaultExperimentRunner`. Optional arguments configure the CERT dataset path,
output directory, random seed, and one or more registered models:

```powershell
python -m app.experiments `
  --dataset-path data/raw/cert_r4.2_subset `
  --output-directory data/experiments/run-1 `
  --random-seed 42 `
  --selected-models LogisticRegression DecisionTree
```

By default, the CLI reads `data/raw/cert_r4.2_subset`, writes outputs beneath
`data/experiments/default`, uses seed `42`, and selects all four registered
models: `LogisticRegression`, `DecisionTree`, `RandomForest`, and `XGBoost`.
The feature and explainability stages receive `features/` and `explainability/`
subdirectories of the chosen output directory. Artifact files are written by
the existing pipeline stages; the CLI only displays their returned paths and
does not recreate, serialize, or otherwise transform stage outputs. It prints
a concise failure message and returns a non-zero process status if execution
fails.

`ExperimentConfig()` can be used directly with no arguments. It defaults to
the CERT r4.2 subset directory, output directory `data/experiments/default`,
seed `42`, all four registered models, and daily aggregation. If only a
different output directory is provided, feature and explainability output
directories are derived as its `features/` and `explainability/` children.
Construction fails with `ExperimentConfigurationError` if the dataset path
does not exist as a directory, the seed is not a non-negative integer, model
selection is empty/unsupported/duplicated, or output directories cannot be
created. No training or evaluation logic is part of configuration validation.

## Limitations

The runner is orchestration only: feature engineering, ML preparation, model
training, comparison, and explainability remain delegated to their existing
packages. The explainability package does not expose separate report or
visualization configuration types. Dataset loading performs structural checks
only; event timestamp formats and required row-cell values remain the
responsibility of the feature pipeline.
