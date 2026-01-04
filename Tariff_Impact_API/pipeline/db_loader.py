# db_loader.py
import os
import re
import mysql.connector
import pandas as pd

from logger import logger
from config import DB_CONFIG, PARSED_DIR
from utils import ensure_dirs


def clean_unit(u):
    if pd.isna(u) or u is None:
        return ""
    u = str(u).strip()
    u = re.sub(r"[\[\]'\"]", "", u)
    return u


def clean_duty(d):
    if pd.isna(d) or d is None:
        return ""
    s = str(d).replace("\n", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s


def clean_hts(code):
    if not code:
        return ""
    return str(code).strip().rstrip(".").replace("..", ".")


def create_table_if_not_exists(conn):
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS product_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            section VARCHAR(20),
            chapter INT,
            main_category TEXT,
            subcategory TEXT,
            group_name TEXT,
            hts_code VARCHAR(100) UNIQUE,
            product LONGTEXT,
            unit_of_quantity VARCHAR(255),
            general_rate_of_duty VARCHAR(255),
            special_rate_of_duty VARCHAR(255),
            column2_rate_of_duty VARCHAR(255),
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    conn.commit()
    logger.info("Table product_table ready or already exists.")


def load_csv_to_db(csv_path):
    logger.info(f"Loading CSV into DB: {csv_path}")

    ensure_dirs(os.path.dirname(csv_path) or ".")
    df = pd.read_csv(csv_path, dtype=str).fillna("")

    if "group" in df.columns:
        df.rename(columns={"group": "group_name"}, inplace=True)

    conn = mysql.connector.connect(**DB_CONFIG)

    try:
        create_table_if_not_exists(conn)
        cursor = conn.cursor()

        insert_sql = """
            INSERT INTO product_table
            (section, chapter, main_category, subcategory, group_name,
             hts_code, product, unit_of_quantity,
             general_rate_of_duty, special_rate_of_duty, column2_rate_of_duty)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                main_category = VALUES(main_category),
                subcategory = VALUES(subcategory),
                group_name = VALUES(group_name),
                product = VALUES(product),
                unit_of_quantity = VALUES(unit_of_quantity),
                general_rate_of_duty = VALUES(general_rate_of_duty),
                special_rate_of_duty = VALUES(special_rate_of_duty),
                column2_rate_of_duty = VALUES(column2_rate_of_duty),
                last_updated = CURRENT_TIMESTAMP
        """

        records = []
        for row in df.itertuples(index=False):
            # chapter is optional / may be blank
            chapter_val = None
            try:
                chapter_val = int(row.chapter) if str(row.chapter).strip() else None
            except Exception:
                chapter_val = None

            records.append(
                (
                    getattr(row, "section", ""),
                    chapter_val,
                    getattr(row, "main_category", ""),
                    getattr(row, "subcategory", ""),
                    getattr(row, "group_name", ""),
                    clean_hts(getattr(row, "hts_code", "")),
                    getattr(row, "product", ""),
                    clean_unit(getattr(row, "unit_of_quantity", "")),
                    clean_duty(getattr(row, "general_rate_of_duty", "")),
                    clean_duty(getattr(row, "special_rate_of_duty", "")),
                    clean_duty(getattr(row, "column2_rate_of_duty", "")),
                )
            )

        batch_size = 500
        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            cursor.executemany(insert_sql, batch)
            conn.commit()
            logger.info(f"Inserted records {i+1} to {i+len(batch)}")

        logger.info("CSV data loaded into DB successfully.")
    finally:
        conn.close()
        logger.info("Database connection closed.")


if __name__ == "__main__":
    csv_path = os.path.join(PARSED_DIR, "hts_all_chapters.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"{csv_path} not found. Run parser.py first.")
    load_csv_to_db(csv_path)
