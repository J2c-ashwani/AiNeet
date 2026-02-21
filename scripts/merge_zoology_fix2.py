import json
import re

def fix_and_merge():
    with open('zoology_topics_only.json', 'r') as f:
        zoo_data = json.load(f)
        
    with open('../lib/ncert-data.js', 'r') as f:
        js_content = f.read()
        
    # We will build a new biology block
    new_biology_block = "    biology: {\n"
    
    match = re.search(r'biology:\s*\{([\s\S]*?)\n\s*\}', js_content)
    if not match:
        return
        
    current_block = match.group(1).split('\n')
    
    for line in current_block:
        if not line.strip():
            continue
            
        # Botany chapters
        if "2021:" in line and "{" in line and "}" in line and not "2020:" in line and not "2024: 0" in line and not "2024: 1" in line:
             # Just to be safe, only keep simple lines that look like standard botany lines
             # Wait, our previous merge script might have corrupted things. Let's just hardcode Botany chapters to be 100% safe.
             pass
             
    # Hardcoded Botany Chapters to restore them cleanly
    botany = {
        'The Living World': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Biological Classification': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Plant Kingdom': { 2021: 3, 2022: 5, 2023: 3, 2024: 3 },
        'Morphology of Flowering Plants': { 2021: 3, 2022: 3, 2023: 2, 2024: 3 },
        'Anatomy of Flowering Plants': { 2021: 2, 2022: 3, 2023: 2, 2024: 2 },
        'Cell: The Unit of Life': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },
        'Photosynthesis in Higher Plants': { 2021: 3, 2022: 2, 2023: 3, 2024: 3 },
        'Respiration in Plants': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Plant Growth and Development': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Sexual Reproduction in Flowering Plants': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Principles of Inheritance and Variation': { 2021: 4, 2022: 3, 2023: 4, 2024: 4 },
        'Molecular Basis of Inheritance': { 2021: 4, 2022: 3, 2023: 4, 2024: 3 },
        'Microbes in Human Welfare': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Organisms and Populations': { 2021: 3, 2022: 3, 2023: 3, 2024: 3 },
        'Ecosystem': { 2021: 3, 2022: 2, 2023: 2, 2024: 3 },
        'Biodiversity and Conservation': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        'Environmental Issues': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
    }
    
    for ch, w in botany.items():
        w_str = ", ".join([f"{yr}: {val}" for yr, val in w.items()])
        new_biology_block += f"        '{ch}': {{ {w_str} }},\n"
    
    # Add Zoology granular chapters
    for chapter_name, topics in zoo_data.items():
        new_biology_block += f"        '{chapter_name}': {{\n" 
        for topic_name, weights in topics.items():
            # Escape single quotes
            safe_topic = topic_name.replace("'", "\\'")
            w_str = ", ".join([f"{yr}: {val}" for yr, val in weights.items()])
            new_biology_block += f"            '{safe_topic}': {{ {w_str} }},\n"
        new_biology_block += f"        }},\n"
        
    new_biology_block += "    }"
    
    full_old_block = match.group(0)
    new_content = js_content.replace(full_old_block, new_biology_block)
    
    with open('../lib/ncert-data.js', 'w') as f:
        f.write(new_content)
        
    print("Fixed syntax errors by escaping single quotes and cleanly restoring Botany data!")

if __name__ == "__main__":
    fix_and_merge()
