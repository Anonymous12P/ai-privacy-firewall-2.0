"""Human- and machine-readable subset report generation."""

from pathlib import Path

from app.dataset_subset.schemas import DatasetSubsetResult
from app.dataset_subset.utils import write_json


class DatasetSubsetReport:
    """Generate a JSON summary and a Markdown report for a subset."""

    def generate(self, result: DatasetSubsetResult) -> tuple[Path, Path]:
        """Write and return the JSON and Markdown report paths."""
        report_data: dict[str, object] = {
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
            "files": [
                {
                    "source_path": record.source_path,
                    "output_path": record.output_path,
                    "rows_copied": record.rows_copied,
                    "sha256": record.sha256,
                }
                for record in result.files
            ],
            "output_paths": {
                "json_report": str(result.report_json_path),
                "markdown_report": str(result.report_markdown_path),
                "manifest": str(result.manifest_path),
            },
        }
        write_json(result.report_json_path, report_data)
        result.report_markdown_path.write_text(
            self._markdown(result),
            encoding="utf-8",
            newline="\n",
        )
        return result.report_json_path, result.report_markdown_path

    @staticmethod
    def _markdown(result: DatasetSubsetResult) -> str:
        """Format a concise report with per-file row counts and output hashes."""
        lines = [
            "# CERT Dataset Subset Report",
            "",
            f"- Generated at: {result.generated_at.isoformat()}",
            f"- Source: `{result.config.source_directory}`",
            f"- Output: `{result.config.output_directory}`",
            f"- Requested subset: {result.config.subset_percentage:g}%",
            f"- Random seed: {result.config.random_seed}",
            f"- Users selected: {result.selected_user_count} / {result.total_users}",
            f"- Actual percentage: {result.actual_percentage:.2f}%",
            "",
            "## Selected users",
            "",
            ", ".join(f"`{user_id}`" for user_id in result.selected_users),
            "",
            "## Copied files",
            "",
            "| Source | Output | Rows copied | SHA-256 |",
            "|---|---|---:|---|",
        ]
        lines.extend(
            f"| `{record.source_path}` | `{record.output_path}` | "
            f"{record.rows_copied} | `{record.sha256}` |"
            for record in result.files
        )
        lines.extend(
            [
                "",
                "## Reports",
                "",
                f"- JSON: `{result.report_json_path}`",
                f"- Markdown: `{result.report_markdown_path}`",
                f"- Manifest: `{result.manifest_path}`",
                "",
            ]
        )
        return "\n".join(lines)
