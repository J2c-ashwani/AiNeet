import pytesseract
from pdf2image import convert_from_path
import re
import json
import sys

SUBJECT_ALIAS = {
    'Physics': 'Physics',
    'Chemistry': 'Chemistry',
    'Botany': 'Biology',
    'Zoology': 'Biology'
}

def ocr_pages(pdf_path, start_page, end_page, dpi=200):
    """Convert PDF pages to images and OCR them."""
    print(f"  OCR pages {start_page}-{end_page} ({end_page - start_page + 1} pages) ...")
    images = convert_from_path(pdf_path, first_page=start_page, last_page=end_page, dpi=dpi)
    full_text = ""
    for idx, img in enumerate(images):
        text = pytesseract.image_to_string(img)
        if text and len(text.strip()) > 20:
            full_text += text + "\n"
        if (idx + 1) % 10 == 0:
            print(f"    Processed {idx + 1}/{len(images)} pages...")
    return full_text


def extract_questions_from_text(text, year):
    """Parse MCQ questions from OCR'd text. Handles both (1)/(2)/(3)/(4) and (a)/(b)/(c)/(d) formats."""
    questions = []

    # Split by question numbers at start of line
    parts = re.split(r'\n(\d+)\.\s', text)

    for i in range(1, len(parts), 2):
        q_num_str = parts[i]
        if not q_num_str.isdigit():
            continue
        q_num = int(q_num_str)
        if q_num < 1 or q_num > 200:
            continue

        content = parts[i + 1].strip()

        # Try (1)/(2)/(3)/(4) first, then (a)/(b)/(c)/(d)
        opt_format = None
        opt_start = -1

        # Check for (1) format
        m1 = re.search(r'\(\s*1\s*\)', content)
        # Check for (a) format
        ma = re.search(r'\(\s*a\s*\)', content)

        if m1:
            opt_format = 'numeric'
            opt_start = m1.start()
        elif ma:
            opt_format = 'alpha'
            opt_start = ma.start()
        else:
            continue

        q_text = content[:opt_start].strip()
        options_text = content[opt_start:]

        options = {}
        if opt_format == 'numeric':
            opt_parts = re.split(r'\(\s*([1-4])\s*\)', options_text)
            for j in range(1, len(opt_parts), 2):
                if j + 1 < len(opt_parts):
                    o_num = opt_parts[j].strip()
                    o_text = opt_parts[j + 1].strip()
                    # Clean trailing junk from option 4
                    if o_num == '4':
                        o_text = re.sub(r'\n(SECTION|PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY|BIOLOGY|Solved|CAREER|NEET|AIPMT).*', '', o_text, flags=re.DOTALL)
                    option_key = {'1': 'Option 1', '2': 'Option 2', '3': 'Option 3', '4': 'Option 4'}
                    options[option_key.get(o_num, f'Option {o_num}')] = o_text.strip()
        else:
            opt_parts = re.split(r'\(\s*([a-d])\s*\)', options_text)
            mapping = {'a': 'Option 1', 'b': 'Option 2', 'c': 'Option 3', 'd': 'Option 4'}
            for j in range(1, len(opt_parts), 2):
                if j + 1 < len(opt_parts):
                    o_letter = opt_parts[j].strip()
                    o_text = opt_parts[j + 1].strip()
                    if o_letter == 'd':
                        o_text = re.sub(r'\n(SECTION|PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY|BIOLOGY|Solved|CAREER|NEET|AIPMT).*', '', o_text, flags=re.DOTALL)
                    options[mapping.get(o_letter, f'Option {o_letter}')] = o_text.strip()

        subject = "Unknown"
        if 1 <= q_num <= 45:
            subject = "Physics"
        elif 46 <= q_num <= 90:
            subject = "Chemistry"
        elif 91 <= q_num <= 135:
            subject = "Botany"
        elif 136 <= q_num <= 180:
            subject = "Zoology"
        # Some years have 200 questions with wider ranges
        elif 1 <= q_num <= 50:
            subject = "Physics"
        elif 51 <= q_num <= 100:
            subject = "Chemistry"
        elif 101 <= q_num <= 150:
            subject = "Botany"
        elif 151 <= q_num <= 200:
            subject = "Zoology"

        questions.append({
            "year": year,
            "subject": subject,
            "question_number": q_num,
            "text": q_text,
            "options": options
        })

    return questions


if __name__ == "__main__":
    pdf_file = "yearly_pyq_2013_2025.pdf"

    # Page ranges for scanned section (87-713)
    # We'll OCR in chunks of ~90 pages and detect the year from headers
    # Based on the PDF structure (approx 90 pages per year for older papers):
    # Pages 87-713 = 626 pages for years ~2001-2019
    # We want 2013-2019 specifically.
    # Estimate: each year ~70-90 pages (questions + solutions + answer key)
    # Working backward from 714 (2020 start):
    # 2019: ~640-713
    # 2018: ~570-639
    # 2017: ~500-569
    # 2016: ~430-499
    # 2015: ~360-429
    # 2014: ~290-359
    # 2013: ~220-289

    year_ranges = {
        2019: (640, 713),
        2018: (555, 639),
        2017: (480, 554),
        2016: (400, 479),
        2015: (320, 399),
        2014: (240, 319),
        2013: (160, 239),
    }

    all_questions = []

    for year in sorted(year_ranges.keys()):
        start, end = year_ranges[year]
        print(f"\n=== Year {year} (pages {start}-{end}) ===")

        raw_text = ocr_pages(pdf_file, start, end, dpi=200)

        # Save raw OCR text for debugging
        with open(f"ocr_raw_{year}.txt", "w", encoding="utf-8") as f:
            f.write(raw_text)

        # Try to detect actual year from text
        detected = None
        for pat in [r'Solved Paper\s*[-–]?\s*(20\d{2})', r'AIPMT\s*[-–]?\s*(20\d{2})', r'NEET\s*[-–]?\s*(20\d{2})']:
            m = re.search(pat, raw_text)
            if m:
                detected = int(m.group(1))
                break

        actual_year = detected if detected else year
        print(f"  Detected year from OCR: {detected} (using {actual_year})")

        qs = extract_questions_from_text(raw_text, actual_year)
        print(f"  Extracted {len(qs)} questions")

        counts = {}
        for q in qs:
            counts[q['subject']] = counts.get(q['subject'], 0) + 1
        print(f"  Counts: {counts}")

        all_questions.extend(qs)

    # Save combined
    with open("yearly_pyqs_2013_2019_ocr.json", "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2)

    print(f"\n=== Total extracted: {len(all_questions)} questions ===")
    print("Saved to yearly_pyqs_2013_2019_ocr.json")
