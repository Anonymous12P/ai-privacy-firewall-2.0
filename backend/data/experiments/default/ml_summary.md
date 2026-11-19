# ML Dataset Preparation Summary

- Dataset: `experiment-features`
- Source SHA-256: `861ebc847a8f05fbbb76047220e51ca8478022a71306b76d7c1ed4666257987b`
- Reproducibility fingerprint: `0e333a7c1d69633519cd6d3793eea23a5310cd6580a5e2aa6921400375321fd6`
- Target column: `insider`
- Feature columns: 114
- Scaling: `none`
- Balancing: `none`

## Prepared partitions

| Partition | Rows | Columns |
|---|---:|---:|
| Train | 23426 | 115 |
| Validation | 5020 | 115 |
| Test | 5020 | 115 |

## Exported files

- `experiment-features_train.csv`
- `experiment-features_train.parquet`
- `experiment-features_validation.csv`
- `experiment-features_validation.parquet`
- `experiment-features_test.csv`
- `experiment-features_test.parquet`
- `ml_metadata.json`
- `ml_summary.md`
- `ml_manifest.json`

The manifest contains hashes for every data and report artifact. Its own hash is returned by the pipeline result because a manifest cannot include its own stable SHA-256.
