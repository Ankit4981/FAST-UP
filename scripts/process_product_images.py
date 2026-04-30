from __future__ import annotations

import json
import math
import ssl
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "public" / "products" / "raw"
OUT_DIR = ROOT / "public" / "products"

RAW_DIR.mkdir(parents=True, exist_ok=True)
OUT_DIR.mkdir(parents=True, exist_ok=True)

PRODUCT_IMAGES: dict[str, list[str]] = {
    "reload-salts-orange": [
        "https://in.fastandup.com/cdn/shop/files/Artboard4.png?v=1768553785&width=1100",
        "https://in.fastandup.com/cdn/shop/files/Artboard4.png?v=1768553785",
    ],
    "reload-salts-lemonade": [
        "https://in.fastandup.com/cdn/shop/files/Artboard1.png?v=1768555274&width=1100",
        "https://in.fastandup.com/cdn/shop/files/Artboard1.png?v=1768555274",
    ],
    "whey-essentials-chocolate": [
        "https://in.fastandup.com/cdn/shop/files/wheyisochocolate_1b28c1db-a82c-4c51-8057-41126bba9302.jpg?v=1761295662",
        "https://in.fastandup.com/cdn/shop/files/2_d330fbe7-08e8-4a25-ab06-c82d06d2a7ec.webp?v=1761295662&width=1100",
    ],
    "whey-isolate-rich-chocolate": [
        "https://in.fastandup.com/cdn/shop/files/wheyisochocolate.jpg?v=1760604762",
    ],
    "reload-orange-rush-drink": [
        "https://www.bbassets.com/media/uploads/p/l/40347436_1-fastup-reload-zero-sugar-electrolyte-drink-orange-rush.jpg",
        "https://www.bbassets.com/media/uploads/p/l/40191180_1-fastup-reload-vital-electrolytes-drink-orange-rush.jpg",
        "https://www.bbassets.com/media/uploads/p/s/40191180_1-fastup-reload-vital-electrolytes-drink-orange-rush.jpg",
    ],
}


def download_first(urls: list[str], out_path: Path) -> tuple[bool, str]:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
    }
    ssl_context = ssl.create_default_context()

    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ssl_context, timeout=45) as res:
                content = res.read()
            if len(content) < 8_000:
                continue
            out_path.write_bytes(content)
            return True, url
        except Exception:
            continue

    return False, ""


def remove_background_and_save_webp(src_path: Path, out_path: Path) -> dict[str, int | float]:
    image = Image.open(src_path).convert("RGBA")
    arr = np.array(image)
    rgb = arr[:, :, :3].astype(np.float32)

    # Estimate background from border pixels.
    border_width = max(3, min(arr.shape[0], arr.shape[1]) // 120)
    top = rgb[:border_width, :, :]
    bottom = rgb[-border_width:, :, :]
    left = rgb[:, :border_width, :]
    right = rgb[:, -border_width:, :]
    border_pixels = np.concatenate(
        [
            top.reshape(-1, 3),
            bottom.reshape(-1, 3),
            left.reshape(-1, 3),
            right.reshape(-1, 3),
        ],
        axis=0,
    )

    bg = np.median(border_pixels, axis=0)

    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    sat = rgb.max(axis=2) - rgb.min(axis=2)

    # Background candidates are visually close to border tone with low saturation.
    bg_candidates = (dist < 46) | ((dist < 64) & (sat < 30))

    labels, num_labels = ndimage.label(bg_candidates)

    # Keep only connected background touching image borders.
    border_labels = np.unique(
        np.concatenate(
            [
                labels[0, :],
                labels[-1, :],
                labels[:, 0],
                labels[:, -1],
            ]
        )
    )

    background_mask = np.isin(labels, border_labels)
    foreground = ~background_mask

    # Fill holes inside product silhouette.
    foreground = ndimage.binary_fill_holes(foreground)

    # Keep meaningful components (largest ones); preserves pack + sachet style shots.
    fg_labels, fg_count = ndimage.label(foreground)
    kept = np.zeros_like(foreground)
    if fg_count > 0:
        areas = ndimage.sum(foreground, fg_labels, index=range(1, fg_count + 1))
        min_area = max(600, int(foreground.shape[0] * foreground.shape[1] * 0.004))

        for i, area in enumerate(areas, start=1):
            if area >= min_area:
                kept |= fg_labels == i

        if not kept.any():
            largest_label = int(np.argmax(areas)) + 1
            kept = fg_labels == largest_label

    alpha = np.zeros((arr.shape[0], arr.shape[1]), dtype=np.uint8)
    alpha[kept] = 255

    out = arr.copy()
    out[:, :, 3] = alpha

    ys, xs = np.where(alpha > 0)
    if len(xs) > 0 and len(ys) > 0:
        pad = 14
        x1 = max(int(xs.min()) - pad, 0)
        x2 = min(int(xs.max()) + pad + 1, out.shape[1])
        y1 = max(int(ys.min()) - pad, 0)
        y2 = min(int(ys.max()) + pad + 1, out.shape[0])
        out = out[y1:y2, x1:x2]

    output_image = Image.fromarray(out, mode="RGBA")
    output_image.save(out_path, format="WEBP", lossless=True, quality=92, method=6)

    return {
        "width": output_image.width,
        "height": output_image.height,
        "pixels_foreground": int((alpha > 0).sum()),
    }


def main() -> None:
    report: dict[str, dict[str, str | int | float]] = {}

    for slug, urls in PRODUCT_IMAGES.items():
        raw_path = RAW_DIR / f"{slug}.source"
        out_path = OUT_DIR / f"{slug}.webp"

        ok, source_url = download_first(urls, raw_path)
        if not ok:
            report[slug] = {"status": "download_failed"}
            continue

        try:
            stats = remove_background_and_save_webp(raw_path, out_path)
            report[slug] = {
                "status": "ok",
                "source_url": source_url,
                "output": str(out_path.relative_to(ROOT)).replace("\\", "/"),
                **stats,
            }
        except Exception as exc:
            report[slug] = {
                "status": "processing_failed",
                "source_url": source_url,
                "error": str(exc),
            }

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
