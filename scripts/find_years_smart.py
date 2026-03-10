import pdfplumber
import re

pdf_file = "yearly_pyq_2013_2025.pdf"
# Search for exact paper headers (e.g., "AIPMT - 2013", "NEET - 2019", "NEET (UG) - 2019")
# Also look for "Question Paper" or "SECTION-A" near the year

target_years = list(range(2013, 2020))
year_pages = {}

with pdfplumber.open(pdf_file) as pdf:
    for i in range(len(pdf.pages)):
        page = pdf.pages[i]
        text = page.extract_text()
        if not text: continue
        
        # Check if this page has a specific paper header
        for year in target_years:
            if year in year_pages: continue
            
            # Look for patterns like "AIPMT - 2015" or "NEET (UG)-2019" or "NEET-2017"
            # These are the actual paper headers
            patterns = [
                rf'AIPMT\s*[-–]\s*{year}',
                rf'NEET\s*\(UG\)\s*[-–]\s*{year}',
                rf'NEET\s*[-–]\s*{year}',
                rf'AIPMT\s*{year}',
            ]
            
            for pat in patterns:
                if re.search(pat, text):
                    # Make sure this is not just a mention in intro
                    # A real question paper page will have "SECTION" or "Q." or numbered questions
                    if "SECTION" in text or re.search(r'^\d+\.', text, re.MULTILINE) or "Q." in text:
                        year_pages[year] = i + 1
                        print(f"Found {year} paper starting at page {i + 1}")
                        print(f"  Header snippet: {text[:200]}")
                        break
        
        if len(year_pages) == len(target_years):
            break

print(f"\nYear pages: {year_pages}")
