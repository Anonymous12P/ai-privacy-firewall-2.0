"""Centralized standard-library logging configuration."""

import logging

from app.core.constants import APP_LOGGER_NAME, LOG_FORMAT


def configure_logging(log_level: str) -> logging.Logger:
    """Configure root logging and return the application logger."""
    level = getattr(logging, log_level.upper(), None)
    if not isinstance(level, int):
        raise TypeError(f"Invalid logging level: {log_level}")

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    if not root_logger.handlers:
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        root_logger.addHandler(stream_handler)
    else:
        for existing_handler in root_logger.handlers:
            existing_handler.setFormatter(logging.Formatter(LOG_FORMAT))
            existing_handler.setLevel(level)

    return logging.getLogger(APP_LOGGER_NAME)
