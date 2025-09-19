#!/usr/bin/env python3
"""
Debug Design Generation Issues

This script will test design generation with both providers and show
detailed output to identify the root cause of the validation failures.
"""
import requests
import json
import base64
import io
from PIL import Image

def create_test_image():
    """Create a simple test image for testing"""
    img = Image.new('RGB', (200, 100), color='white')
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 180, 80], fill='#007BFF', outline='#0056b3', width=2)
    try:
        draw.text((60, 45), "BUTTON", fill='white')
    except:
        pass
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    return base64.b64encode(img_data).decode('utf-8')

def debug_design_generation(provider: str, model: str, use_image: bool = False):
    """Debug design generation with detailed output"""
    print(f"\n{'='*60}")
    print(f"🔍 DEBUGGING: {provider.upper()} - {model}")
    print(f"📝 Scenario: {'Image' if use_image else 'Text'} Generation")
    print(f"{'='*60}")
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple HTML page with a modern button component",
        "framework": "react",
        "llm_provider": provider,
        "model": model
    }
    
    if use_image:
        payload["imageData"] = create_test_image()
        payload["imageType"] = "image/png"
        payload["userPrompt"] = "Create HTML code for a button that matches this image style"
    
    try:
        print("📡 Sending request to MCP server...")
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ JSON Response received")
            print(f"🔍 Success field: {result.get('success', 'NOT FOUND')}")
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"📄 Data keys: {list(data.keys())}")
                
                html = data.get('html', '')
                css = data.get('css', '')
                js = data.get('javascript', '')
                
                print(f"📏 HTML length: {len(html)} chars")
                print(f"📏 CSS length: {len(css)} chars")
                print(f"📏 JS length: {len(js)} chars")
                
                if html:
                    print(f"\n📄 HTML Content Preview (first 300 chars):")
                    print("-" * 40)
                    print(html[:300])
                    print("-" * 40)
                    
                    # Check for body content specifically
                    if '<body>' in html:
                        body_start = html.find('<body>') + 6
                        body_end = html.find('</body>')
                        if body_end > body_start:
                            body_content = html[body_start:body_end].strip()
                            print(f"🎯 Body content length: {len(body_content)} chars")
                            print(f"🎯 Body content preview: {body_content[:100]}...")
                        else:
                            print("⚠️  No closing </body> tag found")
                    else:
                        print("⚠️  No <body> tag found in HTML")
                
                print(f"\n✅ SUCCESS: Content generated successfully")
                
            else:
                print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                print(f"🔍 Error: {result.get('error', 'No error details')}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response text: {response.text[:500]}...")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

def run_debug_tests():
    """Run debug tests for design generation"""
    print("🔍 DEBUGGING DESIGN GENERATION ISSUES")
    print("="*60)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ MCP Server not accessible")
            return
    except:
        print("❌ MCP Server not running. Please start with: cd mcp && python mcp_server.py")
        return
    
    print("✅ MCP Server is running")
    
    # Test configurations that are failing
    test_configs = [
        {"provider": "openai", "model": "gpt-4o", "use_image": False},
        {"provider": "openai", "model": "gpt-4o", "use_image": True},
        {"provider": "google", "model": "gemini-2.5-pro", "use_image": False},
        {"provider": "google", "model": "gemini-2.5-pro", "use_image": True},
    ]
    
    for config in test_configs:
        debug_design_generation(
            config["provider"], 
            config["model"], 
            config["use_image"]
        )
        
        # Wait between tests
        import time
        time.sleep(2)
    
    print(f"\n{'='*60}")
    print("🎯 DEBUG ANALYSIS COMPLETE")
    print("="*60)
    print("Look for patterns in the failures above to identify the root cause.")

if __name__ == "__main__":
    # Install PIL if needed
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow...")
        import os
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    run_debug_tests()
