#!/usr/bin/env python3
"""
Focused test for Design Generation issues
Testing only Design Generation (Text & Image) on Google and OpenAI
"""
import requests
import json
import base64
import io
import time
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

def test_design_generation(provider: str, model: str, scenario: str, has_image: bool = False):
    """Test a specific design generation scenario"""
    print(f"\n{'='*80}")
    print(f"🧪 TESTING: {provider.upper()} - {model} - {scenario}")
    print(f"{'='*80}")
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create HTML code for a button that matches this image style" if has_image else "Create a simple HTML page with a modern button component",
        "framework": "react",
        "llm_provider": provider,
        "model": model
    }
    
    if has_image:
        payload["imageData"] = create_test_image()
        payload["imageType"] = "image/png"
    
    print(f"📋 Request Details:")
    print(f"   Provider: {provider}")
    print(f"   Model: {model}")
    print(f"   Has Image: {has_image}")
    print(f"   System Prompt: '{payload['systemPrompt'][:50]}...'")
    print(f"   User Prompt: '{payload['userPrompt'][:50]}...'")
    
    try:
        print(f"\n📡 Sending request to MCP server...")
        start_time = time.time()
        
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=120
        )
        
        execution_time = time.time() - start_time
        print(f"⏱️  Request completed in {execution_time:.2f}s")
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ JSON Response received")
            print(f"🔍 Response Keys: {list(result.keys())}")
            print(f"🔍 Success: {result.get('success', 'NOT FOUND')}")
            print(f"🔍 Message: {result.get('message', 'NO MESSAGE')}")
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"📄 Data Keys: {list(data.keys())}")
                
                if 'html' in data:
                    html = data.get('html', '')
                    print(f"📏 HTML Length: {len(html)} chars")
                    if html:
                        print(f"📄 HTML Preview (first 200 chars):")
                        print("-" * 50)
                        print(html[:200])
                        print("-" * 50)
                        
                        # Check if it's actual HTML or debug info
                        if html.startswith('<!DOCTYPE html>') or html.startswith('<html'):
                            print(f"✅ SUCCESS: Valid HTML generated")
                            return True, "Valid HTML generated"
                        elif 'sdk_http_response' in html or 'candidates=[Candidate(' in html:
                            print(f"❌ FAILED: Debug response returned instead of HTML")
                            return False, "Debug response instead of HTML"
                        else:
                            print(f"⚠️  WARNING: Unusual HTML format")
                            return True, "Unusual but potentially valid HTML"
                
                print(f"✅ SUCCESS: Content generated successfully")
                return True, "Success"
                
            else:
                error = result.get('error', result.get('message', 'Unknown error'))
                print(f"❌ FAILED: {error}")
                return False, error
                
        else:
            error_text = response.text[:500] if response.text else "No response text"
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response: {error_text}")
            return False, f"HTTP {response.status_code}"
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False, str(e)

def run_design_generation_focus_test():
    """Run focused design generation tests"""
    print("🎯 FOCUSED DESIGN GENERATION TEST")
    print("Testing only Design Generation scenarios on Google and OpenAI")
    print("="*80)
    
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
    
    # Test scenarios - only Design Generation
    test_scenarios = [
        # Google Tests
        {"provider": "google", "model": "gemini-2.5-flash", "scenario": "Design Generation (Text)", "has_image": False},
        {"provider": "google", "model": "gemini-2.5-flash", "scenario": "Design Generation (Image)", "has_image": True},
        {"provider": "google", "model": "gemini-2.5-pro", "scenario": "Design Generation (Text)", "has_image": False},
        {"provider": "google", "model": "gemini-2.5-pro", "scenario": "Design Generation (Image)", "has_image": True},
        
        # OpenAI Tests
        {"provider": "openai", "model": "gpt-4o", "scenario": "Design Generation (Text)", "has_image": False},
        {"provider": "openai", "model": "gpt-4o", "scenario": "Design Generation (Image)", "has_image": True},
        {"provider": "openai", "model": "gpt-4o-mini", "scenario": "Design Generation (Text)", "has_image": False},
        {"provider": "openai", "model": "gpt-4o-mini", "scenario": "Design Generation (Image)", "has_image": True},
    ]
    
    results = []
    
    for scenario in test_scenarios:
        success, error = test_design_generation(
            scenario["provider"], 
            scenario["model"], 
            scenario["scenario"], 
            scenario["has_image"]
        )
        results.append({
            "provider": scenario["provider"],
            "model": scenario["model"],
            "scenario": scenario["scenario"],
            "success": success,
            "error": error
        })
        
        # Wait between tests to avoid rate limiting
        time.sleep(2)
    
    # Summary Analysis
    print(f"\n{'='*80}")
    print("📊 DESIGN GENERATION FOCUS TEST SUMMARY")
    print(f"{'='*80}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/8")
    print(f"❌ Failed: {len(failed)}/8")
    
    if successful:
        print(f"\n🎉 WORKING SCENARIOS:")
        for result in successful:
            print(f"   ✅ {result['provider'].upper()} {result['model']} - {result['scenario']}")
    
    if failed:
        print(f"\n🔍 FAILED SCENARIOS:")
        for result in failed:
            print(f"   ❌ {result['provider'].upper()} {result['model']} - {result['scenario']}: {result['error']}")
    
    # Provider Analysis
    print(f"\n🔍 PROVIDER ANALYSIS:")
    
    google_results = [r for r in results if r["provider"] == "google"]
    openai_results = [r for r in results if r["provider"] == "openai"]
    
    google_success = len([r for r in google_results if r["success"]])
    openai_success = len([r for r in openai_results if r["success"]])
    
    print(f"   Google Gemini: {google_success}/4 success rate")
    print(f"   OpenAI GPT: {openai_success}/4 success rate")
    
    # Model Analysis
    print(f"\n🔍 MODEL ANALYSIS:")
    
    models = {}
    for result in results:
        model_key = f"{result['provider']}-{result['model']}"
        if model_key not in models:
            models[model_key] = {"success": 0, "total": 0}
        models[model_key]["total"] += 1
        if result["success"]:
            models[model_key]["success"] += 1
    
    for model, stats in models.items():
        success_rate = (stats["success"] / stats["total"]) * 100
        print(f"   {model}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
    
    return results

if __name__ == "__main__":
    # Install PIL if needed
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow...")
        import os
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    run_design_generation_focus_test()
