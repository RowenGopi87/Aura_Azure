#!/usr/bin/env python3
"""
Debug test for Google Gemini to see what's actually being returned
"""
import requests
import json

def debug_gemini_response():
    """Debug what Google Gemini is actually returning"""
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple hello world HTML page with a button.",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print("🔍 Debugging Google Gemini response...")
    
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
            print(f"📝 Message: {result.get('message', 'No message')}")
            print(f"🔍 Error: {result.get('error', 'No error')}")
            
            if result.get('data'):
                data = result.get('data', {})
                print(f"📄 HTML length: {len(data.get('html', ''))}")
                print(f"🎨 CSS length: {len(data.get('css', ''))}")
                print(f"⚡ JS length: {len(data.get('javascript', ''))}")
                print(f"🔍 HTML content preview: {data.get('html', '')[:200]}...")
            else:
                print("❌ No data in response")
                
            # Print full response for debugging
            print("\n" + "="*50)
            print("FULL RESPONSE:")
            print(json.dumps(result, indent=2)[:1000] + "..." if len(json.dumps(result, indent=2)) > 1000 else json.dumps(result, indent=2))
            
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"🔍 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    debug_gemini_response()
