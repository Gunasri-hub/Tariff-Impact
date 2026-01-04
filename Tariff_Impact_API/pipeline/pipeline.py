import sys
from logger import logger
from downloader import download_all_chapters
from parser import parse_all_chapters
from db_loader import load_csv_to_db

def run_pipeline(start_chapter=1, end_chapter=99):
    logger.info("===== Starting HTS Pipeline =====")
    try:
        # Step 1: Download all chapters (with specific range)
        files = download_all_chapters(start=start_chapter, end=end_chapter)
        if not files:
            logger.error("No chapter files downloaded. Exiting pipeline.")
            sys.exit(1)

        logger.info(f"Downloaded {len(files)} chapters successfully.")
        for f in files:
            logger.info(f" - {f}")

        # Step 2: Parse all chapters to CSV
        try:
            csv_path = parse_all_chapters()
        except Exception as e:
            logger.exception(f"Failed during parsing chapters: {e}")
            sys.exit(1)

        if not csv_path or not csv_path.endswith(".csv"):
            logger.error("No valid CSV produced after parsing. Exiting pipeline.")
            sys.exit(1)

        logger.info(f"Parsed CSV saved at: {csv_path}")

        # Step 3: Load CSV into database
        try:
            load_csv_to_db(csv_path)
        except Exception as e:
            logger.exception(f"Failed during DB load: {e}")
            sys.exit(1)

        logger.info("Pipeline finished successfully!")

    except Exception as e:
        logger.exception(f"Unexpected error in pipeline: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # You can specify start and end chapters here
    run_pipeline(start_chapter=1, end_chapter=99)