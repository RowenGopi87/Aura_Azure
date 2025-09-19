#!/usr/bin/env python3
"""
Test MCP server with a prompt that we know works directly
"""
import requests
import json

def test_working_prompt():
    """Test MCP server with a prompt that works directly with Gemini"""
    
    payload = {
        "systemPrompt": "",
        "userPrompt": "Create a simple HTML page",
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    print("🧪 Testing MCP server with working prompt...")
    
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
                print(f"🎉 SUCCESS: MCP server works with this prompt!")
                print(f"🔍 HTML preview: {data.get('html', '')[:200]}...")
                return True
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

if __name__ == "__main__":
    test_working_prompt()
