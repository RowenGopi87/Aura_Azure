#!/usr/bin/env python3
"""
Compare the exact prompts being sent to Google Gemini
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv("mcp/env")

def test_direct_vs_mcp_format():
    """Compare direct call vs MCP server format"""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No Google API key found")
        return
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=api_key
    )
    
    # Test 1: Direct prompt that works
    print("🧪 TEST 1: Direct prompt that works")
    direct_prompt = "Generate HTML code for a button"
    print(f"📝 Prompt: '{direct_prompt}'")
    
    try:
        result = llm.invoke(direct_prompt)
        print(f"✅ Success! Output tokens: {result.usage_metadata.get('output_tokens', 0)}")
        print(f"📄 Content length: {len(result.content)}")
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n" + "-"*50)
    
    # Test 2: MCP server format
    print("🧪 TEST 2: MCP server format")
    system_prompt = "You are a helpful UI/UX designer."
    user_prompt = "Generate HTML code for a button"
    
    mcp_prompt = f"""
{system_prompt}

{user_prompt}
"""
    
    print(f"📝 System: '{system_prompt}'")
    print(f"📝 User: '{user_prompt}'")
    print(f"📝 Combined: '{mcp_prompt}'")
    print(f"📏 Combined length: {len(mcp_prompt)} chars")
    
    try:
        result = llm.invoke(mcp_prompt)
        print(f"✅ Success! Output tokens: {result.usage_metadata.get('output_tokens', 0)}")
        print(f"📄 Content length: {len(result.content)}")
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    print("\n" + "-"*50)
    
    # Test 3: Empty system prompt (like in our tests)
    print("🧪 TEST 3: Empty system prompt")
    empty_system = ""
    user_prompt = "Create a simple HTML page"
    
    empty_prompt = f"""
{empty_system}

{user_prompt}
"""
    
    print(f"📝 System: '{empty_system}'")
    print(f"📝 User: '{user_prompt}'")
    print(f"📝 Combined: '{empty_prompt}'")
    print(f"📏 Combined length: {len(empty_prompt)} chars")
    
    try:
        result = llm.invoke(empty_prompt)
        print(f"✅ Success! Output tokens: {result.usage_metadata.get('output_tokens', 0)}")
        print(f"📄 Content length: {len(result.content)}")
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_direct_vs_mcp_format()
