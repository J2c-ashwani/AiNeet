import json
import re
import math

def update_ncert_data():
    # 1. Load the structured Zoology JSON
    with open('zoology_structured.json', 'r') as f:
        zoo_data = json.load(f)["zoology"]
        
    # 2. Load the existing ncert-data.js 
    with open('../lib/ncert-data.js', 'r') as f:
        ncert_content = f.read()

    # The goal is to replace the simple integers for biology chapters in NEET_BLUEPRINT 
    # with the detailed topic objects. However, currently NEET_BLUEPRINT.biology just has
    # { 2021: X, 2022: Y } per chapter. We need to upgrade these chapter objects to contain
    # a `topics` key if they don't already have one, or just replace the chapter value entirely.
    
    # We'll parse out the existing biology object, inject our topic data, and rewrite it.
    
    # Mapping chapter names from the PDF to the JS file
    # PDF Name -> JS Name
    chapter_map = {
        "Structural Organization In Animals": "Structural Organisation in Animals",
        "Biomolecules": "Biomolecules",
        "Breathing And Exchange of Gases": "Breathing and Exchange of Gases",
        "Body Fluids and Circulation": "Body Fluids and Circulation",
        "Excretory Products and their Elimination": "Excretory Products",
        "Locomotion and Movement": "Locomotion and Movement",
        "Neural Control and Coordination": "Neural Control and Coordination",
        "Chemical Coordination and Integration": "Chemical Coordination", # Wait, PDF says... Chemical Coordination and Integration? Let's check keys
        "Human Reproduction": "Human Reproduction",
        "Reproductive Health": "Reproductive Health",
        "Evolution": "Evolution",
        "Human Health and Disease": "Human Health and Diseases",
        "Biotechnology: Principles And Processes": "Biotechnology: Principles",
        "Biotechnology And Its Applications": "Biotechnology: Applications",
    }
    
    # Actually, we can just output a JS snippet for the topics and manually integrate it, or build a robust replacement.
    # Let's generate a clean JSON mapping of Chapter -> Topics -> Years
    
    final_mapping = {}
    for raw_chapter, topics in zoo_data.items():
        # Clean chapter name
        clean_chapter = raw_chapter
        for k, v in chapter_map.items():
            if raw_chapter.lower().startswith(k.lower()):
                clean_chapter = v
                break
        
        # Remove "Total" key
        if "Total" in topics:
            del topics["Total"]
            
        final_mapping[clean_chapter] = topics
        
    with open('zoology_topics_only.json', 'w') as f:
        json.dump(final_mapping, f, indent=4)

if __name__ == "__main__":
    update_ncert_data()
