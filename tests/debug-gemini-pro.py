#!/usr/bin/env python3
"""
Debug Google Gemini-2.5-pro Issues

This script focuses specifically on testing Google Gemini-2.5-pro
to identify why it's failing when other models work fine.
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

def debug_gemini_pro_scenario(scenario_name: str, payload: dict):
    """Debug a specific Gemini-2.5-pro scenario with detailed logging"""
    print(f"\n{'='*70}")
    print(f"🔍 DEBUGGING GEMINI-2.5-PRO: {scenario_name}")
    print(f"{'='*70}")
    
    print(f"📋 Request Details:")
    print(f"   Model: {payload['model']}")
    print(f"   Provider: {payload['llm_provider']}")
    print(f"   System Prompt: '{payload['systemPrompt'][:50]}...'")
    print(f"   User Prompt: '{payload['userPrompt'][:50]}...'")
    print(f"   Has Image: {bool(payload.get('imageData'))}")
    if payload.get('imageData'):
        print(f"   Image Data Length: {len(payload['imageData'])} chars")
    
    try:
        print(f"\n📡 Sending request to MCP server...")
        start_time = time.time()
        
        response = requests.post(
            "http://localhost:8000/generate-design-code" if "Design" in scenario_name else "http://localhost:8000/reverse-engineer-design",
            json=payload,
            timeout=120  # Longer timeout for Gemini-2.5-pro
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
                
                print(f"✅ SUCCESS: Content generated successfully")
                return True, "Success"
                
            else:
                error = result.get('error', result.get('message', 'Unknown error'))
                print(f"❌ FAILED: {error}")
                
                # Look for specific error patterns
                if "0 output tokens" in error:
                    print(f"🔍 ANALYSIS: Google Gemini returned 0 output tokens")
                    print(f"   This suggests:")
                    print(f"   - API rate limiting or quota issues")
                    print(f"   - Content filtering blocking the response")
                    print(f"   - Model-specific issues with gemini-2.5-pro")
                    print(f"   - Prompt format incompatibility")
                elif "NoneType" in error:
                    print(f"🔍 ANALYSIS: NoneType error suggests response parsing issue")
                    print(f"   This suggests:")
                    print(f"   - Empty response from API")
                    print(f"   - Response structure different than expected")
                    print(f"   - Official SDK returning None content")
                elif "insufficient body content" in error:
                    print(f"🔍 ANALYSIS: HTML validation issue")
                    print(f"   This suggests:")
                    print(f"   - Generated content is too short")
                    print(f"   - HTML parsing extracted minimal content")
                
                return False, error
                
        else:
            error_text = response.text[:500] if response.text else "No response text"
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response: {error_text}")
            return False, f"HTTP {response.status_code}"
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False, str(e)

def run_gemini_pro_debug():
    """Run focused debug tests for Gemini-2.5-pro"""
    print("🔍 DEBUGGING GOOGLE GEMINI-2.5-PRO ISSUES")
    print("="*70)
    
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
    
    # Test scenarios that were failing for Gemini-2.5-pro
    test_scenarios = [
        {
            "name": "Design Generation (Text)",
            "payload": {
                "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
                "userPrompt": "Create a simple HTML page with a modern button component",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-pro"
            }
        },
        {
            "name": "Design Generation (Image)",
            "payload": {
                "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
                "userPrompt": "Create HTML code for a button that matches this image style",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-pro",
                "imageData": create_test_image(),
                "imageType": "image/png"
            }
        },
        {
            "name": "Reverse Engineering (Text)",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided design and extract business requirements in JSON format.",
                "userPrompt": "Analyze this design and create user stories and acceptance criteria",
                "analysisLevel": "story",
                "hasImage": False,
                "llm_provider": "google",
                "model": "gemini-2.5-pro"
            }
        },
        {
            "name": "Reverse Engineering (Image)",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided design and extract business requirements in JSON format.",
                "userPrompt": "Analyze this design and create user stories and acceptance criteria",
                "analysisLevel": "story",
                "hasImage": True,
                "imageData": create_test_image(),
                "imageType": "image/png",
                "llm_provider": "google",
                "model": "gemini-2.5-pro"
            }
        }
    ]
    
    results = []
    
    for scenario in test_scenarios:
        success, error = debug_gemini_pro_scenario(scenario["name"], scenario["payload"])
        results.append({
            "scenario": scenario["name"],
            "success": success,
            "error": error
        })
        
        # Wait between tests to avoid rate limiting
        time.sleep(3)
    
    # Summary Analysis
    print(f"\n{'='*70}")
    print("📊 GEMINI-2.5-PRO DEBUG SUMMARY")
    print(f"{'='*70}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/4")
    print(f"❌ Failed: {len(failed)}/4")
    
    if successful:
        print(f"\n🎉 WORKING SCENARIOS:")
        for result in successful:
            print(f"   ✅ {result['scenario']}")
    
    if failed:
        print(f"\n🔍 FAILED SCENARIOS:")
        for result in failed:
            print(f"   ❌ {result['scenario']}: {result['error']}")
    
    # Pattern Analysis
    print(f"\n🔍 PATTERN ANALYSIS:")
    
    error_patterns = {}
    for result in failed:
        error = result["error"]
        if "0 output tokens" in error:
            error_patterns["0_output_tokens"] = error_patterns.get("0_output_tokens", 0) + 1
        elif "NoneType" in error:
            error_patterns["none_type"] = error_patterns.get("none_type", 0) + 1
        elif "insufficient body content" in error:
            error_patterns["validation"] = error_patterns.get("validation", 0) + 1
        else:
            error_patterns["other"] = error_patterns.get("other", 0) + 1
    
    for pattern, count in error_patterns.items():
        print(f"   {pattern.replace('_', ' ').title()}: {count} occurrences")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    
    if error_patterns.get("0_output_tokens", 0) > 0:
        print("🔧 For 0 output tokens:")
        print("   - Try using gemini-2.5-flash instead of gemini-2.5-pro")
        print("   - Check API quotas and rate limits")
        print("   - Verify prompt format compatibility")
        print("   - Consider shorter, simpler prompts")
    
    if error_patterns.get("none_type", 0) > 0:
        print("🔧 For NoneType errors:")
        print("   - Check official SDK response handling")
        print("   - Verify content extraction logic")
        print("   - Add null checks in response processing")
    
    if len(failed) == 4:
        print("⚠️  ALL SCENARIOS FAILED:")
        print("   - Consider gemini-2.5-pro may have API issues")
        print("   - Switch to gemini-2.5-flash as primary model")
        print("   - Check Google API status and quotas")
    
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
    
    run_gemini_pro_debug()
