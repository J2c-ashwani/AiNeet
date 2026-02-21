import json
import re

def merge_data():
    with open('zoology_topics_only.json', 'r') as f:
        zoo_data = json.load(f)
        
    with open('../lib/ncert-data.js', 'r') as f:
        js_content = f.read()
        
    # We need to replace the `biology: { ... }` block inside NEET_BLUEPRINT
    # First, let's find that block. We can use regex to find the start of biology and its end
    
    match = re.search(r'biology:\s*\{([\s\S]*?)\n\s*\}', js_content)
    if not match:
        print("Could not find biology block")
        return
        
    biology_block = match.group(1)
    
    # We will build a new biology block
    new_biology_block = "biology: {\n"
    
    # Extract existing chapters so we keep Botany chapters as they are (since we only have Zoology PDF right now)
    # We'll parse the existing lines
    botany_lines = []
    
    for line in biology_block.split('\n'):
        if not line.strip():
            continue
            
        # Example format: 'The Living World': { 2021: 2, 2022: 2, 2023: 2, 2024: 2 },
        # Extract the chapter name
        ch_match = re.search(r"'([^']+)'", line)
        if not ch_match:
            ch_match = re.search(r'"([^"]+)"', line)
            
        if ch_match:
            chapter_name = ch_match.group(1)
            
            # If this chapter is in our Zoology data, we replace it with the nested topic data!
            if chapter_name in zoo_data:
                topics = zoo_data[chapter_name]
                new_biology_block += f"        '{chapter_name}': {{\n"
                for topic_name, weights in topics.items():
                    # Format: 'Topic Name': { 2020: 1, 2021: 0, ... }
                    w_str = ", ".join([f"{yr}: {val}" for yr, val in weights.items()])
                    new_biology_block += f"            '{topic_name}': {{ {w_str} }},\n"
                new_biology_block += f"        }},\n"
            else:
                # It's a Botany chapter (or one we don't have detailed data for yet), keep it as is
                new_biology_block += line + "\n"
        else:
            new_biology_block += line + "\n"
            
    new_biology_block += "    }"
    
    # Replace the old block with the new block
    # We must be careful because my regex above just matched the inner content.
    full_old_block = match.group(0)
    new_content = js_content.replace(full_old_block, new_biology_block)
    
    with open('../lib/ncert-data.js', 'w') as f:
        f.write(new_content)
        
    print("Successfully merged Zoology topic data into ncert-data.js!")

if __name__ == "__main__":
    merge_data()
