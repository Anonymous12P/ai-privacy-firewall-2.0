# Sprint 7.1 — Machine Learning Architecture

## Step 1 — Architecture scaffold

### Scope

The initial architecture step established typed contracts for the future
machine-learning workflow. It did not split datasets, balance classes,
preprocess or scale features, train algorithms, evaluate models, or provide
explainability.

### Package structure

```text
backend/app/ml/
├── __init__.py
├── dataset.py
├── splitter.py
├── balancer.py
├── preprocessor.py
├── pipeline.py
├── schemas.py
└── exceptions.py
```

### Responsibilities

- **`schemas.py`** defines immutable dataclasses for source and pipeline
  configuration, datasets and records, partitions, preprocessing metadata,
  requests, and expected pipeline results.
- **`dataset.py`** defines dataset loading and schema-validation boundaries;
  Step 2 adds CSV and Parquet loading for engineered features.
- **`splitter.py`** defines the contract for train, validation, and test
  partitioning.
- **`balancer.py`** defines the training-only balancing boundary; Step 4 adds
  optional no-op, random sampling, and SMOTE strategies.
- **`preprocessor.py`** defines fit/transform boundaries for future
  preprocessing. No imputation or scaling implementation is included.
- **`pipeline.py`** provides dataset loading while retaining an abstract
  contract for end-to-end ML workflow execution.
- **`exceptions.py`** supplies typed base and stage-specific errors for later
  implementations.
- **`__init__.py`** exports the package's public contracts and types.

### Intended future flow

The planned workflow is feature dataset loading/validation →
train/validation/test split → training-only balancing → fit preprocessing on
training data → apply the fitted state to held-out partitions → model training
and evaluation. Dataset loading is implemented in Step 2; later stages remain
contracts only.

### Current status

The architecture, loading, splitting, balancing, and preprocessing stages are
implemented in their corresponding sprint steps. Sprint 7.1 Step 6 adds the
complete dataset preparation and export workflow. Model training, metrics,
inference, and explainability remain out of scope.

## Step 2 — Engineered dataset loading

`FeatureDatasetLoader.load(DatasetLoadConfig)` loads the feature table
referenced by `DatasetConfig.path`. Format detection uses `.csv`, `.parquet`,
or `.pq` suffixes unless an explicit compatible format is configured. CSV
files are decoded using the configured encoding (UTF-8 by default); Parquet
files use PyArrow. The loader preserves source row order and relative column
order. Optional `feature_columns` filters predictors while retaining their
file order, and `label_column` names the optional target. A configured target
must exist and is excluded from predictor values.

The resulting `MLDataset` contains ordered feature names and records. Each
record includes source-ordered feature values, an optional target label, and a
stable row-number subject identifier. `DatasetMetadata` records source path and
format, streaming SHA-256 digest, row and source-column counts, source column
order, selected feature names, numerical and categorical predictor lists,
missing-value counts per source column, and class distribution for non-missing
target labels.

Missing paths, unsupported extensions or format conflicts, malformed schemas,
and absent target columns produce typed errors (`MLDatasetNotFoundError`,
`MLUnsupportedFormatError`, `MLInvalidSchemaError`, and
`MLTargetColumnError`). `MLPipeline.load_dataset(config)` delegates to an injectable loader (defaulting
to `FeatureDatasetLoader`). `MLPipeline.run()` integrates the preparation
stages as described in Step 6.

Loading materializes the feature table in memory; it does not split data,
balance classes, preprocess or scale values, train models, or evaluate
predictions. Dataset files are only read, never modified.

## Step 3 — Dataset splitting

`DeterministicDatasetSplitter.split(dataset, config)` returns a `SplitResult`
containing train, validation, and test `MLDataset` partitions plus `SplitMetadata`.
The default proportions are 70/15/15, with deterministic stratified assignment
using seed 42. Set `strategy="random"` (or the compatibility `stratify=False`
option) for a random split. Split rows are stored in their original relative
order regardless of the random assignment.

Ratios must be finite, positive, and sum to 1.0; each split must receive at
least one row, so at least three input rows are required. For stratification,
a target column and non-null labels are required, and every class must have at
least three examples so it can be represented in each partition. Violations
raise `MLSplitError` or its specific subclass `MLStratificationError`.
Apportionment uses largest remainders with a one-per-split minimum; for small
classes, this constraint can make realized proportions differ from requested
ratios.

`SplitMetadata` records requested proportions, seed, selected strategy,
partition row counts, input row count, and non-missing class counts for each
partition. Assignment integrity is checked so each source row appears exactly
once and no row is shared across partitions. `MLPipeline.split_dataset()`
exposes the splitting stage via an injectable splitter. Splitting does not
balance, preprocess, scale, or train on the resulting partitions.

## Step 4 — Training-only class balancing

