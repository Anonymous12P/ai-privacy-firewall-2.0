"""Shared CSV, hashing, and serialization helpers for dataset subsetting."""

import csv
import hashlib
import json
from pathlib import Path

from app.dataset_subset.exceptions import (
    DatasetCSVError,
    DatasetSubsetError,
    UserColumnNotFoundError,
)

HASH_CHUNK_SIZE_BYTES = 1024 * 1024
USER_COLUMN_NAMES = ("user", "user_id")


def sha256_file(path: Path) -> str:
    """Return the SHA-256 digest of a file using bounded memory."""
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(
            lambda: stream.read(HASH_CHUNK_SIZE_BYTES),
            b"",
        ):
            digest.update(chunk)
    return digest.hexdigest()


def find_user_column(header: list[str], path: Path) -> int:
    """Return the index of a supported user identifier column."""
    names = {name.strip().casefold(): index for index, name in enumerate(header)}
    for column_name in USER_COLUMN_NAMES:
        if column_name in names:
            return names[column_name]
    raise UserColumnNotFoundError(
        f"CSV file has no recognized user identifier column: {path}"
    )


def read_user_ids(path: Path) -> set[str]:
    """Read unique non-empty identifiers from a CSV's user column."""
    users: set[str] = set()
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as stream:
            reader = csv.reader(stream, strict=True)
            header = next(reader, None)
            if not header:
                raise DatasetCSVError(f"CSV file has no header: {path}")
            user_index = find_user_column(header, path)
            for row_number, row in enumerate(reader, start=2):
                if user_index >= len(row) or not row[user_index].strip():
                    raise DatasetSubsetError(
                        f"Missing user identifier in {path} at row {row_number}."
                    )
                users.add(row[user_index].strip())
    except (OSError, UnicodeError, csv.Error) as exc:
        raise DatasetCSVError(
            f"Unable to read user identifiers from {path}: {exc}"
        ) from exc
    return users


def write_json(path: Path, data: dict[str, object]) -> None:
    """Write stable, human-readable UTF-8 JSON with a trailing newline."""
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        json.dump(data, stream, indent=2, ensure_ascii=False, sort_keys=True)
        stream.write("\n")
