# Dataset Acquisition and Analysis

## Official CERT r4.2 source

The only approved source for this project is the [CERT Insider Threat Test
Dataset page at Carnegie Mellon University's Software Engineering
Institute](https://www.sei.cmu.edu/library/insider-threat-test-dataset/). SEI
links to the public [Carnegie Mellon KiltHub DOI record](https://doi.org/10.1184/R1/12841247.v1).
The record identifies the dataset as **CC BY 4.0** and lists the Release 4.2
archive, `r4.2.tar.bz2` (4,824,287,500 bytes). Its official download endpoint
is <https://ndownloader.figshare.com/files/24856766>. The KiltHub record
publishes the archive MD5 `cf64caa378acb77cd0c608a5576d998c`.

The public record does not indicate a registration or separate license
acceptance gate. Follow the source record and its CC BY 4.0 attribution terms.
Do not use unofficial mirrors or generate substitute CERT data. The r4.2
archive is the required package for this inventory; the separate
`answers.tar.bz2` contains scenario/answer-key information and is not required
for dataset inventory or descriptive statistics.

Download or place the official archive only in
`backend/data/raw/cert_r4.2/r4.2.tar.bz2`. After verifying the official archive,
extract its contents in that same directory while preserving archive member
names. Do not modify the extracted source files. The scanner discovers
behavioral CSV files there, including the root-level logon, device, file,
email, http, and psychometric tables and CSV snapshots under `LDAP/`. It
excludes every directory named `answers/` (case-insensitively), including its
ground-truth CSVs, from inventory and statistics. Raw source data is excluded
from version control.

## Directory structure

```text
backend/
`-- data/
    |-- raw/
    |   `-- cert_r4.2/       # Official source archive and its extracted files
    |-- interim/             # Generated inventory and analysis reports
    |-- processed/           # Reserved; this sprint does not write here
    `-- external/            # Reserved for external reference inputs
```

No feature engineering, cleaning, preprocessing, model training, or dataset
mutation is performed in Sprint 5.7.

## Inventory and statistics

Run from the backend directory:

```powershell
python -m app.dataset_inventory
```

The command uses the configured `RAW_DATA_DIR` and `INTERIM_DATA_DIR` values.
It scans `RAW_DATA_DIR/cert_r4.2` and writes:

- `backend/data/interim/dataset_inventory.json`
- `backend/data/interim/dataset_statistics.json`
- `backend/data/interim/dataset_summary.md`

The scanner recursively finds eligible `.csv` files (case-insensitive), counts
records and header columns, identifies supported text encodings and common
delimiters, computes SHA-256 in fixed-size chunks, and records file size and
modification time. Files in any `answers/` directory are skipped before they
are opened, so answer-key formats and encodings do not affect behavioral
dataset inventory or statistics. CSV rows are streamed; complete files are
never loaded into a dataframe or retained in memory.

Statistics report missing-value counts by column, exact duplicate record
counts, conservative date/numeric/categorical type groups, and a sampled
Python-object memory estimate. Exact duplicate detection stores row digests in
a temporary SQLite index under the configured interim directory; the
temporary index is removed after each run. Shared header names are reported as
potential join-key candidates only; uniqueness and referential integrity are
not inferred.

The three reports reflect only files actually found at scan time. If the
source directory is empty, reports explicitly record that no dataset analysis
was possible rather than inventing dataset contents or statistics.

## Verification and limitations

Only UTF-8 (with or without BOM), UTF-16 with a byte-order mark, and
Windows-1252 samples without unsupported control characters are accepted.
Encoding identification is heuristic for non-BOM encodings. Memory figures
are estimates from a bounded row sample, not peak process measurements.
Duplicate counting uses disk space proportional to the number of distinct row
fingerprints. The scanner detects files changing during a run and rejects
symbolic-link CSV inputs.
