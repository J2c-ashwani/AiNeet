import pdfplumber
import re
import json

def extract_questions_and_answers(pdf_path, start_page=15, end_page=20):
    print(f"Extracting from {pdf_path} (pages {start_page} to {end_page})")
    
    questions = []
    current_q = None
    
    # Regex patterns based on the sample
    # Matches "Q.98 Which one of the following..."
    q_pattern = re.compile(r'Q\.(\d+)\s+(.*?)(?=\s+\(\d+\)|\s+Q\.\d+|$)', re.DOTALL)
    # Matches "(1) Option text"
    opt_pattern = re.compile(r'\((\d+)\)\s+(.*?)(?=\s+\(\d+\)|\s+Q\.\d+|$)', re.DOTALL)
    
    # We need to process the whole text as a single string because questions span lines and columns
    full_text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i in range(start_page - 1, min(end_page, len(pdf.pages))):
                page = pdf.pages[i]
                # Extract text preserving layout might help with columns, but standard extract_text() usually reads left-to-right, top-to-bottom.
                # In 2-column formats, this can interleave text. Let's try layout-preserving extraction if needed, 
                # but standard might just append column 1 then column 2. Let's get raw text first.
                
                # To handle 2 columns better, we might need a custom layout extraction, but let's see if simple text works
                # from the sample, it seems the columns might end up interleaved:
                # "Q.98 Which one of the following pairs of substances Q.107 Indicator of water pollution :"
                # This indicates left-to-right reading across columns, which mixes them.
                
                # We need column-aware extraction
                left_col = page.crop((0, 0, 0.5 * page.width, page.height)).extract_text()
                right_col = page.crop((0.5 * page.width, 0, page.width, page.height)).extract_text()
                
                if left_col: full_text += left_col + "\n"
                if right_col: full_text += right_col + "\n"
                
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return []

    # Now parse the sequential text
    # A simple state machine or split strategy
    
    # Split by Q. to isolate question blocks
    q_blocks = re.split(r'(?=Q\.\d+\s+)', full_text)
    
    for block in q_blocks:
        block = block.strip()
        if not block.startswith('Q.'):
            continue
            
        # Extract question number
        q_match = re.match(r'Q\.(\d+)\s+', block)
        if not q_match:
            continue
            
        q_num = q_match.group(1)
        q_text_area = block[q_match.end():]
        
        # Now find options (1), (2), (3), (4) within this area
        # We split by \( \d+ \)
        opt_parts = re.split(r'\(\s*(\d+)\s*\)', q_text_area)
        
        if len(opt_parts) > 1:
            q_text = opt_parts[0].strip()
            options = {}
            # opt_parts contains: [q_text, opt_num1, opt_text1, opt_num2, opt_text2, ...]
            for i in range(1, len(opt_parts), 2):
                if i+1 < len(opt_parts):
                    o_num = opt_parts[i].strip()
                    o_text = opt_parts[i+1].strip()
                    options[f"Option {o_num}"] = o_text
            
            questions.append({
                "question_number": int(q_num),
                "text": q_text,
                "options": options
            })
            
    return questions

if __name__ == "__main__":
    pdf_file = "yearly_pyq_2013_2025.pdf"
    
    # Let's extract pages 15-20 where AIPMT 1998 Biology questions are
    extracted = extract_questions_and_answers(pdf_file, start_page=15, end_page=20)
    
    print(f"Extracted {len(extracted)} questions.")
    
    # Print first 5 to verify
    for q in extracted[:5]:
        print(json.dumps(q, indent=2))
