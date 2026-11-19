"""Command-line entry point for generating dataset inventory reports."""

import logging

from app.dataset_inventory.inventory import DatasetInventory
from app.dataset_inventory.report_generator import DatasetReportGenerator
from app.dataset_inventory.scanner import DatasetScanner
from app.dataset_inventory.statistics import DatasetStatistics

logger = logging.getLogger("ai_privacy_firewall.dataset_inventory")


def main() -> None:
    """Scan the configured CERT folder and write analysis reports to interim."""
    scanner = DatasetScanner()
    inventory = DatasetInventory(scanner).build()
    statistics = DatasetStatistics(scanner).calculate(inventory)
    report_paths = DatasetReportGenerator().generate(inventory, statistics)
    for report_path in report_paths:
        logger.info("Dataset report written: %s", report_path)


if __name__ == "__main__":
    main()
