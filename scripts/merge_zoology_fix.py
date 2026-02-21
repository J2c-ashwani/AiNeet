import json
import re

def fix_and_merge():
    with open('zoology_topics_only.json', 'r') as f:
        zoo_data = json.load(f)
        
    with open('../lib/ncert-data.js', 'r') as f:
        js_content = f.read()
        
    # We will build a new biology block
    new_biology_block = "biology: {\n"
    
    # Let's extract original botany chapters by looking at the original ncert-data.js before our merge script broke it
    # Oh wait, we already overwrote it! We need to fetch the botany chapters from the current broken one up until we see Zoology chapters,
    # or just parse the JS again carefully.
    
    # Let's read the current broken block
    match = re.search(r'biology:\s*\{([\s\S]*?)\n\s*\}', js_content)
    if not match:
        return
        
    current_block = match.group(1).split('\n')
    
    # We will completely rebuild the block. 
    # For botany chapters, they survived because they look like: 'The Living World': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
    
    botany_chapters = [
        'The Living World', 'Biological Classification', 'Plant Kingdom', 
        'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 
        'Cell: The Unit of Life', 'Photosynthesis in Higher Plants', 
        'Respiration in Plants', 'Plant Growth and Development',
        'Sexual Reproduction in Plants', 'Principles of Inheritance & Variation',
        'Molecular Basis of Inheritance', 'Microbes in Human Welfare',
        'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 
        'Environmental Issues'
    ]
    
    # Let's just restore from our zoology_topics_only.json and a hardcoded list of Botany chapters (or extract them line by line)
    
    for line in current_block:
        if not line.strip():
            continue
            
        # Is this a simple chapter line? 
        if "2021:" in line and "{" in line and "}" in line and not "2020:" in line:
            # It's a Botany chapter line (since Botany only has 4 years of data and is on one line)
            new_biology_block += line + "\n"
            
    # Now append the zoology chapters
    for chapter_name, topics in zoo_data.items():
        new_biology_block += f"        `{chapter_name}`: {{\n" # use backticks to avoid single quote issues
        for topic_name, weights in topics.items():
            # Escape inner backticks if any (unlikely, but just in case)
            safe_topic = topic_name.replace('`', '\\`')
            w_str = ", ".join([f"{yr}: {val}" for yr, val in weights.items()])
            new_biology_block += f"            `{safe_topic}`: {{ {w_str} }},\n"
        new_biology_block += f"        }},\n"
        
    new_biology_block += "    }"
    
    full_old_block = match.group(0)
    new_content = js_content.replace(full_old_block, new_biology_block)
    
    with open('../lib/ncert-data.js', 'w') as f:
        f.write(new_content)
        
    print("Fixed syntax errors by using back-ticks for property keys in JS!")

if __name__ == "__main__":
    fix_and_merge()
