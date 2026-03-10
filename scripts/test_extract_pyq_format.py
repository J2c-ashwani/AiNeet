import pdfplumber
import re
import sys

def extract_questions(pdf_path, start_page=1, end_page=5):
    print(f"Extracting from {pdf_path} (pages {start_page} to {end_page})")
    
    text_content = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i in range(start_page - 1, min(end_page, len(pdf.pages))):
                page = pdf.pages[i]
                text = page.extract_text()
                if text:
                    text_content += text + "\n"
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    # Basic heuristic to find questions
    # E.g. "1. Which of the following...", "Q.1", etc.
    # Let's see what the raw text looks like first
    print("\n--- Raw Text Snippet ---")
    print(text_content[:2000])
    
    # Save the sample to a file for easier inspection
    with open("sample_pdf_text.txt", "w", encoding="utf-8") as f:
        f.write(text_content)
    print("\nFull sample written to sample_pdf_text.txt")


if __name__ == "__main__":
    pdf_file = "yearly_pyq_2013_2025.pdf"
    if len(sys.argv) > 1:
        pdf_file = sys.argv[1]
    
    # Let's check pages 10-15 as they are likely to contain actual questions
    # skip the index/intro pages
    extract_questions(pdf_file, start_page=15, end_page=20)
