# downloader.py
"""
Download HTS chapters as true XLSX files using the website's REST endpoints.
Usage: python downloader.py [start] [end]
"""
import os
import time
from urllib.parse import urlencode
import requests

from logger import logger
from utils import retry, ensure_dirs
from config import CHAPTERS_DIR, HTS_ARCHIVE_URL

ensure_dirs(CHAPTERS_DIR)

BASE = "https://hts.usitc.gov"
RANGES_ENDPOINT = "/reststop/ranges"
EXPORT_ENDPOINT = "/reststop/exportList"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/142.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Referer": "https://hts.usitc.gov/",
}

def _validate_xlsx_file(path: str) -> bool:
    try:
        if not os.path.exists(path):
            return False
        size = os.path.getsize(path)
        logger.debug("Downloaded file size: %d", size)
        return size > 2_000
    except Exception:
        return False

@retry(times=3, delay=3, error_message="Failed to get range for chapter")
def get_chapter_range(session: requests.Session, chapter_num: int) -> dict:
    url = f"{BASE}{RANGES_ENDPOINT}"
    params = {"docNumber": str(chapter_num)}
    logger.info("Fetching range for chapter %s", chapter_num)
    r = session.get(url, params=params, headers=DEFAULT_HEADERS, timeout=30)
    r.raise_for_status()
    data = r.json()
    if not data or "Starting_Number" not in data or "Ending_Number" not in data:
        raise RuntimeError(f"Unexpected ranges response for chapter {chapter_num}: {data}")
    logger.debug("Range for chapter %s: %s - %s", chapter_num, data["Starting_Number"], data["Ending_Number"])
    return data

@retry(times=3, delay=3, error_message="Failed to download export XLSX")
def download_export_xlsx(session: requests.Session, start_code: str, end_code: str, save_path: str, timeout=120) -> str:
    params = {"from": start_code, "to": end_code, "format": "XLSX", "styles": "true"}
    url = f"{BASE}{EXPORT_ENDPOINT}"
    logger.info("Requesting export: from=%s to=%s", start_code, end_code)
    with session.get(url, params=params, headers=DEFAULT_HEADERS, stream=True, timeout=timeout) as r:
        r.raise_for_status()
        ctype = r.headers.get("Content-Type", "")
        if "xml" in ctype.lower() or "html" in ctype.lower():
            raise RuntimeError(f"Server returned non-XLSX content-type: {ctype}")
        tmp_path = save_path + ".part"
        logger.info("Saving to temporary file %s", tmp_path)
        with open(tmp_path, "wb") as fh:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    fh.write(chunk)
        os.replace(tmp_path, save_path)
        logger.info("Saved export to %s (content-type=%s)", save_path, r.headers.get("Content-Type"))
    if not _validate_xlsx_file(save_path):
        try:
            os.remove(save_path)
        except Exception:
            pass
        raise RuntimeError("Downloaded file failed validation.")
    return save_path

def _prepare_session():
    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)
    try:
        session.get(HTS_ARCHIVE_URL or BASE, timeout=20)
    except Exception as e:
        logger.debug("Initial session GET failed but continuing: %s", e)
    return session

def download_chapter(chapter_num: int, save_dir: str = CHAPTERS_DIR) -> str:
    session = _prepare_session()
    data = get_chapter_range(session, chapter_num)
    start_code = data["Starting_Number"]
    end_code = data["Ending_Number"]
    filename = f"Chapter_{chapter_num:02d}.xlsx"
    filepath = os.path.join(save_dir, filename)
    downloaded = download_export_xlsx(session, start_code, end_code, filepath)
    logger.info("Chapter %s downloaded to %s", chapter_num, downloaded)
    return downloaded

def download_all_chapters(start: int = 1, end: int = 99, save_dir: str = CHAPTERS_DIR):
    ensure_dirs(save_dir)
    session = _prepare_session()
    results = []
    for ch in range(start, end + 1):
        try:
            logger.info("Downloading chapter %d", ch)
            data = get_chapter_range(session, ch)
            start_code = data["Starting_Number"]
            end_code = data["Ending_Number"]
            filename = f"Chapter_{ch:02d}.xlsx"
            filepath = os.path.join(save_dir, filename)
            download_export_xlsx(session, start_code, end_code, filepath)
            results.append(filepath)
            logger.info("Completed Chapter %d -> %s", ch, filepath)
            time.sleep(0.5)
        except Exception as e:
            logger.exception("Failed to download Chapter %d: %s", ch, e)
    return results

if __name__ == "__main__":
    import sys
    s = 1; e = 1
    if len(sys.argv) == 1:
        s, e = 1, 1
    elif len(sys.argv) == 2:
        s = int(sys.argv[1]); e = s
    elif len(sys.argv) >= 3:
        s = int(sys.argv[1]); e = int(sys.argv[2])
    logger.info("Downloader invoked: chapters %d - %d", s, e)
    files = download_all_chapters(start=s, end=e)
    logger.info("Downloader finished. Files: %s", files)
