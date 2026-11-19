# Sprint 6.1 — Feature Engineering

## Step 1 — Architecture

## Scope

This step establishes typed boundaries and package structure for future
behavioral, temporal, aggregation, encoding, and risk-scoring components. It
does not implement feature extraction, read datasets, preprocess data, or
contain machine-learning algorithms. No dataset or model lifecycle is wired
into the package.

## Package structure

```text
backend/app/features/
├── __init__.py
├── extractor.py
├── aggregations.py
├── behavioral.py
├── temporal.py
├── risk_scores.py
├── encoder.py
├── validator.py
├── metadata.py
├── exporter.py
├── schemas.py
├── pipeline.py
└── exceptions.py
```

The package exposes abstract contracts for an application-facing feature
extractor and pipeline, aggregation strategies, behavioral and temporal
extractors, an encoder, and a risk-score calculator. Implementations belong in
later sprint steps; these interfaces deliberately do not provide executable
data-processing behavior.

## Data contracts

`schemas.py` defines immutable dataclasses for a feature request and context,
domain feature groups, a subject-level feature set, an explicitly ordered
encoded feature vector, and a risk-score result. `FeatureValue` is a scalar
type alias; `RiskLevel` provides qualitative score labels. These contracts
describe data shape only and do not load, transform, or validate datasets.

## Exceptions and dependencies

`exceptions.py` defines a common `FeatureError` base with extraction, schema,
and orchestration subclasses. The feature package depends only on its own
schemas and standard-library abstractions; it is not coupled to dataset or
preprocessing implementations.

Step 1 established typed contracts, abstract component interfaces, and
exceptions. Step 2 implements only validated-row extraction, as described
below.

## Step 2 — CERT row extraction

`FeaturePipeline` accepts a `ValidatedCSVRows` value containing a CERT dataset
kind, its parsed header, and an iterable of row mappings supplied by an
upstream CSV-validation stage. It routes rows to one of the concrete
`LogonFeatureExtractor`, `FileFeatureExtractor`, `DeviceFeatureExtractor`,
`HTTPFeatureExtractor`, `EmailFeatureExtractor`, or `LDAPFeatureExtractor`
implementations. This package does not discover or open paths, load datasets,
or invoke preprocessing. The source must have been validated by its caller.

Each extractor checks the required header columns and converts each input row
to a typed `FeatureRecord`, preserving supported source fields as strings and
ignoring unknown columns. Event records require `date`, `user`, and `pc`.
`date` is parsed as ISO 8601 or a supported CERT-style timestamp; LDAP
directory records require `user_id` and have no event timestamp. Source row
numbers are one-based CSV line numbers, with the header at line 1. Header
problems report row 1; malformed records and timestamps report the exact data
row.

`FeaturePipelineResult` contains the dataset kind and extracted records.
`FeaturePipeline.extract()` exposes extraction independently. Unit tests cover
each extractor family, routing,
unknown columns, required headers and values, timestamp formats and failures,
single-pass row iterables, and row-numbered exceptions.

## Step 3 — Behavioral window aggregation

`BehavioralAggregator` consumes one or more `FeaturePipelineResult` values.
It first groups event records independently by source dataset, subject, and
configured calendar window, then merges those source aggregates by subject and
window. `AggregationWindow` supports daily, weekly, and monthly windows:
weeks start on Monday, month windows use calendar month boundaries, and all
window end dates are exclusive. Windows use each timestamp's own calendar
date; offsets are not normalized before calendar grouping.

`BehavioralFeatureRecord` contains per-source event counts, per-source and
per-column unique entity counts, the earliest and latest event timestamps,
and LDAP attributes. Unique entities are non-empty distinct source values
from the configured entity columns (for example, computer, filename, URL,
and email participant fields). First/last times are chronological. A single
aggregate cannot mix naive and timezone-aware timestamps because their order
would be ambiguous.

LDAP directory rows have no event timestamp. For each subject, aggregation
uses the supplied LDAP record with the greatest source row number (later
result order breaks ties) and carries those attributes into every matching
event window. LDAP-only subjects do not create synthetic time windows.
The dedicated `FeaturePipeline.aggregate()` operation returns an
`AggregatedFeatureSet`. The complete `FeaturePipeline.run()` workflow is
described in Step 7.

## Step 4 — Temporal feature generation

`TemporalFeatureGenerator.generate(aggregated, config)` consumes an
`AggregatedFeatureSet` and returns a deterministically ordered
`TemporalFeatureSet`. Each `TemporalFeatureRecord` corresponds to one
user/window and contains login/logout wall-clock time mean/min/max, completed
session count and duration total/mean/max, weekday/weekend and business/after
hours event counts, and per-source activity frequencies.

The behavioral aggregation contract carries event timestamps by source and
classifies Logon dataset `activity` values `Logon` and `Logoff`. Session
durations pair each logout with the most recent preceding unmatched login
within that same aggregated window. Unmatched logins/logouts are not counted
as sessions; sessions spanning aggregated-window boundaries cannot be
reconstructed by this stage. Login/logout clock metrics use the source
timestamp's wall-clock fields.

`TemporalFeatureConfig` controls business opening/closing hours and weekend
weekday indexes (Monday=0 through Sunday=6). Business opening is inclusive,
closing is exclusive, and business/weekend classifications are independent:
a weekend event during configured business hours contributes to both counts.
After-hours means outside the configured clock interval. Activity frequencies
are per-source event-count proportions within a user/window (they sum to one
when event counts are nonzero); these are not scaled/normalized model features.

