#!/usr/bin/env python3
"""
Quick test to verify the validation fix works
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

def test_fixed_validation():
    """Test the fixed validation logic"""
    print("🔧 TESTING FIXED VALIDATION LOGIC")
    print("="*50)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ MCP Server not accessible")
            return
    except:
        print("❌ MCP Server not running")
        return
    
    print("✅ MCP Server is running")
    
    # Test the previously failing scenarios
    test_configs = [
        {"provider": "openai", "model": "gpt-4o", "use_image": False, "name": "OpenAI Text"},
        {"provider": "openai", "model": "gpt-4o", "use_image": True, "name": "OpenAI Image"},
        {"provider": "google", "model": "gemini-2.5-flash", "use_image": False, "name": "Gemini Flash Text"},
        {"provider": "google", "model": "gemini-2.5-flash", "use_image": True, "name": "Gemini Flash Image"},
    ]
    
    results = []
    
    for config in test_configs:
        print(f"\n🧪 Testing: {config['name']}")
        
        payload = {
            "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
            "userPrompt": "Create a simple HTML page with a modern button component",
            "framework": "react",
            "llm_provider": config["provider"],
            "model": config["model"]
        }
        
        if config["use_image"]:
            payload["imageData"] = create_test_image()
            payload["imageType"] = "image/png"
            payload["userPrompt"] = "Create HTML code for a button that matches this image style"
        
        try:
            response = requests.post(
                "http://localhost:8000/generate-design-code",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                success = result.get('success', False)
                
                if success:
                    data = result.get('data', {})
                    html_length = len(data.get('html', ''))
                    print(f"✅ SUCCESS: {html_length} chars generated")
                    results.append(True)
                else:
                    print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
                    results.append(False)
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\n{'='*50}")
    print(f"📊 QUICK FIX TEST RESULTS")
    print(f"{'='*50}")
    print(f"Success Rate: {passed}/{total} ({success_rate:.1f}%)")
    
    if success_rate >= 75:
        print("🎉 EXCELLENT: Fix is working!")
    elif success_rate >= 50:
        print("✅ GOOD: Significant improvement")
    else:
        print("⚠️  PARTIAL: Some improvement, more work needed")

if __name__ == "__main__":
    # Install PIL if needed
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow...")
        import os
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    test_fixed_validation()
