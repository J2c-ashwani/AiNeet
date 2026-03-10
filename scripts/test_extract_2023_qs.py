import pdfplumber

def extract_sample(pdf_path, start_page, end_page):
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

    print("--- 2023 Questions Sample ---")
    print(text_content[:3000])
    
    with open("sample_2023.txt", "w", encoding="utf-8") as f:
        f.write(text_content)

extract_sample("yearly_pyq_2013_2025.pdf", 962, 965)
