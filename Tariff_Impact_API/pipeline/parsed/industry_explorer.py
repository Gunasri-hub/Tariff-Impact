import os
import math
import pandas as pd
import mysql.connector

DB_CONFIG = dict(
    host="localhost",
    user="root",
    password="dharshu",
    database="trump_tariff",
)

BASE_DIR = os.path.dirname(__file__)
HTS_CSV = os.path.join(BASE_DIR,  "hts_2022_2025_duties_with_categories.csv")
COUNTRY_CSV = os.path.join(BASE_DIR, "iban_country_currency.csv")


def to_int_or_none(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    try:
        return int(v)
    except Exception:
        return None


def clean_str(v):
    if pd.isna(v):
        return None
    # keep original text (including ¢/kg etc.), just strip whitespace
    return str(v).strip()


def main():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # create tables if they do not exist (duty columns as VARCHAR/TEXT)
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS hts_full (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hts_code VARCHAR(32),
          industry TEXT,
          sub_industry TEXT,
          general_duty TEXT,
          special_duty TEXT,
          column2_duty TEXT,
          year INT
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS country_currency (
          id INT AUTO_INCREMENT PRIMARY KEY,
          country VARCHAR(128),
          currency VARCHAR(128),
          code VARCHAR(8)
        )
        """
    )

    # clear existing data
    cursor.execute("TRUNCATE TABLE hts_full")
    cursor.execute("TRUNCATE TABLE country_currency")

    # ---------- HTS CSV ----------
    hts_df = pd.read_csv(HTS_CSV)

    for _, row in hts_df.iterrows():
        cursor.execute(
            """
            INSERT INTO hts_full
            (hts_code, industry, sub_industry,
             general_duty, special_duty, column2_duty, year)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                clean_str(row.get("HTS_Code")),
                clean_str(row.get("industry")),
                clean_str(row.get("sub-industry")),
                clean_str(row.get("General_Duty")),
                clean_str(row.get("Special_Duty")),
                clean_str(row.get("Column2_Duty")),
                to_int_or_none(row.get("Year")),
            ),
        )

    print("Inserted HTS rows:", len(hts_df))

    # ---------- COUNTRY / CURRENCY CSV ----------
    country_df = pd.read_csv(COUNTRY_CSV)

    for _, row in country_df.iterrows():
        cursor.execute(
            """
            INSERT INTO country_currency (country, currency, code)
            VALUES (%s,%s,%s)
            """,
            (
                clean_str(row.get("country")),
                clean_str(row.get("currency")),
                clean_str(row.get("code")),
            ),
        )

    print("Inserted country rows:", len(country_df))

    conn.commit()
    cursor.close()
    conn.close()
    print("DONE")


if __name__ == "__main__":
    main()