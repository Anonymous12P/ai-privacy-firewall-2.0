"""Build stable reproducibility metadata for prepared ML dataset artifacts."""

import hashlib
import json
from collections.abc import Mapping
from typing import TypedDict

from app.ml.schemas import (
    MLDataset,
    MLPipelineConfig,
    MLReproducibilityMetadata,
    PreprocessedSplitResult,
)


class _RecordPayload(TypedDict):
    """Canonical representation of one prepared data row."""

    subject_id: str
    values: tuple[object, ...]
    label: object


def build_reproducibility_metadata(
    dataset_name: str,
    source: MLDataset,
    config: MLPipelineConfig,
    prepared: PreprocessedSplitResult,
) -> MLReproducibilityMetadata:
    """Create metadata whose fingerprint is stable for the same run inputs."""
    split = config.split
    balance = config.balance
    preprocessing = prepared.metadata
    ratios = (
        float(split.train_fraction),
        float(split.validation_fraction),
        float(split.test_fraction),
    )
    payload: dict[str, object] = {
        "dataset_name": dataset_name,
        "source_sha256": source_sha256(source),
        "feature_names": list(source.feature_names),
        "target_column": source.label_name,
        "split_strategy": _resolved_split_strategy(split.strategy, split.stratify),
        "split_ratios": list(ratios),
        "split_seed": split.random_seed,
        "balancing_strategy": balance.strategy,
        "balancing_seed": balance.random_seed,
        "balancing_target_fraction": balance.target_fraction,
        "preprocessing_strategy": preprocessing.scaling_strategy,
        "missing_value_strategy": preprocessing.missing_value_strategy,
        "missing_value_constant": preprocessing.missing_value_constant,
        "scaler_parameters": {
            key: list(values)
            for key, values in sorted(preprocessing.scaler_parameters.items())
        },
        "partitions": {
            "train": _record_payload(prepared.train),
            "validation": _record_payload(prepared.validation),
            "test": _record_payload(prepared.test),
        },
    }
    fingerprint = hashlib.sha256(_canonical_json(payload)).hexdigest()
    return MLReproducibilityMetadata(
        dataset_name=dataset_name,
        source_sha256=source_sha256(source),
        feature_names=source.feature_names,
        target_column=source.label_name,
        split_strategy=_resolved_split_strategy(split.strategy, split.stratify),
        split_ratios=ratios,
        split_seed=split.random_seed,
        balancing_strategy=balance.strategy,
        balancing_seed=balance.random_seed,
        balancing_target_fraction=balance.target_fraction,
        preprocessing_strategy=preprocessing.scaling_strategy,
        missing_value_strategy=preprocessing.missing_value_strategy,
        missing_value_constant=preprocessing.missing_value_constant,
        scaler_parameters=preprocessing.scaler_parameters,
        train_row_count=len(prepared.train.records),
        validation_row_count=len(prepared.validation.records),
        test_row_count=len(prepared.test.records),
        fingerprint=fingerprint,
    )


def source_sha256(source: MLDataset) -> str:
    """Return the file digest or a canonical content digest for in-memory data."""
    if source.metadata.sha256:
        return source.metadata.sha256
    content = {
        "feature_names": list(source.feature_names),
        "target_column": source.label_name,
        "records": [
            {
                "subject_id": record.subject_id,
                "values": record.values,
                "label": record.label,
            }
            for record in source.records
        ],
    }
    return hashlib.sha256(_canonical_json(content)).hexdigest()


def reproducibility_payload(
    metadata: MLReproducibilityMetadata,
) -> dict[str, object]:
    """Convert reproducibility metadata to a stable JSON-ready mapping."""
    return {
        "dataset_name": metadata.dataset_name,
        "source_sha256": metadata.source_sha256,
        "feature_names": list(metadata.feature_names),
        "target_column": metadata.target_column,
        "split": {
            "strategy": metadata.split_strategy,
            "ratios": list(metadata.split_ratios),
            "seed": metadata.split_seed,
        },
        "balancing": {
            "strategy": metadata.balancing_strategy,
            "seed": metadata.balancing_seed,
            "target_fraction": metadata.balancing_target_fraction,
        },
        "preprocessing": {
            "scaling_strategy": metadata.preprocessing_strategy,
            "missing_value_strategy": metadata.missing_value_strategy,
            "missing_value_constant": metadata.missing_value_constant,
            "scaler_parameters": {
                key: list(values)
                for key, values in sorted(metadata.scaler_parameters.items())
            },
        },
        "partitions": {
            "train_rows": metadata.train_row_count,
            "validation_rows": metadata.validation_row_count,
            "test_rows": metadata.test_row_count,
        },
        "fingerprint": metadata.fingerprint,
    }


def _record_payload(dataset: MLDataset) -> list[_RecordPayload]:
    """Return records in their output order without wall-clock data."""
    return [
        {
            "subject_id": record.subject_id,
            "values": record.values,
            "label": record.label,
        }
        for record in dataset.records
    ]


def _resolved_split_strategy(strategy: str, stratify: bool | None) -> str:
    """Resolve the compatibility stratify flag into its effective strategy."""
    if stratify is None:
        return strategy
    return "stratified" if stratify else "random"


def _canonical_json(payload: Mapping[str, object]) -> bytes:
    """Encode canonical JSON for deterministic hashing."""
    return json.dumps(
        payload,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
