#!/usr/bin/env python3
"""
Single Gemini-2.5-pro test to capture raw logs
"""
import requests
import json

def test_single_gemini_pro():
    """Test a single failing scenario to see raw logs"""
    print("🔍 TESTING SINGLE GEMINI-2.5-PRO SCENARIO")
    print("="*60)
    
    # Test the simplest failing case: text-only design generation
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple HTML page with a modern button component",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print(f"📋 Request: {json.dumps(payload, indent=2)}")
    print(f"📡 Sending to MCP server...")
    
    try:
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"📄 Response: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ HTTP Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_single_gemini_pro()
