import pdfplumber
import re

pdf_file = "yearly_pyq_2013_2025.pdf"
target_years = list(range(2013, 2020))

# Strategy: scan all pages and log first occurrence of each year 
# in combination with AIPMT or NEET in any part of the page text
# We skip pages 1-10 (intro pages) to avoid false matches

year_all_pages = {y: [] for y in target_years}

with pdfplumber.open(pdf_file) as pdf:
    for i in range(10, len(pdf.pages)):  # skip first 10 intro pages
        page = pdf.pages[i]
        text = page.extract_text()
        if not text: continue
        
        for year in target_years:
            patterns = [
                rf'AIPMT\s*[-–]?\s*{year}',
                rf'NEET\s*\(?UG\)?\s*[-–]?\s*{year}',
            ]
            for pat in patterns:
                if re.search(pat, text):
                    year_all_pages[year].append(i + 1)
                    break

print("Year page ranges:")
for year in sorted(year_all_pages.keys()):
    pages = year_all_pages[year]
    if pages:
        print(f"  {year}: pages {pages[0]} to {pages[-1]} ({len(pages)} pages)")
    else:
        print(f"  {year}: NOT FOUND")
