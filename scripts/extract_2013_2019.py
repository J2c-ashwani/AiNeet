import pdfplumber
import re
import json
import sys

def find_year_pages(pdf_path, years):
    """Find the starting page for each year by scanning for headers like 'NEET - 2019', 'AIPMT - 2015', etc."""
    print(f"Scanning {pdf_path} for years: {years}")
    
    year_first_page = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()
            if not text: continue
            
            first_lines = "\n".join(text.split("\n")[:10])
            for year in years:
                if str(year) in first_lines and year not in year_first_page:
                    if "NEET" in first_lines or "AIPMT" in first_lines:
                        year_first_page[year] = i + 1
                        print(f"  Found {year} starting at page {i + 1}")
    
    return year_first_page

def extract_year(pdf_path, year, start_page):
    """Extract questions from a year's section of the PDF."""
    print(f"--- Extracting Year {year} (start page {start_page}) ---")
    
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        # Read ~40 pages from the start (covers questions + answer key)
        for i in range(start_page - 1, min(start_page + 39, len(pdf.pages))):
            page = pdf.pages[i]
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    questions = []
    
    parts = re.split(r'\n(\d+)\.\s', full_text)
    
    for i in range(1, len(parts), 2):
        q_num_str = parts[i]
        if not q_num_str.isdigit(): continue
        q_num = int(q_num_str)
        if q_num < 1 or q_num > 200: continue
        
        content = parts[i+1].strip()
        
        # Find where options start
        opt_start = content.find("(1)")
        if opt_start == -1:
            opt_start_match = re.search(r'\(\s*1\s*\)', content)
            if not opt_start_match: continue
            opt_start = opt_start_match.start()
        
        q_text = content[:opt_start].strip()
        options_text = content[opt_start:]
        
        opt_parts = re.split(r'\(\s*([1-4])\s*\)', options_text)
        
        options = {}
        for j in range(1, len(opt_parts), 2):
            if j+1 < len(opt_parts):
                o_num = opt_parts[j].strip()
                o_text = opt_parts[j+1].strip()
                if o_num == '4':
                    o_text = re.sub(r'\nSECTION-[AB].*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\n(PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY|BIOLOGY).*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\n-\d+\s*-.*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\nNEET.*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\nAIPMT.*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\nCAREER POINT.*', '', o_text, flags=re.DOTALL)
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
    
    # First find page numbers for years 2013-2019
    target_years = [2013, 2014, 2015, 2016, 2017, 2018, 2019]
    year_pages = find_year_pages(pdf_file, target_years)
    
    print(f"\nYear start pages found: {year_pages}")
    
    all_questions = []
    
    for year in sorted(year_pages.keys()):
        start = year_pages[year]
        qs = extract_year(pdf_file, year, start)
        print(f"  Extracted {len(qs)} questions for {year}")
        
        counts = {}
        for q in qs:
            counts[q['subject']] = counts.get(q['subject'], 0) + 1
        print(f"  Counts: {counts}")
        
        all_questions.extend(qs)
    
    # Save
    with open("yearly_pyqs_2013_2019.json", "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2)
    
    print(f"\nTotal extracted: {len(all_questions)} questions")
    print("Saved to yearly_pyqs_2013_2019.json")
