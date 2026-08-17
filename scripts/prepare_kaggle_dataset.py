#!/usr/bin/env python3
"""Combine the Kaggle Fake.csv and True.csv files into NewsGuard's CSV format."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path


def append_rows(writer: csv.DictWriter, source: Path, label: str) -> int:
    count = 0
    with source.open(encoding="utf-8-sig", errors="replace", newline="") as handle:
        for row in csv.DictReader(handle):
            # Titles are useful context, but the complete article remains the main feature.
            text = " ".join(part.strip() for part in (row.get("title", ""), row.get("text", "")) if part.strip())
            if text:
                writer.writerow({"text": text, "label": label})
                count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare Kaggle Fake/True news files for NewsGuard.")
    parser.add_argument("--source", required=True, type=Path, help="Directory containing Fake.csv and True.csv")
    parser.add_argument("--output", default=Path("data/kaggle-news.csv"), type=Path)
    args = parser.parse_args()
    fake, real = args.source / "Fake.csv", args.source / "True.csv"
    if not fake.is_file() or not real.is_file():
        raise SystemExit("Expected both Fake.csv and True.csv inside --source.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["text", "label"])
        writer.writeheader()
        fake_count = append_rows(writer, fake, "fake")
        real_count = append_rows(writer, real, "real")
    print(f"Wrote {fake_count:,} fake and {real_count:,} real records to {args.output}")


if __name__ == "__main__":
    main()
