"""
HTML 파일을 Playwright로 1080x1080 PNG로 캡처한다.

사용법:
    python capture.py <html_file_path> <output_png_path>

예:
    python capture.py _workspace/images/thumbnail.html _workspace/images/thumbnail.png
    python capture.py _workspace/images/section_01.html _workspace/images/section_01.png

의존성:
    pip install playwright
    playwright install chromium
"""

import sys
import os
from pathlib import Path


def capture(html_path: str, output_path: str) -> None:
    from playwright.sync_api import sync_playwright

    html_abs = Path(html_path).resolve()
    output_abs = Path(output_path).resolve()
    output_abs.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1080})
        page.goto(f"file://{html_abs}")
        page.wait_for_load_state("networkidle")
        page.screenshot(path=str(output_abs), full_page=False, clip={"x": 0, "y": 0, "width": 1080, "height": 1080})
        browser.close()

    print(f"캡처 완료: {output_abs}")


def capture_all(html_dir: str, output_dir: str) -> None:
    """디렉토리 내 모든 HTML 파일을 일괄 캡처한다."""
    html_dir_path = Path(html_dir)
    for html_file in sorted(html_dir_path.glob("*.html")):
        output_file = Path(output_dir) / html_file.with_suffix(".png").name
        capture(str(html_file), str(output_file))


if __name__ == "__main__":
    if len(sys.argv) == 3:
        capture(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 2 and os.path.isdir(sys.argv[1]):
        # 디렉토리를 넘기면 일괄 캡처
        capture_all(sys.argv[1], sys.argv[1])
    else:
        print("사용법: python capture.py <html_file> <output_png>")
        print("       python capture.py <html_dir>  (디렉토리 내 전체 일괄 캡처)")
        sys.exit(1)