`ClassBalancer.balance(split, config)` accepts the complete `SplitResult` and
modifies only its training dataset. It returns `BalancedSplitResult`; the
validation and test datasets are returned unchanged. `MLPipeline.balance_split`
exposes the same operation through an injectable balancer.

Supported strategies are `none` (default), `random_over`,
`random_under`, and optional `smote`. Random over-sampling samples training
records with replacement; random under-sampling selects records without
replacement. Both preserve labels and existing feature values and use the
configured seed. `target_fraction` optionally sets the desired minority-to-
majority ratio; when omitted, random strategies balance all observed classes.
For multi-class labels, the target count is applied relative to the most
frequent class for over-sampling and the least frequent class for
under-sampling.

SMOTE is imported only when requested and requires the optional
`imbalanced-learn` dependency. If it is unavailable, the operation raises
`MLDependencyError`; it also rejects non-numeric or missing feature values and
classes with too few observations to synthesize examples. No dependency is
installed automatically.

`BalancingMetadata` records the selected strategy and seed, training row counts
before and after sampling, and class distributions. Empty training datasets
and missing target labels are rejected with `MLBalancingError`. A
single-class dataset is left unchanged for random methods. Validation and test
data are never sampled, oversampled, or passed to SMOTE.

## Step 5 — Train-fitted preprocessing

`MLPipeline.preprocess(split, config)` separates predictor values from record
labels and returns a `PreprocessedSplitResult` with transformed train,
validation, and test datasets plus `PreprocessingMetadata`. The partitions must
have the same ordered feature names and target column, and every record must
match that schema. Feature values supplied to this stage must be numeric or
missing; categorical values should be encoded in the upstream feature pipeline.
The result exposes separate ordered feature matrices (`x_train`,
`x_validation`, `x_test`) and target vectors (`y_train`, `y_validation`,
`y_test`) alongside the row-oriented datasets.

`PreprocessingConfig` supports `scaling_strategy="none"` (default),
`"standard"`, `"min_max"`, and `"robust"`. The selected scikit-learn scaler is
fitted only on training records and reused unchanged for validation and test.
Scaling parameters are captured as serializable vectors in the metadata.

Missing feature values are controlled by `missing_value_strategy`:

- `"raise"` (default) reports the first missing row and feature.
- `"leave"` preserves missing values; scikit-learn's supported scalers ignore
  missing cells during fitting and preserve them during transformation.
- `"constant"` fills missing cells in all three partitions with the configured
  numeric `missing_value_constant` before scaling.

`PreprocessingMetadata` records ordered feature names, feature count, target
column, scaling and missing-value strategies, fitted scaler parameters,
partition row counts, and generation time. The preprocessor rejects invalid
numeric values and schema mismatches with `MLPreprocessingError`. The
`scikit-learn` dependency is required for the standard, min-max, and robust
scalers.

This stage does not select features, perform PCA, train or evaluate models,
export datasets, or provide inference or explainability.

## Step 6 — End-to-end preparation and export

`MLPipeline.run(MLPipelineRequest)` is the single public entry point for the
dataset preparation workflow. It loads the configured feature dataset (or
accepts a caller-supplied typed `MLDataset`), validates the loader schema,
deterministically splits the source rows, balances only training data,
preprocesses all partitions using training-fitted state, validates partition
integrity and reproducibility, then exports the result.

The default export root is `backend/data/ml/`; the directory is created when
needed. Each of `train`, `validation`, and `test` is written as UTF-8 CSV and
Parquet using feature columns in source order followed by the configured target
column. The source feature file is read only and never modified. The exporter
also writes:

- `ml_metadata.json` with source digest, feature schema, split/balance/
  preprocessing settings, scaler parameters, partition sizes, and a stable
  reproducibility fingerprint.
- `ml_summary.md` with a human-readable overview and artifact list.
- `ml_manifest.json` with SHA-256 digests and sizes for all six data files,
  metadata, and summary.

`MLDatasetValidator` verifies that splitting assigned each original row once,
source order is retained within partitions, balancing left validation/test
unchanged, preprocessing kept feature/target schemas, row identities, and
labels intact, and that metadata's fingerprint matches the prepared data.
Source files loaded from disk use their file SHA-256. Caller-supplied
in-memory datasets use a canonical content digest instead. The fingerprint and
export formats exclude wall-clock timestamps to keep repeated runs byte-stable.

`MLExporter` writes artifacts atomically and returns each output path, size,
and SHA-256 in `MLPipelineResult`. The manifest hashes all payload artifacts;
its own hash is available in the returned result because a file cannot contain
its own stable SHA-256. Dataset names used in filenames are restricted to
filename-safe characters.

This final step prepares datasets only. It does not train models, evaluate
them, perform inference, or generate explainability outputs.
