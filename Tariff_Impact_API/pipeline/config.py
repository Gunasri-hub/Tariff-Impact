# config.py

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REVISIONS_DIR = os.path.join(BASE_DIR, "revisions")
# Folders
CHAPTERS_DIR = os.path.join(BASE_DIR, "chapters")
PARSED_DIR = os.path.join(BASE_DIR, "parsed")
LOG_DIR = os.path.join(BASE_DIR, "logs")
# Optional: base URL used by downloader
HTS_ARCHIVE_URL = "https://hts.usitc.gov/"

# MySQL connection (same as Sequelize config)
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "Gayu_1999",
    "database": "trump_tariff",
}
