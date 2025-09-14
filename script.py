# Let me analyze the sample text structure to understand the pattern better
sample_text = """(06:51)شركةأسواقومخابزال/شركةأسواقومخابزالمختار
(01:28)
(03:07)طارقعبداللهابراهيم/طارقعبداللهابراهيمالس
Unidentified Deposits Movement Aug'2025
(11:54)تمويناتوتينمدىللم/تمويناتوتينمدىللموادال
(11:38)مؤسسةدارسلتيللتجا/مؤسسةدارسلتيللتجارة/CA
(11:30)تمويناتعربةلينللم/تمويناتعربةلينللموادال"""

print("Sample lines analysis:")
lines = sample_text.strip().split('\n')

for i, line in enumerate(lines[:10], 1):
    print(f"Line {i}: {line}")
    
    # Extract timestamp pattern
    if line.startswith('(') and ')' in line:
        closing_paren = line.find(')')
        timestamp = line[1:closing_paren]
        rest = line[closing_paren+1:]
        print(f"  - Timestamp: {timestamp}")
        print(f"  - Rest: {rest}")
        
        # Check if there's Arabic text
        arabic_pattern = r'[\u0600-\u06FF]+'
        import re
        arabic_matches = re.findall(arabic_pattern, rest)
        if arabic_matches:
            print(f"  - Arabic parts: {arabic_matches}")
            
        # Check for English/codes
        english_pattern = r'[a-zA-Z0-9/]+'
        english_matches = re.findall(english_pattern, rest)
        if english_matches:
            print(f"  - English/Code parts: {english_matches}")
    else:
        print("  - No timestamp pattern found")
    print()