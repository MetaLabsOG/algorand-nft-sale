import logging
from pyairtable import Table
from datetime import datetime

from python.src.env import AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME

logger = logging.getLogger(__name__)
airtable = Table(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)


def log_event(text, address="UNKNOWN", app_id="UNKNOWN", source="BACKEND", level="INFO"):
    logger_f = logger.info
    if level == "WARNING":
        logger_f = logger.warning
    elif level == "DEBUG":
        logger_f = logger.warning
    elif level == "ERROR":
        logger_f = logger.error
    elif level == "CRITICAL":
        logger_f = logger.critical

    logger_f(f'{address} | {app_id} -- {text}')

    try:
        airtable.create({
            "address": address,
            "status": text,
            "date": datetime.utcnow().strftime("%d -- %H:%M:%S"),
            "source": source,
            "lootbox id": str(app_id)
        })
    except Exception as e:
        logger.error("Airtable log failed!", e)


# Test
if __name__ == "__main__":
    log_event("test event", source="TEST")
    log_event("test event2", app_id=1, level="info")
