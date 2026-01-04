# parser.py
import os
import re
import pandas as pd

from logger import logger
from config import CHAPTERS_DIR, PARSED_DIR
from utils import ensure_dirs

ensure_dirs(PARSED_DIR)

SECTION_RANGES = {
    "I": range(1, 6),
    "II": range(6, 15),
    "III": range(15, 16),
    "IV": range(16, 25),
    "V": range(25, 28),
    "VI": range(28, 39),
    "VII": range(39, 41),
    "VIII": range(41, 44),
    "IX": range(44, 47),
    "X": range(47, 50),
    "XI": range(50, 64),
    "XII": range(64, 68),
    "XIII": range(68, 71),
    "XIV": range(71, 72),
    "XV": range(72, 84),
    "XVI": range(84, 86),
    "XVII": range(86, 90),
    "XVIII": range(90, 93),
    "XIX": range(93, 94),
    "XX": range(94, 97),
    "XXI": range(97, 98),
    "XXII": range(98, 100),
}


def get_section_for_chapter(chapter_num: int):
    for section, rng in SECTION_RANGES.items():
        if chapter_num in rng:
            return section
    return "Unknown"


def detect_column(df, possible_names):
    names = [p.strip().lower() for p in possible_names]
    # exact match
    for col in df.columns:
        if str(col).strip().lower() in names:
            return col
    # partial match
    for col in df.columns:
        col_s = str(col).strip().lower()
        for n in names:
            if n in col_s or col_s in n:
                return col
    return None


def normalize_hts(hts):
    if pd.isna(hts):
        return ""
    s = str(hts).strip()
    s = s.replace("..", ".").rstrip(".")
    return s


def clean_unit(u):
    if pd.isna(u):
        return ""
    s = str(u)
    s = re.sub(r"[\[\]\"']", "", s).strip()
    return s


def clean_duty(d):
    if pd.isna(d):
        return ""
    s = str(d).replace("\n", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s


def forward_fill_duties(df, gen_duty_col, spec_duty_col, col2_duty_col):
    """
    Carry last non-empty duty values downwards so child HTS lines
    inherit the correct General/Special/Column 2 rates.
    """
    for col in [gen_duty_col, spec_duty_col, col2_duty_col]:
        if not col:
            continue
        df[col] = (
            df[col]
            .astype(str)
            .replace(["nan", "NaN"], "")
            .replace("", pd.NA)
            .ffill()
            .fillna("")
        )
    return df


def parse_single_chapter(xlsx_path):
    logger.info(f"Parsing {xlsx_path}")
    try:
        df = pd.read_excel(xlsx_path, engine="openpyxl", dtype=str)
    except Exception as e:
        logger.exception("Failed to read %s: %s", xlsx_path, e)
        return []

    df.columns = [str(c).strip() for c in df.columns]

    # detection with expanded options
    hts_col = detect_column(
        df,
        ["HTS Number", "HTS", "HTSNumber", "Heading/Subheading", "Article number"],
    )
    indent_col = detect_column(
        df,
        ["Indent", "Indentation", "Level", "Indent Level", "Hierarchy", "Hierarchy Level"],
    )
    desc_col = detect_column(
        df,
        [
            "Description",
            "Desc",
            "Product Description",
            "Description 1",
            "Description 2",
            "Article Description",
        ],
    )
    unit_col = detect_column(df, ["Unit of Quantity", "Unit", "Unit of Qty"])
    gen_duty_col = detect_column(
        df, ["General", "General Rate of Duty", "General Duty", "General Rate"]
    )
    spec_duty_col = detect_column(
        df, ["Special", "Special Rate", "Special Rate of Duty", "Special Duty"]
    )
    col2_duty_col = detect_column(
        df, ["Column 2", "Column 2 Rate", "Column2 Rate", "Column 2 Rate of Duty"]
    )

    if not desc_col:
        logger.error(
            f"No description column detected in {xlsx_path} - columns: {df.columns.tolist()}"
        )
        return []

    if not indent_col:
        df["_indent"] = df.index.map(lambda i: 3)  # assume product rows if no indent
        indent_col = "_indent"

    if not hts_col:
        df["_hts"] = ""
        hts_col = "_hts"

    # forward-fill duty columns so child rows inherit parent duty values
    df = forward_fill_duties(df, gen_duty_col, spec_duty_col, col2_duty_col)

    rows = []
    main_category = subcategory = group = None

    for _, row in df.iterrows():
        desc = str(row.get(desc_col, "")).strip()
        if not desc:
            continue

        try:
            indent_raw = row.get(indent_col, "")
            indent = int(float(indent_raw)) if str(indent_raw).strip() != "" else 3
        except Exception:
            indent = 3

        hts_code = normalize_hts(row.get(hts_col, ""))
        unit = clean_unit(row.get(unit_col, "")) if unit_col else ""
        gen_duty = clean_duty(row.get(gen_duty_col, "")) if gen_duty_col else ""
        spec_duty = clean_duty(row.get(spec_duty_col, "")) if spec_duty_col else ""
        col2_duty = clean_duty(row.get(col2_duty_col, "")) if col2_duty_col else ""

        # hierarchy
        if indent == 0:
            main_category = desc
            subcategory = group = None
            continue
        elif indent == 1:
            subcategory = desc
            continue
        elif indent == 2:
            group = desc
            continue
        elif indent >= 3:
            rows.append(
                {
                    "hts_code": hts_code,
                    "main_category": main_category,
                    "subcategory": subcategory,
                    "group": group,
                    "product": desc,
                    "unit_of_quantity": unit,
                    "general_rate_of_duty": gen_duty,
                    "special_rate_of_duty": spec_duty,
                    "column2_rate_of_duty": col2_duty,
                }
            )

    return rows


def parse_all_chapters():
    all_rows = []
    chapter_files = sorted(
        [f for f in os.listdir(CHAPTERS_DIR) if f.endswith(".xlsx")],
        key=lambda x: int(re.findall(r"\d+", x)[0]) if re.findall(r"\d+", x) else 0,
    )

    for file in chapter_files:
        chapter_path = os.path.join(CHAPTERS_DIR, file)
        chapter_number = int(re.findall(r"\d+", file)[0])
        chapter_rows = parse_single_chapter(chapter_path)
        section = get_section_for_chapter(chapter_number)

        for r in chapter_rows:
            r["chapter"] = chapter_number
            r["section"] = section

        all_rows.extend(chapter_rows)
        logger.info(f"Parsed {len(chapter_rows)} rows from {file}")

    if not all_rows:
        logger.warning("No rows parsed from any chapters.")
        return None

    df_all = pd.DataFrame(all_rows)
    parsed_file = os.path.join(PARSED_DIR, "hts_all_chapters.csv")
    df_all.to_csv(parsed_file, index=False, encoding="utf-8-sig")
    logger.info(f"Saved parsed HTS data → {parsed_file} (rows={len(df_all)})")
    return parsed_file


if __name__ == "__main__":
    parse_all_chapters()
