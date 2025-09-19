#!/usr/bin/env python3
"""
Direct test of Google Gemini with the same format as MCP server
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment variables
load_dotenv("mcp/env")

def test_direct_gemini():
    """Test Google Gemini directly with the same format as MCP server"""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No Google API key found")
        return
    
    print(f"🔑 Using API key: {api_key[:10]}...{api_key[-10:]}")
    
    # Create LLM exactly like MCP server
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=api_key
    )
    
    # Create the same prompt as MCP server
    system_prompt = """You are a helpful UI/UX designer. Generate clean, modern HTML code."""
    user_prompt = """Create a simple hello world HTML page with a button."""
    
    full_prompt = f"""
{system_prompt}

{user_prompt}
"""
    
    print("🤖 Testing direct LLM call...")
    print(f"📝 Prompt length: {len(full_prompt)} chars")
    
    try:
        # Test text-only first
        result = llm.invoke(full_prompt)
        
        print(f"✅ LLM call successful!")
        print(f"📊 Result type: {type(result)}")
        
        # Extract content like MCP server does
        result_content = None
        
        if hasattr(result, 'content') and result.content is not None and len(str(result.content)) > 0:
            result_content = str(result.content)
            print(f"📄 Using result.content: {len(result_content)} chars")
        else:
            result_content = str(result)
            print(f"📄 Using str(result): {len(result_content)} chars")
        
        print(f"🔍 Content preview: {result_content[:300]}...")
        print(f"📏 Full content length: {len(result_content)}")
        
        # Check if it contains HTML
        if '<!DOCTYPE html>' in result_content or '<html' in result_content:
            print("✅ Contains HTML structure!")
        else:
            print("⚠️  No HTML structure found")
            
        # Print full content for analysis
        print("\n" + "="*50)
        print("FULL CONTENT:")
        print(result_content)
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"❌ LLM call failed: {e}")
        return False

if __name__ == "__main__":
    test_direct_gemini()
