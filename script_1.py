# Let me create a more comprehensive analysis and processing algorithm
import re
import json

def analyze_arabic_text_structure(text):
    """Analyze the structure and create processing rules"""
    lines = text.strip().split('\n')
    analysis = {
        'total_lines': len(lines),
        'timestamp_lines': 0,
        'empty_lines': 0,
        'header_lines': 0,
        'patterns': []
    }
    
    patterns = {
        'timestamp_pattern': r'^\((\d{2}:\d{2})\)(.*)$',
        'arabic_pattern': r'[\u0600-\u06FF]+',
        'english_codes': r'[A-Z]{2,}:\d+',
        'account_codes': r'CA:\d+',
        'bank_codes': r'\d{8}[A-Z0-9]+',
        'separators': r'[/]'
    }
    
    for i, line in enumerate(lines):
        line_analysis = {'line_number': i+1, 'content': line, 'type': 'unknown'}
        
        if not line.strip():
            analysis['empty_lines'] += 1
            line_analysis['type'] = 'empty'
            continue
            
        # Check for timestamp pattern
        timestamp_match = re.match(patterns['timestamp_pattern'], line)
        if timestamp_match:
            analysis['timestamp_lines'] += 1
            line_analysis['type'] = 'timestamped_entry'
            line_analysis['timestamp'] = timestamp_match.group(1)
            rest_content = timestamp_match.group(2)
            
            # Analyze the rest of the content
            arabic_parts = re.findall(patterns['arabic_pattern'], rest_content)
            english_codes = re.findall(patterns['english_codes'], rest_content)
            account_codes = re.findall(patterns['account_codes'], rest_content)
            bank_codes = re.findall(patterns['bank_codes'], rest_content)
            
            line_analysis['arabic_parts'] = arabic_parts
            line_analysis['english_codes'] = english_codes
            line_analysis['account_codes'] = account_codes
            line_analysis['bank_codes'] = bank_codes
            line_analysis['separators'] = len(re.findall(patterns['separators'], rest_content))
            
        else:
            # Check if it's a header line (English text)
            if re.search(r'^[A-Za-z\s\'\d]+$', line):
                analysis['header_lines'] += 1
                line_analysis['type'] = 'header'
            else:
                line_analysis['type'] = 'mixed_content'
        
        analysis['patterns'].append(line_analysis)
    
    return analysis

# Test with sample data
sample_text = """(06:51)شركةأسواقومخابزال/شركةأسواقومخابزالمختار
(01:28)
(03:07)طارقعبداللهابراهيم/طارقعبداللهابراهيمالس
Unidentified Deposits Movement Aug'2025
(11:54)تمويناتوتينمدىللم/تمويناتوتينمدىللموادال
(11:38)مؤسسةدارسلتيللتجا/مؤسسةدارسلتيللتجارة/CA
(11:30)تمويناتعربةلينللم/تمويناتعربةلينللموادال
(11:20)مؤسسةأسوارتيماءاث/مؤسسةأسوارتيماءاثنينال
(11:12)مؤسسةعليمحمدعليق/مؤسسةعليمحمدعليقحلالتجا
(11:10)مؤسسةشروقالبيضاء/مؤسسةشروقالبيضاء/CA:236
(11:02)20250901SABSFRBSFR6BCFT12302807881/SAMAA
(10:56)شركةنهلةالواديالت/شركةنهلةالواديالتجارية"""

analysis = analyze_arabic_text_structure(sample_text)

print("=== STRUCTURE ANALYSIS ===")
print(f"Total lines: {analysis['total_lines']}")
print(f"Timestamp lines: {analysis['timestamp_lines']}")
print(f"Empty lines: {analysis['empty_lines']}")
print(f"Header lines: {analysis['header_lines']}")

print("\n=== SAMPLE LINE ANALYSIS ===")
for pattern in analysis['patterns'][:5]:  # Show first 5 for brevity
    print(f"Line {pattern['line_number']}: {pattern['type']}")
    if 'arabic_parts' in pattern:
        print(f"  Arabic parts: {len(pattern['arabic_parts'])}")
        print(f"  Separators: {pattern['separators']}")
        if pattern['english_codes']:
            print(f"  English codes: {pattern['english_codes']}")
        if pattern['account_codes']:
            print(f"  Account codes: {pattern['account_codes']}")