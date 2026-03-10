import pdfplumber
import re
import sys

def find_years(pdf_path, years_to_find):
    print(f"Searching for years {years_to_find} in {pdf_path}")
    
    found_pages = {year: [] for year in years_to_find}
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # We can scan the first 100 pages for the index
            # or just look for "NEET - 2024" or similar headers
            for i in range(len(pdf.pages)):
                page = pdf.pages[i]
                text = page.extract_text()
                if not text: continue
                
                # Check for year matches in the header/first few lines
                first_lines = "\n".join(text.split("\n")[:10])
                for year in years_to_find:
                    if str(year) in first_lines and ("NEET" in first_lines or "AIPMT" in first_lines):
                        found_pages[year].append(i + 1)
                        print(f"Found {year} indicator on page {i + 1}")
                        
    except Exception as e:
        print(f"Error opening PDF: {e}")

    for year, pages in found_pages.items():
        print(f"Year {year} found on pages: {pages}")

if __name__ == "__main__":
    pdf_file = "yearly_pyq_2013_2025.pdf"
    find_years(pdf_file, [2024, 2023, 2022, 2021, 2020])
