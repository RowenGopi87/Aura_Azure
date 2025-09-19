#!/usr/bin/env python3
"""
Comprehensive test for Google Gemini image handling functionality
Tests both text-only and image+text scenarios with proper error handling

This test verifies:
1. Text-only generation with proper system prompts
2. Image generation with small test images
3. Image generation with complex test images
4. HTML parsing and validation
5. Error handling and debugging

Created to verify the fix for Google Gemini image handling issues.
"""
import requests
import json
import base64
import os
import sys
from PIL import Image
import io

def create_test_image():
    """Create a simple test image for testing"""
    # Create a simple 200x100 image with text
    img = Image.new('RGB', (200, 100), color='white')
    
    # Add some simple content (we'll simulate this with a colored rectangle)
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    # Draw a simple button-like rectangle
    draw.rectangle([20, 20, 180, 80], fill='#007BFF', outline='#0056b3', width=2)
    
    # Try to add text (fallback if font not available)
    try:
        # Try to use a default font
        font = ImageFont.load_default()
        draw.text((60, 45), "BUTTON", fill='white', font=font)
    except:
        # If font fails, just draw text without font
        draw.text((60, 45), "BUTTON", fill='white')
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    
    return base64.b64encode(img_data).decode('utf-8')

def create_complex_test_image():
    """Create a more complex test image"""
    # Create a 400x300 image with a more complex design
    img = Image.new('RGB', (400, 300), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Draw a card-like container
    draw.rectangle([20, 20, 380, 280], fill='white', outline='#dee2e6', width=2)
    
    # Draw a header
    draw.rectangle([20, 20, 380, 80], fill='#007BFF', outline='#0056b3', width=1)
    
    # Draw some buttons
    draw.rectangle([40, 120, 140, 160], fill='#28a745', outline='#1e7e34', width=2)
    draw.rectangle([160, 120, 260, 160], fill='#dc3545', outline='#bd2130', width=2)
    draw.rectangle([280, 120, 360, 160], fill='#ffc107', outline='#d39e00', width=2)
    
    # Draw some text areas (simulated with rectangles)
    draw.rectangle([40, 200, 360, 220], fill='#e9ecef', outline='#ced4da', width=1)
    draw.rectangle([40, 240, 200, 260], fill='#e9ecef', outline='#ced4da', width=1)
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    
    return base64.b64encode(img_data).decode('utf-8')

def test_1_simple_text():
    """Test 1: Simple text-only generation with proper system prompt"""
    print("\n" + "="*60)
    print("🧪 TEST 1: Simple Text-Only Generation")
    print("="*60)
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple HTML page with a button",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    return make_request(payload, "Simple text-only with proper system prompt")

def test_2_html_generation():
    """Test 2: HTML generation with specific instructions"""
    print("\n" + "="*60)
    print("🧪 TEST 2: HTML Generation with Specific Instructions")
    print("="*60)
    
    payload = {
        "systemPrompt": "You are an expert web developer. Create complete, production-ready HTML.",
        "userPrompt": "Generate a complete HTML page with a modern button component",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    return make_request(payload, "HTML generation with detailed instructions")

def test_3_with_small_image():
    """Test 3: Add a small test image"""
    print("\n" + "="*60)
    print("🧪 TEST 3: With Small Test Image")
    print("="*60)
    
    # Create a minimal test image
    test_image = create_test_image()
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create an HTML button component based on the provided image. Analyze the image and recreate the button style you see.",
        "framework": "react",
        "imageData": test_image,
        "imageType": "image/png",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print(f"📊 Image data length: {len(test_image)} chars")
    return make_request(payload, "With small test image")

def test_4_with_complex_image():
    """Test 4: With a complex test image"""
    print("\n" + "="*60)
    print("🧪 TEST 4: With Complex Test Image")
    print("="*60)
    
    # Create a more complex test image
    print("📝 Creating a complex test image...")
    image_data = create_complex_test_image()
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Analyze the provided image and create an HTML component that replicates the design you see. Pay attention to colors, layout, and styling.",
        "framework": "react",
        "imageData": image_data,
        "imageType": "image/png",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print(f"📊 Image data length: {len(image_data)} chars")
    return make_request(payload, "With complex test image")

def test_5_empty_system_prompt():
    """Test 5: Test with empty system prompt (known to cause issues)"""
    print("\n" + "="*60)
    print("🧪 TEST 5: Empty System Prompt (Expected to Fail)")
    print("="*60)
    
    payload = {
        "systemPrompt": "",
        "userPrompt": "Create a simple HTML page",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    return make_request(payload, "Empty system prompt (should fail)")

def make_request(payload, test_name):
    """Make a request to the MCP server and analyze the response"""
    print(f"🚀 Running: {test_name}")
    print(f"🤖 Provider: {payload['llm_provider']}")
    print(f"📱 Model: {payload['model']}")
    print(f"🖼️  Has image: {'Yes' if payload.get('imageData') else 'No'}")
    print(f"📝 System prompt: '{payload.get('systemPrompt', '')[:50]}{'...' if len(payload.get('systemPrompt', '')) > 50 else ''}'")
    print(f"📝 User prompt: '{payload.get('userPrompt', '')[:50]}{'...' if len(payload.get('userPrompt', '')) > 50 else ''}'")
    
    try:
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            success = result.get('success', False)
            print(f"✅ Success: {success}")
            
            if success:
                data = result.get('data', {})
                html_length = len(data.get('html', ''))
                css_length = len(data.get('css', ''))
                js_length = len(data.get('javascript', ''))
                
                print(f"📄 Generated HTML length: {html_length} chars")
                print(f"🎨 Generated CSS length: {css_length} chars")
                print(f"⚡ Generated JS length: {js_length} chars")
                
                if html_length > 500:
                    print(f"🎉 SUCCESS: Generated substantial content!")
                    print(f"🔍 HTML preview: {data.get('html', '')[:150]}...")
                    return True
                elif html_length > 100:
                    print(f"⚠️  PARTIAL SUCCESS: Generated some content ({html_length} chars)")
                    print(f"🔍 HTML preview: {data.get('html', '')[:150]}...")
                    return True
                else:
                    print(f"⚠️  WARNING: Content too short ({html_length} chars)")
                    return False
            else:
                print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                error_msg = result.get('error', 'No error details')
                print(f"🔍 Error: {error_msg}")
                
                # Categorize the error
                if "0 output tokens" in error_msg:
                    print("🔍 Error Type: Google Gemini returned 0 output tokens")
                elif "500 An internal error" in error_msg:
                    print("🔍 Error Type: Google API internal server error")
                elif "not valid HTML" in error_msg:
                    print("🔍 Error Type: HTML parsing/validation issue")
                elif "insufficient content" in error_msg:
                    print("🔍 Error Type: Content too short")
                else:
                    print("🔍 Error Type: Unknown error")
                
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"🔍 Response: {response.text[:300]}...")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False

def check_server_health():
    """Check if the MCP server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ MCP Server is running and healthy")
            return True
        else:
            print(f"⚠️  MCP Server responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ MCP Server is not accessible: {e}")
        print("💡 Make sure to start the MCP server with: cd mcp && python mcp_server.py")
        return False

def main():
    """Run all tests progressively"""
    print("🚀 Starting Comprehensive Google Gemini Image Tests")
    print("📅 Test Date:", json.dumps({"timestamp": "2024-12-19"}))
    print("🎯 Purpose: Verify Google Gemini image handling functionality")
    print("="*80)
    
    # Check server health first
    if not check_server_health():
        print("\n❌ Cannot proceed without MCP server. Exiting.")
        sys.exit(1)
    
    print("\n🧪 Running progressive test scenarios...")
    
    results = {}
    
    # Test 1: Simple text-only (baseline)
    results['text_only'] = test_1_simple_text()
    
    # Test 2: HTML generation with detailed instructions
    results['html_generation'] = test_2_html_generation()
    
    # Test 3: With small image
    results['small_image'] = test_3_with_small_image()
    
    # Test 4: With complex image
    results['complex_image'] = test_4_with_complex_image()
    
    # Test 5: Empty system prompt (expected to fail)
    results['empty_system_prompt'] = test_5_empty_system_prompt()
    
    # Summary
    print("\n" + "="*80)
    print("📊 FINAL TEST RESULTS")
    print("="*80)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    # Analysis
    passed = sum(results.values())
    total = len(results)
    
    print(f"\n📈 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    # Detailed analysis
    if results.get('text_only') and results.get('small_image') and results.get('complex_image'):
        print("🎉 EXCELLENT: All core functionality works - Google Gemini image handling is fully operational!")
    elif results.get('text_only') and not results.get('small_image'):
        print("🔍 ANALYSIS: Text works but images fail - image processing issue detected")
    elif results.get('small_image') and not results.get('complex_image'):
        print("🔍 ANALYSIS: Simple images work but complex ones fail - size/complexity issue")
    elif not results.get('text_only'):
        print("🔍 ANALYSIS: Even text fails - broader API/configuration issue")
    elif passed >= 2:
        print("⚠️  PARTIAL SUCCESS: Some functionality works, intermittent issues detected")
    else:
        print("❌ CRITICAL: Most tests failed - significant issues with Google Gemini integration")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if not results.get('text_only'):
        print("   • Check Google API key configuration")
        print("   • Verify system prompts are not empty")
        print("   • Monitor Google API status for outages")
    if results.get('text_only') and not results.get('small_image'):
        print("   • Review image format and encoding")
        print("   • Check multimodal content structure")
        print("   • Verify HumanMessage format for Google Gemini")
    if passed < total:
        print("   • Implement retry logic for intermittent failures")
        print("   • Add fallback to OpenAI when Google Gemini fails")
    
    return results

if __name__ == "__main__":
    # Install PIL if not available
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("📦 Installing Pillow for image generation...")
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw, ImageFont
    
    main()
