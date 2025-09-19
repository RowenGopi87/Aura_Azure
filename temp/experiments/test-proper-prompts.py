#!/usr/bin/env python3
"""
Test with proper prompts that match what works directly with Gemini
"""
import requests
import json

def test_with_proper_prompts():
    """Test with prompts that we know work with Gemini"""
    
    test_cases = [
        {
            "name": "Working Direct Prompt",
            "systemPrompt": "",
            "userPrompt": "Create a simple HTML page"
        },
        {
            "name": "Proper System + User Prompt",
            "systemPrompt": "You are a helpful UI/UX designer.",
            "userPrompt": "Generate HTML code for a button"
        },
        {
            "name": "No System Prompt",
            "systemPrompt": "",
            "userPrompt": "Generate HTML code for a button"
        },
        {
            "name": "Minimal Prompt",
            "systemPrompt": "",
            "userPrompt": "Hello"
        }
    ]
    
    results = {}
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        print(f"📝 System: '{test_case['systemPrompt']}'")
        print(f"📝 User: '{test_case['userPrompt']}'")
        
        payload = {
            "systemPrompt": test_case["systemPrompt"],
            "userPrompt": test_case["userPrompt"],
            "framework": "react",
            "llm_provider": "google",
            "model": "gemini-2.5-pro"
        }
        
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
                    print(f"📄 Generated HTML length: {html_length} chars")
                    print(f"🎉 SUCCESS!")
                    results[test_case['name']] = True
                else:
                    print(f"❌ FAILED: {result.get('message', 'Unknown error')}")
                    print(f"🔍 Error: {result.get('error', 'No error details')}")
                    results[test_case['name']] = False
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                results[test_case['name']] = False
                
        except Exception as e:
            print(f"❌ Exception occurred: {e}")
            results[test_case['name']] = False
    
    # Summary
    print("\n" + "="*50)
    print("📊 RESULTS SUMMARY")
    print("="*50)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    return results

if __name__ == "__main__":
    test_with_proper_prompts()
