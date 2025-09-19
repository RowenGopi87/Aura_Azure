#!/usr/bin/env python3
"""
Test Google Gemini by bypassing the MCP server validation
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv("mcp/env")

def test_gemini_with_mcp_format():
    """Test Google Gemini with the exact same format as MCP server"""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No Google API key found")
        return
    
    # Create LLM exactly like MCP server
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=api_key
    )
    
    # Create the exact same prompt as MCP server
    system_prompt = "You are a helpful UI/UX designer."
    user_prompt = "Generate HTML code for a button"
    
    full_prompt = f"""
{system_prompt}

{user_prompt}
"""
    
    print("🤖 Testing with MCP server format...")
    print(f"📝 Full prompt: '{full_prompt}'")
    print(f"📏 Prompt length: {len(full_prompt)} chars")
    
    try:
        result = llm.invoke(full_prompt)
        
        print(f"✅ LLM call successful!")
        print(f"📊 Result type: {type(result)}")
        
        # Extract content exactly like MCP server
        result_content = None
        
        if hasattr(result, 'content') and result.content is not None and len(str(result.content)) > 0:
            result_content = str(result.content)
            print(f"📄 Using result.content: {len(result_content)} chars")
        else:
            result_content = str(result)
            print(f"📄 Using str(result): {len(result_content)} chars")
        
        print(f"📏 Content length: {len(result_content)}")
        
        if hasattr(result, 'usage_metadata'):
            print(f"🔢 Input tokens: {result.usage_metadata.get('input_tokens', 'N/A')}")
            print(f"🔢 Output tokens: {result.usage_metadata.get('output_tokens', 'N/A')}")
        
        # Check if it contains HTML
        has_html_structure = ('<!DOCTYPE html>' in result_content or '<html' in result_content)
        print(f"🏗️  Has HTML structure: {has_html_structure}")
        
        # Print full content for analysis
        print("\n" + "="*60)
        print("FULL CONTENT:")
        print(result_content)
        print("="*60)
        
        # Analyze the content
        if result.usage_metadata.get('output_tokens', 0) == 0:
            print("❌ ISSUE: 0 output tokens - Gemini not generating content")
        elif len(result_content) < 100:
            print("⚠️  ISSUE: Very short content")
        elif not has_html_structure:
            print("⚠️  ISSUE: Content generated but no HTML structure")
        else:
            print("✅ SUCCESS: Valid HTML content generated!")
        
        return True
        
    except Exception as e:
        print(f"❌ LLM call failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini_with_mcp_format()
