"""Validated-row feature extraction and CERT source-specific extractors."""

import logging
from abc import ABC, abstractmethod
from datetime import datetime

from app.core.constants import APP_LOGGER_NAME
from app.features.exceptions import (
    FeatureColumnError,
    FeatureInputError,
    FeatureRowError,
    FeatureTimestampError,
)
from app.features.schemas import (
    CERTDataset,
    CSVRow,
    FeaturePipelineResult,
    FeatureRecord,
    ValidatedCSVRows,
)

logger: logging.Logger = logging.getLogger(f"{APP_LOGGER_NAME}.features.extractor")

_EVENT_COLUMNS: dict[CERTDataset, frozenset[str]] = {
    CERTDataset.LOGON: frozenset({"id", "date", "user", "pc", "activity"}),
    CERTDataset.FILE: frozenset({"id", "date", "user", "pc", "filename", "activity"}),
    CERTDataset.DEVICE: frozenset({"id", "date", "user", "pc", "activity"}),
    CERTDataset.HTTP: frozenset({"id", "date", "user", "pc", "url"}),
    CERTDataset.EMAIL: frozenset(
        {
            "id",
            "date",
            "user",
            "pc",
            "to",
            "cc",
            "bcc",
            "from",
            "size",
            "attachments",
            "content",
        }
    ),
    CERTDataset.LDAP: frozenset(
        {
            "user_id",
            "employee_name",
            "email",
            "role",
            "projects",
            "business_unit",
            "functional_unit",
            "department",
            "supervisor",
        }
    ),
}
_REQUIRED_COLUMNS: dict[CERTDataset, frozenset[str]] = {
    dataset: frozenset({"date", "user", "pc"})
    for dataset in (
        CERTDataset.LOGON,
        CERTDataset.FILE,
        CERTDataset.DEVICE,
        CERTDataset.HTTP,
        CERTDataset.EMAIL,
    )
}
_REQUIRED_COLUMNS[CERTDataset.LDAP] = frozenset({"user_id"})
_TIMESTAMP_FORMATS = (
    "%m/%d/%Y %H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d",
)


class FeatureExtractor(ABC):
    """Define the contract for extracting typed records from validated rows."""

    @abstractmethod
    def extract(self, source: ValidatedCSVRows) -> FeaturePipelineResult:
        """Convert validated source rows into typed feature records."""
        raise NotImplementedError


class CERTCSVFeatureExtractor(FeatureExtractor):
    """Shared row validation and conversion for one CERT CSV family."""

    dataset: CERTDataset

    def extract(self, source: ValidatedCSVRows) -> FeaturePipelineResult:
        """Extract records from validated rows without file or data transforms."""
        if source.dataset is not self.dataset:
            raise FeatureInputError(
                f"{type(self).__name__} cannot process {source.dataset.value} rows."
            )

        header_lookup: dict[str, str] = {}
        for header in source.headers:
            normalized = header.strip().casefold()
            if not normalized:
                raise FeatureColumnError("CSV contains an empty column name.")
            if normalized in header_lookup:
                raise FeatureColumnError(
                    f"CSV contains duplicate column name {header!r}."
                )
            header_lookup[normalized] = header

        missing_columns = sorted(_REQUIRED_COLUMNS[self.dataset] - header_lookup.keys())
        if missing_columns:
            raise FeatureColumnError(
                f"{self.dataset.value} CSV is missing required columns: "
                f"{', '.join(missing_columns)}."
            )

        allowed_columns = _EVENT_COLUMNS[self.dataset]
        records: list[FeatureRecord] = []
        for row_number, row in enumerate(source.rows, start=2):
            records.append(
                self._convert_row(row, row_number, header_lookup, allowed_columns)
            )

        logger.info(
            "Feature records extracted: dataset=%s, records=%d",
            self.dataset.value,
            len(records),
        )
        return FeaturePipelineResult(
            dataset=self.dataset,
            records=tuple(records),
        )

    def _convert_row(
        self,
        row: CSVRow,
        row_number: int,
        header_lookup: dict[str, str],
        allowed_columns: frozenset[str],
    ) -> FeatureRecord:
        """Validate one mapping row and create its immutable record."""
        normalized_row: dict[str, str | None] = {}
        for key, value in row.items():
            if not isinstance(key, str):
                raise FeatureRowError(
                    row_number,
                    "row contains a value without a corresponding column name.",
                )
            normalized_key = key.strip().casefold()
            if normalized_key not in header_lookup:
                continue
            if value is not None and not isinstance(value, str):
                raise FeatureRowError(
                    row_number,
                    f"column {key!r} contains a non-text value.",
                )
            normalized_row[normalized_key] = value
        present_columns = normalized_row.keys()
        missing_cells = sorted(_REQUIRED_COLUMNS[self.dataset] - present_columns)
        if missing_cells:
            raise FeatureRowError(
                row_number,
                f"row is missing required values for columns: "
                f"{', '.join(missing_cells)}.",
            )

        subject_column = "user_id" if self.dataset is CERTDataset.LDAP else "user"
        subject_value = normalized_row.get(subject_column)
        if subject_value is None or not subject_value.strip():
            raise FeatureRowError(
                row_number,
                f"required subject value {subject_column!r} is empty.",
            )
        for required_column in _REQUIRED_COLUMNS[self.dataset]:
            required_value = normalized_row.get(required_column)
            if required_column == "date" and self.dataset is not CERTDataset.LDAP:
                continue
            if required_value is None or not required_value.strip():
                raise FeatureRowError(
                    row_number,
                    f"required value for column {required_column!r} is empty.",
                )

        timestamp: datetime | None = None
        if self.dataset is not CERTDataset.LDAP:
            raw_timestamp = normalized_row.get("date")
            if raw_timestamp is None or not raw_timestamp.strip():
                raise FeatureTimestampError(
                    row_number,
                    "required timestamp column 'date' is empty.",
                )
            timestamp = self._parse_timestamp(raw_timestamp, row_number)

        attributes: dict[str, str] = {}
        for column in sorted(allowed_columns):
            value = normalized_row.get(column)
            if value is not None:
                attributes[column] = value

        return FeatureRecord(
            dataset=self.dataset,
            row_number=row_number,
            subject_id=subject_value.strip(),
            timestamp=timestamp,
            attributes=attributes,
        )

    @staticmethod
    def _parse_timestamp(value: str, row_number: int) -> datetime:
        """Parse supported CERT timestamps or raise a row-addressed error."""
        normalized = value.strip()
        try:
            return datetime.fromisoformat(normalized)
        except ValueError:
            pass

        for timestamp_format in _TIMESTAMP_FORMATS:
            try:
                # CERT source timestamps carry no timezone; preserve that.
                return datetime.strptime(normalized, timestamp_format)  # noqa: DTZ007
            except ValueError:
                continue
        raise FeatureTimestampError(
            row_number,
            f"invalid timestamp value {value!r} in column 'date'.",
        )


class LogonFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT logon rows."""

    dataset = CERTDataset.LOGON


class FileFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT file rows."""

    dataset = CERTDataset.FILE


class DeviceFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT device rows."""

    dataset = CERTDataset.DEVICE


class HTTPFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT HTTP rows."""

    dataset = CERTDataset.HTTP


class EmailFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT email rows."""

    dataset = CERTDataset.EMAIL


class LDAPFeatureExtractor(CERTCSVFeatureExtractor):
    """Extract typed records from validated CERT LDAP directory rows."""

    dataset = CERTDataset.LDAP
