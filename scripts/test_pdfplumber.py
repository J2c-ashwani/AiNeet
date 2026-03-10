import pdfplumber
import sys

def test_extract(pdf_path):
    print(f"Testing extraction on {pdf_path}")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Total pages: {len(pdf.pages)}")
            
            # Test first few pages
            for i in range(min(5, len(pdf.pages))):
                page = pdf.pages[i]
                text = page.extract_text()
                print(f"--- Page {i+1} ---")
                if text:
                    print(text[:500])
                    print(f"... (length: {len(text)})")
                else:
                    print("No text extracted.")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    pdf_file = "yearly_pyq_2013_2025.pdf"
    if len(sys.argv) > 1:
        pdf_file = sys.argv[1]
    test_extract(pdf_file)
