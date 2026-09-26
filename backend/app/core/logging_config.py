import logging
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
        event_name = getattr(record, 'event', 'app.subprocess.log')
        pid = record.process
        
        # Match user's exact production format:
        # YYYY-MM-DD HH:MM:SS,mmm | file:line | func | Thread | [LEVEL] - event=name | [file:line in func | PID:1234] message
        header = f"{timestamp} | {filename}:{lineno} | {func_name} | {thread_name} | [{levelname}] - event={event_name} | [{filename}:{lineno} in {func_name} | PID:{pid}]"
        
        message = record.getMessage()
        return f"{header} {message}"

def setup_logging():
    logger = logging.getLogger("acme_salary")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        handler.setFormatter(CustomStructuredFormatter())
        logger.addHandler(handler)

    return logger

logger = setup_logging()
