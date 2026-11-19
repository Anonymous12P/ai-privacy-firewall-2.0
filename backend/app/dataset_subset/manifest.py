"""Manifest generation for reproducible CERT dataset subsets."""

from pathlib import Path

from app.dataset_subset.schemas import DatasetSubsetResult
from app.dataset_subset.utils import write_json


class DatasetSubsetManifest:
    """Write a machine-readable manifest for copied dataset files."""

    def generate(self, result: DatasetSubsetResult) -> Path:
        """Write and return ``subset_manifest.json``."""
        manifest_path = result.manifest_path
        files: list[dict[str, object]] = [
            {
                "source_path": record.source_path,
                "output_path": record.output_path,
                "rows_copied": record.rows_copied,
                "sha256": record.sha256,
            }
            for record in result.files
        ]
        write_json(
            manifest_path,
            {
                "generated_at": result.generated_at.isoformat(),
                "configuration": {
                    "source_directory": str(result.config.source_directory),
                    "output_directory": str(result.config.output_directory),
                    "subset_percentage": result.config.subset_percentage,
                    "random_seed": result.config.random_seed,
                },
                "users": {
                    "total": result.total_users,
                    "selected": result.selected_user_count,
                    "actual_percentage": result.actual_percentage,
                    "selected_user_ids": list(result.selected_users),
                },
                "files": files,
                "reports": {
                    "json": str(result.report_json_path),
                    "markdown": str(result.report_markdown_path),
                    "manifest": str(manifest_path),
                },
            },
        )
        return manifest_path
