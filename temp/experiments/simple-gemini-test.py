#!/usr/bin/env python3
"""
Test Google Gemini with very simple, safe prompts
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv("mcp/env")

def test_simple_prompts():
    """Test Google Gemini with very simple prompts"""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No Google API key found")
        return
    
    print(f"🔑 Using API key: {api_key[:10]}...{api_key[-10:]}")
    
    # Create LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=api_key
    )
    
    # Test different prompts
    test_prompts = [
        "Hello",
        "What is 2+2?",
        "Write the word 'hello' in HTML",
        "Create a simple HTML page",
        "Generate HTML code for a button"
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n🧪 Test {i}: '{prompt}'")
        
        try:
            result = llm.invoke(prompt)
            
            print(f"📊 Result type: {type(result)}")
            print(f"📄 Content: '{result.content}'")
            print(f"📏 Content length: {len(str(result.content))}")
            
            if hasattr(result, 'usage_metadata'):
                print(f"🔢 Input tokens: {result.usage_metadata.get('input_tokens', 'N/A')}")
                print(f"🔢 Output tokens: {result.usage_metadata.get('output_tokens', 'N/A')}")
            
            if hasattr(result, 'response_metadata'):
                print(f"🛡️  Safety ratings: {result.response_metadata.get('safety_ratings', 'N/A')}")
                print(f"🏁 Finish reason: {result.response_metadata.get('finish_reason', 'N/A')}")
            
            if result.content and len(str(result.content)) > 0:
                print(f"✅ SUCCESS: Got content!")
            else:
                print(f"❌ FAILED: Empty content")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_simple_prompts()
