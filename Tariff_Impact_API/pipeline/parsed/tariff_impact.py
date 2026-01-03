import pandas as pd
import mysql.connector
from mysql.connector import Error

# ---------- MYSQL CONNECTION ----------
def create_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="dharshu",
            database="trump_tariff"
        )
        if conn.is_connected():
            print("Connected to MySQL")
            return conn
    except Error as e:
        print("Error:", e)

# ---------- INSERT DATA ----------
def insert_excel_to_mysql(excel_path, table_name, conn):
    df = pd.read_excel(excel_path)

    # Fix column names (very important)
    df.columns = [
        f"col_{i}" if str(col) == "nan" else str(col).strip().replace(" ", "_").replace("-", "_")
        for i, col in enumerate(df.columns)
    ]

    cursor = conn.cursor()

    # Create table
    columns = ", ".join([f"`{col}` TEXT" for col in df.columns])
    create_table_query = f"CREATE TABLE IF NOT EXISTS `{table_name}` ({columns});"
    cursor.execute(create_table_query)

    # Replace NaN values in data before insert
    df = df.fillna("")

    # Insert rows
    for _, row in df.iterrows():
        placeholders = ", ".join(["%s"] * len(row))
        insert_query = f"INSERT INTO `{table_name}` VALUES ({placeholders})"
        cursor.execute(insert_query, tuple(row))

    conn.commit()
    print(f"Inserted {len(df)} rows into {table_name}")


# ---------- MAIN ----------
conn = create_connection()

if conn:
    insert_excel_to_mysql("currency.xlsx", "currency_table", conn)
    insert_excel_to_mysql("duty type.xlsx", "duty_type_table", conn)
    insert_excel_to_mysql("tariff_dataset_500_rows.xlsx", "tariff_table", conn)

    conn.close()
    print("All Excel files inserted successfully!")
