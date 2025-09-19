#!/usr/bin/env python3
"""
Test script to verify Google Gemini image handling fix
"""
import requests
import json
import base64
import os

def test_gemini_image_generation():
    """Test Google Gemini with image data"""
    
    # Create a simple test image (1x1 pixel PNG)
    # This is a minimal valid PNG image in base64
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=="
    
    # Test payload
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple button component based on the provided image.",
        "framework": "react",
        "imageData": test_image_base64,
        "imageType": "image/png",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print("🧪 Testing Google Gemini with image data...")
    print(f"📊 Image data length: {len(test_image_base64)} chars")
    print(f"🤖 Provider: {payload['llm_provider']}")
    print(f"📱 Model: {payload['model']}")
    
    try:
        # Make request to MCP Bridge server
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result.get('success', False)}")
            
            if result.get('success'):
                data = result.get('data', {})
                html_length = len(data.get('html', ''))
                print(f"📄 Generated HTML length: {html_length} chars")
                
                if html_length > 200:
                    print("🎉 SUCCESS: Google Gemini generated meaningful content with image!")
                    return True
                else:
                    print(f"⚠️  WARNING: Generated content too short ({html_length} chars)")
                    print(f"🔍 HTML preview: {data.get('html', '')[:200]}...")
                    return False
            else:
                print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                print(f"🔍 Error: {result.get('error', 'No error details')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"🔍 Response: {response.text[:500]}...")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False

def test_gemini_text_only():
    """Test Google Gemini with text only (should work)"""
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple button component with modern styling.",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print("\n🧪 Testing Google Gemini with text-only...")
    print(f"🤖 Provider: {payload['llm_provider']}")
    print(f"📱 Model: {payload['model']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result.get('success', False)}")
            
            if result.get('success'):
                data = result.get('data', {})
                html_length = len(data.get('html', ''))
                print(f"📄 Generated HTML length: {html_length} chars")
                
                if html_length > 200:
                    print("🎉 SUCCESS: Google Gemini text-only generation works!")
                    return True
                else:
                    print(f"⚠️  WARNING: Generated content too short ({html_length} chars)")
                    return False
            else:
                print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Google Gemini Image Handling Tests")
    print("=" * 50)
    
    # Test text-only first (baseline)
    text_success = test_gemini_text_only()
    
    # Test with image
    image_success = test_gemini_image_generation()
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS:")
    print(f"📝 Text-only: {'✅ PASS' if text_success else '❌ FAIL'}")
    print(f"🖼️  With image: {'✅ PASS' if image_success else '❌ FAIL'}")
    
    if text_success and image_success:
        print("🎉 ALL TESTS PASSED! Google Gemini image handling is fixed!")
    elif text_success and not image_success:
        print("⚠️  Image handling still has issues, but text-only works")
    else:
        print("❌ Both tests failed - there may be a broader issue")
