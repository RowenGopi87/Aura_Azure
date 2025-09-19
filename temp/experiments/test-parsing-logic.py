#!/usr/bin/env python3
"""
Test the parsing logic with actual Google Gemini response
"""

def parse_generated_code_test(llm_result: str, framework: str = "react"):
    """
    Test version of parse_generated_code function
    """
    from datetime import datetime
    
    try:
        result_str = str(llm_result)
        print(f"[PARSE] Raw LLM result length: {len(result_str)}")
        print(f"[PARSE] Raw LLM result preview: {result_str[:500]}...")
        
        # Look for HTML code blocks or complete HTML
        html_content = ""
        
        # First, try to find a complete HTML document in code blocks
        if '```html' in result_str:
            # Look for all HTML code blocks and find the one with complete HTML structure
            html_blocks = []
            start_pos = 0
            
            while True:
                html_start = result_str.find('```html', start_pos)
                if html_start == -1:
                    break
                    
                html_start += 7  # Skip '```html'
                html_end = result_str.find('```', html_start)
                
                if html_end > html_start:
                    block_content = result_str[html_start:html_end].strip()
                    html_blocks.append(block_content)
                    print(f"[PARSE] Found HTML block {len(html_blocks)}, length: {len(block_content)}")
                    
                    # Check if this block contains a complete HTML document
                    if '<!DOCTYPE html>' in block_content or '<html' in block_content:
                        html_content = block_content
                        print(f"[PARSE] Using complete HTML document from block {len(html_blocks)}, length: {len(html_content)}")
                        break
                
                start_pos = html_end + 3 if html_end != -1 else html_start + 1
            
            # If no complete HTML document found, use the largest block
            if not html_content and html_blocks:
                html_content = max(html_blocks, key=len)
                print(f"[PARSE] No complete HTML found, using largest block, length: {len(html_content)}")
            
            # If still no content, use fallback
            if not html_content:
                print(f"[PARSE] Found ```html but couldn't extract content properly")
                html_content = result_str.strip()
                print(f"[PARSE] Using entire result as fallback, length: {len(html_content)}")
                
        elif '<!DOCTYPE html>' in result_str or '<html' in result_str:
            # Full HTML document - use as-is
            html_content = result_str.strip()
            print(f"[PARSE] Using complete HTML document, length: {len(html_content)}")
        else:
            # Fallback - treat entire result as HTML but warn about it
            html_content = result_str.strip()
            print(f"[PARSE] WARNING: No clear HTML markers found, using entire result as HTML fallback, length: {len(html_content)}")
            print(f"[PARSE] Content preview: {html_content[:200]}...")
        
        # Check if we got valid HTML
        has_html_structure = ('<!DOCTYPE html>' in html_content or '<html' in html_content)
        print(f"[PARSE] Has HTML structure: {has_html_structure}")
        
        if has_html_structure:
            print(f"[PARSE] ✅ SUCCESS: Valid HTML extracted!")
            print(f"[PARSE] HTML preview: {html_content[:300]}...")
        else:
            print(f"[PARSE] ❌ ISSUE: No HTML structure found in extracted content")
            print(f"[PARSE] Extracted content: {html_content[:300]}...")
        
        return {
            "html": html_content,
            "css": "",  # For single-file HTML, CSS is embedded
            "javascript": "",  # For single-file HTML, JS is embedded
            "framework": framework,
            "generatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"[PARSE] ERROR: {e}")
        return {
            "html": "<!-- HTML parsing failed -->",
            "css": "/* CSS extraction failed */",
            "javascript": "// JavaScript extraction failed",
            "framework": framework,
            "generatedAt": datetime.now().isoformat()
        }

def test_with_sample_response():
    """Test with a sample Google Gemini response"""
    
    # This is the actual response from Google Gemini (truncated for testing)
    sample_response = """Of course! As a UI/UX designer, I believe a button is more than just a line of code—it's the primary way a user interacts with your application. It needs to be clear, accessible, and provide good feedback. 

Let's start with the simplest, most correct HTML and then build up to a well-designed, modern button with CSS and best practices.

### 1. The Simple, Semantic Answer (The Best Starting Point)

For any action on a page (like "Submit," "Save," "Add to Cart"), you should always use the `<button>` element. It's designed for this purpose and comes with built-in accessibility for screen readers and keyboard navigation.

```html
<button type="button">
  Click Me
</button>
```

### 2. The Modern, Well-Designed Button (HTML + CSS)

A plain HTML button is functional but not very visually appealing. Let's create a beautiful, modern primary call-to-action (CTA) button.

Here is the complete code you can drop into an HTML file and see it work.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Button Example</title>
    <style>
        /* A little reset and font for the demo */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: grid;
            place-content: center;
            min-height: 100vh;
            background-color: #f4f7f9;
        }

        /* --- The Button Style --- */
        .cta-button {
            /* Text and Font */
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-decoration: none;

            /* Sizing and Spacing */
            padding: 14px 28px;
            border-radius: 8px; /* Rounded corners */

            /* Color and Appearance */
            background-color: #007bff; /* A nice, standard blue */
            border: none; /* Remove default browser border */
            cursor: pointer; /* Show a pointer on hover to indicate it's clickable */

            /* Smooth transitions for states */
            transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
        }

        /* --- INTERACTIVE STATES (CRUCIAL for good UX!) --- */

        /* Hover State: When the mouse is over the button */
        .cta-button:hover {
            background-color: #0056b3; /* A slightly darker blue */
        }

        /* Focus State: For accessibility, when a user tabs to the button */
        .cta-button:focus-visible {
            outline: 3px solid #007bff;
            outline-offset: 2px;
        }

        /* Active State: When the button is being clicked */
        .cta-button:active {
            transform: scale(0.98); /* Makes the button feel like it's being pressed */
            background-color: #004a99;
        }

        /* Disabled State: When the button cannot be used */
        .cta-button:disabled {
            background-color: #a0c7f5;
            cursor: not-allowed;
            opacity: 0.7;
        }
    </style>
</head>
<body>

    <!-- This is the button you would use in your project -->
    <button type="button" class="cta-button">
      Get Started
    </button>

</body>
</html>
```

### 3. More examples and best practices...
"""
    
    print("🧪 Testing parsing logic with sample Google Gemini response")
    print("="*60)
    print(f"Sample response length: {len(sample_response)} chars")
    
    result = parse_generated_code_test(sample_response)
    
    print("\n" + "="*60)
    print("📊 PARSING RESULTS:")
    print(f"HTML length: {len(result['html'])}")
    print(f"Has HTML structure: {'<!DOCTYPE html>' in result['html'] or '<html' in result['html']}")
    
    if len(result['html']) > 1000:
        print("✅ SUCCESS: HTML extracted successfully!")
        return True
    else:
        print("❌ FAILED: HTML not extracted properly")
        return False

if __name__ == "__main__":
    test_with_sample_response()
