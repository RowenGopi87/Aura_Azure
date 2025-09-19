#!/usr/bin/env python3
"""
Capture raw Gemini API logs by running a direct test
"""
import sys
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv("mcp/env")

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'mcp'))

from official_gemini_service import get_official_gemini_service

def test_raw_gemini_pro():
    """Test Gemini-2.5-pro directly to see raw API interactions"""
    print("🔍 DIRECT GEMINI-2.5-PRO RAW API TEST")
    print("="*60)
    
    try:
        service = get_official_gemini_service()
        print(f"✅ Service initialized")
        
        # Test the exact prompt that's failing
        prompt = """You are a helpful UI/UX designer. Generate clean, modern HTML code.

Create a simple HTML page with a modern button component"""
        
        print(f"📋 Testing with prompt: {repr(prompt)}")
        print(f"📋 Prompt length: {len(prompt)} chars")
        
        # Call the service directly to see raw logs
        success, content, metadata = service.generate_text_content(
            prompt=prompt,
            model="gemini-2.5-pro",
            disable_thinking=True
        )
        
        print(f"\n📊 FINAL RESULT:")
        print(f"   Success: {success}")
        print(f"   Content length: {len(content) if content else 0}")
        print(f"   Content preview: {repr(content[:200]) if content else 'None'}")
        print(f"   Metadata: {metadata}")
        
    except Exception as e:
        print(f"❌ Direct test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_raw_gemini_pro()
