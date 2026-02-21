import re
import json

def parse_zoology_text():
    with open('zoology_extracted.txt', 'r') as f:
        lines = f.readlines()
        
    data = {"zoology": {}}
    current_chapter = None
    
    topic_pattern = re.compile(r'^(.*?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$')
    chapter_pattern = re.compile(r'^(\d+)\.\s+(.*)$')
    
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue
            
        ch_match = chapter_pattern.match(line)
        if ch_match:
            current_chapter = ch_match.group(2).strip()
            data["zoology"][current_chapter] = {}
            i += 1
            continue
            
        if current_chapter:
            # Check for standard topic lines that look like:
            # TopicName 1 0 1 1 0 0 3 1 2 0
            
            top_match = topic_pattern.match(line)
            if top_match:
                topic_name = top_match.group(1).strip()
                
                # If the PDF splits topic names across lines, often there are rows below with just text (no numbers)
                # Or the text starts on the line with numbers and wraps to the next line. Let's look ahead for non-numbered lines.
                
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                        
                    # Stop if we hit a chapter header
                    if chapter_pattern.match(next_line):
                        break
                        
                    # Stop if we hit a new topic data line
                    if topic_pattern.match(next_line):
                        break
                        
                    # Stop if we hit summary sections
                    if next_line.startswith("Total") or next_line.startswith("Summary:") or next_line.startswith("Insights:") or next_line.startswith("ZOOLOGY"):
                        break
                        
                    # It's an orphan text line! It belongs to the current topic.
                    topic_name += " " + next_line
                    j += 1
                
                # We skip j-1 lines forward
                i = j - 1
                
                # Remove artifacts like "(xyz)" inside the name that may have been parsed weirdly. Actually let's just clean it up.
                topic_name = topic_name.replace("  ", " ").strip()
                
                try:
                    vals = {
                        "2020": int(top_match.group(2)),
                        "2021": int(top_match.group(3)),
                        "2022": int(top_match.group(4)),
                        "2023": int(top_match.group(5)),
                        "2024": int(top_match.group(6)),
                    }
                    data["zoology"][current_chapter][topic_name] = vals
                except Exception as e:
                    pass
                
        i += 1
        
    with open('zoology_structured.json', 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    parse_zoology_text()
