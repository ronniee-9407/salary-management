import logging
from logging.handlers import RotatingFileHandler
import sys
import os
from datetime import datetime

class CustomStructuredFormatter(logging.Formatter):
    def format(self, record):
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        msecs = int(record.msecs) if hasattr(record, 'msecs') else 0
        timestamp = f"{now_str},{msecs:03d}"
        
        filename = getattr(record, 'filename', 'logger.py')
        lineno = getattr(record, 'lineno', 0)
        func_name = getattr(record, 'funcName', 'wrapper')
        thread_name = getattr(record, 'threadName', 'MainThread')
        levelname = record.levelname
        event_name = getattr(record, 'event', 'app.api.request')
        pid = record.process
        
        # Non-redundant clean header format:
        header = f"{timestamp} | {filename}:{lineno} | {func_name} | {thread_name} | PID:{pid} | [{levelname}] - event={event_name} |"

        
        message = record.getMessage()
        return f"{header} {message}"

def setup_logging():
    logger = logging.getLogger("acme_salary")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:
        formatter = CustomStructuredFormatter()

        # Rotating File Handler ONLY (Stores structured logs in backend/logs/app.log)
        log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, "app.log")

        file_handler = RotatingFileHandler(
            log_file_path,
            maxBytes=5 * 1024 * 1024,  # 5 MB limit per log file
            backupCount=5,             # Keep up to 5 rotated backup files
            encoding="utf-8"
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


logger = setup_logging()


