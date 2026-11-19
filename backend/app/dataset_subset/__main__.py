"""Command-line entry point for creating a CERT dataset subset."""

import argparse
import logging
from pathlib import Path

from app.dataset_subset.pipeline import DatasetSubsetPipeline
from app.dataset_subset.schemas import DatasetSubsetConfig

logger = logging.getLogger("ai_privacy_firewall.dataset_subset")


def _build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser for dataset subsetting."""
    defaults = DatasetSubsetConfig()
    parser = argparse.ArgumentParser(
        description="Create a reproducible user-based subset of CERT r4.2."
    )
    parser.add_argument(
        "--source-directory",
        type=Path,
        default=defaults.source_directory,
        help="CERT dataset directory (default: %(default)s)",
    )
    parser.add_argument(
        "--output-directory",
        type=Path,
        default=defaults.output_directory,
        help="Destination directory (default: %(default)s)",
    )
    parser.add_argument(
        "--percentage",
        type=float,
        default=defaults.subset_percentage,
        help="Percentage of users to include (default: %(default)s)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=defaults.random_seed,
        help="Random seed for reproducible selection (default: %(default)s)",
    )
    return parser


def main() -> None:
    """Run the subset pipeline using command-line options."""
    args = _build_parser().parse_args()
    config = DatasetSubsetConfig(
        source_directory=args.source_directory,
        output_directory=args.output_directory,
        subset_percentage=args.percentage,
        random_seed=args.seed,
    )
    result = DatasetSubsetPipeline(config).run()
    logger.info(
        "Dataset subset created: users=%d/%d, output=%s",
        len(result.selected_users),
        result.total_users,
        result.config.output_directory,
    )
    for path in (
        result.report_json_path,
        result.report_markdown_path,
        result.manifest_path,
    ):
        logger.info("Subset artifact written: %s", path)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
