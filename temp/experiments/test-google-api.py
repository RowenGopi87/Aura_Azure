#!/usr/bin/env python3
"""
Test Google API key directly
"""
import os
from dotenv import load_dotenv

# Load environment variables from the env file
load_dotenv("mcp/env")

def test_google_api_key():
    """Test if Google API key is loaded and valid"""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"🔑 Google API Key loaded: {'Yes' if api_key else 'No'}")
    
    if api_key:
        print(f"🔍 API Key preview: {api_key[:10]}...{api_key[-10:] if len(api_key) > 20 else ''}")
        
        # Test with a simple Google Generative AI call
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-pro",
                google_api_key=api_key
            )
            
            print("🤖 LLM created successfully")
            
            # Test a simple text generation
            result = llm.invoke("Say hello in exactly 5 words.")
            print(f"✅ Test successful!")
            print(f"📝 Response: {result.content if hasattr(result, 'content') else str(result)}")
            return True
            
        except Exception as e:
            print(f"❌ LLM test failed: {e}")
            return False
    else:
        print("❌ No Google API key found")
        return False

if __name__ == "__main__":
    test_google_api_key()
