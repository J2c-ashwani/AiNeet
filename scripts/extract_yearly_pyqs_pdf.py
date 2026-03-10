import pdfplumber
import re
import json

def extract_year(pdf_path, year, start_page, end_page):
    print(f"--- Extracting Year {year} ---")
    
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # We fetch 40 pages just to be safe
            for i in range(start_page - 1, min(start_page + 40, len(pdf.pages))):
                page = pdf.pages[i]
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []

    questions = []
    
    # Split text by chunks that start with `<num>. `
    # Note: Use lookahead to make sure it's followed by a space and a capital letter, 
    # or just split by \n<num>. 
    parts = re.split(r'\n(\d+)\.\s', full_text)
    
    for i in range(1, len(parts), 2):
        q_num_str = parts[i]
        if not q_num_str.isdigit(): continue
        q_num = int(q_num_str)
        
        if q_num < 1 or q_num > 200: continue
        
        content = parts[i+1].strip()
        
        # In NEET papers, the options always start with (1), (2), (3), (4)
        # We find the first occurrence of `(1)`
        opt_start = content.find("(1)")
        
        if opt_start == -1:
            # Maybe it uses 1) or option is on next line with leading spaces? Let's check regex \(\s*1\s*\)
            opt_start_match = re.search(r'\(\s*1\s*\)', content)
            if not opt_start_match:
                # print(f"Warning: Could not find options for question {q_num}")
                continue
            opt_start = opt_start_match.start()
        
        q_text = content[:opt_start].strip()
        options_text = content[opt_start:]
        
        # Now extract the 4 options
        # We can split by \( \d \)
        opt_parts = re.split(r'\(\s*([1-4])\s*\)', options_text)
        
        options = {}
        for j in range(1, len(opt_parts), 2):
            if j+1 < len(opt_parts):
                o_num = opt_parts[j].strip()
                o_text = opt_parts[j+1].strip()
                
                # Cleanup: occasionally the next question's header or section header gets caught in option 4
                if o_num == '4':
                    # Cut off before "SECTION-B" or "ZOOLOGY" or any footer like "-35 -"
                    o_text = re.sub(r'\nSECTION-[AB].*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\n(PHYSICS|CHEMISTRY|BOTANY|ZOOLOGY).*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\n-\d+\s*-.*', '', o_text, flags=re.DOTALL)
                    o_text = re.sub(r'\nNEET \(UG\).*', '', o_text, flags=re.DOTALL)
                
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
    
    # Define pages based on our earlier search
    years_to_extract = {
        2023: (958, 1086),
        2022: (850, 957),
        2021: (800, 849),
        2020: (714, 799)
    }
    
    all_data = []
    
    for year in reversed(sorted(years_to_extract.keys())):
        start, end = years_to_extract[year]
        qs = extract_year(pdf_file, year, start, end)
        print(f"Extracted {len(qs)} questions for {year}")
        
        counts = {}
        for q in qs:
            counts[q['subject']] = counts.get(q['subject'], 0) + 1
        print("  Counts:", counts)
        
        all_data.extend(qs)
        
    # Save combined
    with open("yearly_pyqs_extracted.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2)
    
    print(f"\nTotal extracted across all years: {len(all_data)}")
