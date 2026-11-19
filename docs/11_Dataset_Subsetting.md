# Dataset Subsetting

## Purpose and workflow

The `app.dataset_subset` package creates a deterministic, user-based subset of
the CMU CERT r4.2 dataset without modifying its source files. It reads unique
user IDs from `logon.csv`, selects the requested share with a seeded random
generator, and streams matching rows into a separate output directory.

The pipeline handles `logon.csv`, `device.csv`, `file.csv`, `email.csv`,
`http.csv`, `psychometric.csv`, all CSV snapshots below `LDAP/`, and
`answers/insiders.csv` when present either in the dataset directory or next to
it. Rows are associated using the `user` or `user_id` column. For email data,
the `user` column identifies the activity owner; recipient fields do not
change row ownership.

The pipeline generates:

- `subset_report.json` with configuration, selected users, row counts, output
  paths, SHA-256 hashes, and a UTC generation timestamp.
- `subset_report.md` with a readable summary of the same information.
- `subset_manifest.json` with the configuration, selected IDs, and per-file
  source/output paths, row counts, and output SHA-256 hashes.

Hashes cover the generated subset CSV files. Report and manifest files are not
self-hashed because including their own hashes would be circular.

## Configuration and usage

Defaults are 10 percent of users, random seed `42`, source
`backend/data/raw/cert_r4.2/`, and output
`backend/data/raw/cert_r4.2_subset/`. The selected count rounds up to the
nearest user, with at least one selected user when the source has users.
`actual_percentage` in the reports records the percentage after rounding.

From the `backend` directory:

```powershell
python -m app.dataset_subset
python -m app.dataset_subset --percentage 20 --seed 123
python -m app.dataset_subset `
  --source-directory data/raw/cert_r4.2 `
  --output-directory data/raw/cert_r4.2_subset
```

The same source data, percentage, and seed select the same user IDs and emit
the same subset CSV contents. Report timestamps are generated per run, so the
report and manifest files are not byte-for-byte identical between runs.

## Validation and safety

The pipeline checks that all required CSVs and at least one LDAP CSV are
available, validates user identifier columns and non-empty IDs, rejects an
output directory that overlaps the source, and reports CSV/read failures
explicitly. It streams CSV rows and computes SHA-256 hashes in bounded chunks,
so large CERT event tables do not need to fit in memory. The original source
files are only opened for reading.

## Limitations

- The selected population is derived from unique users present in
  `logon.csv`; users found only in another table are not added to the sample.
- A row is retained based on its designated owner ID. For email, this is the
  `user` column, not the `to`, `cc`, `bcc`, or `from` fields.
- CSV values are preserved, but output quoting and line endings are normalized
  by Python's CSV writer.
- The pipeline produces data subsets and audit metadata only; it does not
  anonymize, clean, or otherwise transform sensitive source values.