When the aggregate has no timestamps, time-of-day, session, weekday/weekend,
and business/after-hours metrics are `None`. Missing login or logout timestamps
make the corresponding clock metrics `None`; if there is no completed session,
session metrics are `None`. Existing event counts can still produce activity
proportions. The temporal stage does not encode features, scale/normalize
values, score risk, preprocess, write files, or train machine-learning models.

## Step 5 — Behavioral risk indicators

`BehavioralRiskGenerator.generate(temporal, config)` consumes temporal
records and returns a deterministically ordered `RiskFeatureSet`.
`FeaturePipeline.generate_risk()` exposes the same stage for application
orchestration. The output `RiskFeatureRecord` retains the raw indicator values,
each component score, and the final `behavioral_risk_index` for
explainability.

The six deterministic components cover:

- **Login:** fraction of login timestamps outside configured business hours or
  on a configured weekend day.
- **File:** unique filenames whose suffix matches configured suspicious
  extensions.
- **USB:** Device connect, insert, attach, or mount activity occurrences.
- **Email:** email event count.
- **HTTP:** unique URLs whose host exactly matches, or is a subdomain of, a
  configured suspicious domain.
- **Session:** longest completed session duration in seconds.

`BehavioralRiskConfig` configures business hours, weekend weekday indexes,
suspicious domains and extensions, component thresholds, and component
weights. An indicator reaches a score of 100 at its threshold and is capped
there; the overall index is the weighted mean of observed component scores,
bounded to 0–100. Configured weights for missing indicators are excluded from
that mean, so unavailable evidence is not treated as a zero-risk observation.
When no component has evidence, the index is 0 and all raw indicators are
`None`. Defaults are transparent heuristic values and are not calibrated or
predictive.

This step does not implement anomaly detection, prediction, machine learning,
feature encoding, preprocessing, scaling, SHAP/LIME, or dataset export.

## Step 7 — End-to-end pipeline and export

`FeaturePipeline.run(sources, ...)` now runs the complete ordered workflow:
validated row extraction → behavioral aggregation → temporal generation →
behavioral risk indicators → categorical encoding → final validation → export.
It returns a `FeatureEngineeringRunResult` containing the typed intermediate
stage results and a `FeatureExportResult`. The input remains caller-supplied
`ValidatedCSVRows`; the feature pipeline does not discover, open, or modify
raw dataset files.

The final encoded feature set is checked for non-empty unique column names,
correct row widths, unique subject/window records, deterministic row ordering,
and finite numeric values. Invalid output raises `FeatureValidationError`
before writing artifacts.

The full pipeline optionally accepts `CERTGroundTruth` interval annotations.
After encoding, it joins those source labels to rows by subject and aggregation
window. A window overlapping an insider interval is labeled `insider`; other
windows are labeled `normal`. This target remains separate from `feature_names`
and numeric feature values, but is included as its own column in CSV and Parquet
artifacts and recorded as `target_column` in feature metadata. Without supplied
ground truth, feature encoding and export remain feature-only.

By default, `FeatureExporter` creates `backend/data/processed/` as needed.
`output_directory` can be supplied to `run()` for an alternate destination,
including isolated test folders. The exporter writes:

- `features.csv` as UTF-8 with stable column/row ordering and LF line endings;
  an optional target column follows the feature columns.
- `features.parquet` with stable feature types and explicit compression and
  Parquet format options; an optional target retains its categorical label
  values.
- `feature_metadata.json` with UTC run time, Python version, source dataset and
  row counts, feature names, optional target column, configurations, and
  CSV/Parquet SHA-256 digests.
- `feature_summary.md` with row/column counts, source datasets, feature names,
  and data artifact digests.
- `pipeline_manifest.json` with SHA-256 hashes for CSV, Parquet, metadata, and
  summary artifacts, along with schema and row/feature counts.

Text outputs use canonical JSON key ordering, UTF-8, and a final newline;
individual artifacts are replaced atomically. Equivalent inputs, ground truth,
and configuration produce byte-identical CSV and Parquet data artifacts and
summary content. `feature_metadata.json` includes a fresh `generated_at` run
timestamp, so its digest and the manifest digest intentionally differ between
runs. Hashes are calculated by streaming file bytes, not by reading exported
artifacts into memory.

Parquet export uses the `pyarrow` dependency. The stage does not implement
feature selection, scaling, resampling, model training, machine learning,
SHAP/LIME, or mutation of raw datasets.

## Step 6 — Feature encoding

`FeatureEncoder.encode(risk_features, config)` converts the categorical
`subject_id` and `window` fields of a `RiskFeatureSet` to numeric columns and
returns an `EncodedFeatureSet`. Rows are ordered by subject and window bounds;
categorical columns and their vocabularies are sorted for stable output. The
numeric risk indicators, component scores, and overall index are passed through
without scaling. A `None` numeric indicator uses the configured
`numeric_missing_value` (zero by default).

`FeatureEncodingConfig` supports:

- **one_hot** (default): one binary column per category.
- **label**: stable integer labels from the sorted vocabulary.
- **frequency**: category occurrence proportions in the encoded batch.

An optional `known_categories` vocabulary makes output columns stable across
batches. When omitted, the current batch supplies the vocabulary. Missing
categorical values can become a dedicated `__MISSING__` category, be ignored
(all-zero one-hot, `-1` label, or zero frequency), or raise
`FeatureEncodingError`. Values outside an explicitly configured vocabulary can
be represented by `__UNKNOWN__`, ignored using the same neutral representation,
or rejected. A batch-derived vocabulary has no unseen categories by definition.

`FeatureEncodingMetadata` records the selected strategy, numerical mappings,
categorical output columns, numeric columns, and missing/unseen policies.
`FeaturePipeline.encode_risk()` makes this stage available after risk
generation. Encoding does not scale values, select features, resample data,
write exports, or train or invoke machine-learning models.
