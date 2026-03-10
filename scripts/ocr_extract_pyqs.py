import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import re
import json
import sys
import os

def ocr_pages(pdf_path, start_page, end_page, dpi=200):
    """Convert specific PDF pages to images and OCR them."""
    print(f"OCR pages {start_page}-{end_page} at {dpi} DPI...")
    
    images = convert_from_path(
        pdf_path,
        first_page=start_page,
        last_page=end_page,
        dpi=dpi
    )
    
    full_text = ""
    for idx, img in enumerate(images):
        page_num = start_page + idx
        text = pytesseract.image_to_string(img)
        if text and len(text.strip()) > 20:
            full_text += text + "\n"
        if (idx + 1) % 5 == 0:
            print(f"  Processed {idx + 1}/{len(images)} pages...")
    
    return full_text

def find_year_in_text(text):
    """Try to identify which year a block of text belongs to."""
    patterns = [
        (r'AIPMT\s*[-–]?\s*(20\d{2})', None),
        (r'NEET\s*\(?UG\)?\s*[-–]?\s*(20\d{2})', None),
        (r'NEET\s*[-–]?\s*(20\d{2})', None),
    ]
    for pat, _ in patterns:
        m = re.search(pat, text)
        if m:
            return int(m.group(1))
    return None

def extract_questions_from_text(text, year):
    """Parse MCQ questions from OCR'd text."""
    questions = []
    
    # Split by question numbers
    parts = re.split(r'\n(\d+)\.\s', text)
    
    for i in range(1, len(parts), 2):
        q_num_str = parts[i]
        if not q_num_str.isdigit(): continue
        q_num = int(q_num_str)
        if q_num < 1 or q_num > 200: continue
        
        content = parts[i+1].strip()
        
        # Find options
        opt_start = content.find("(1)")
        if opt_start == -1:
            opt_match = re.search(r'\(\s*1\s*\)', content)
            if not opt_match: continue
            opt_start = opt_match.start()
        
        q_text = content[:opt_start].strip()
        options_text = content[opt_start:]
        
        opt_parts = re.split(r'\(\s*([1-4])\s*\)', options_text)
        
        options = {}
        for j in range(1, len(opt_parts), 2):
            if j+1 < len(opt_parts):
                o_num = opt_parts[j].strip()
                o_text = opt_parts[j+1].strip()
                if o_num == '4':
                    o_text = re.sub(r'\nSECTION.*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\n(PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY|BIOLOGY).*', '', o_text, flags=re.DOTALL)
                options[f"Option {o_num}"] = o_text.strip()
        
        subject = "Unknown"
        if 1 <= q_num <= 50: subject = "Physics"
        elif 51 <= q_num <= 100: subject = "Chemistry" 
        elif 101 <= q_num <= 150: subject = "Botany"
        elif 151 <= q_num <= 200: subject = "Zoology"
        
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
    
    # OCR in chunks of ~90 pages each (approx where each year starts based on PDF layout)
    # Total scanned range: pages 87-713 (~626 pages for years ~2000-2019)
    # We know 2020 starts at 714. Working backward, each year is about 50-70 pages.
    # Let's be smarter: OCR in batches and detect year from headers.
    
    # First, let's do a small test: OCR pages 660-670 to see if we can read them
    print("=== Test OCR on pages 660-665 ===")
    test_text = ocr_pages(pdf_file, 660, 665, dpi=200)
    
    if test_text:
        year = find_year_in_text(test_text)
        print(f"\nDetected year: {year}")
        print(f"Text preview:\n{test_text[:500]}")
        
        # Save raw OCR text for inspection
        with open("ocr_test_660_665.txt", "w") as f:
            f.write(test_text)
        print("\nSaved to ocr_test_660_665.txt")
    else:
        print("No text extracted via OCR!")
