#!/usr/bin/env python3
"""
Comprehensive comparison test: Direct Google Gemini API vs MCP Server Implementation

This test runs identical scenarios through both:
1. Direct Google Gemini API calls (using LangChain)
2. MCP Server implementation

The goal is to identify any differences in behavior, response quality, or reliability
between the two approaches for the same prompts and images.

Test Scenarios:
1. Simple text-only generation
2. HTML generation with detailed instructions  
3. Small image analysis
4. Complex image analysis
5. Empty system prompt (edge case)
"""
import requests
import json
import base64
import os
import sys
import time
from PIL import Image
import io
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Load environment variables
load_dotenv("mcp/env")

def create_test_image():
    """Create a simple test image for testing"""
    img = Image.new('RGB', (200, 100), color='white')
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 180, 80], fill='#007BFF', outline='#0056b3', width=2)
    try:
        draw.text((60, 45), "BUTTON", fill='white')
    except:
        pass
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    return base64.b64encode(img_data).decode('utf-8')

def create_complex_test_image():
    """Create a more complex test image"""
    img = Image.new('RGB', (400, 300), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Draw a card-like container
    draw.rectangle([20, 20, 380, 280], fill='white', outline='#dee2e6', width=2)
    draw.rectangle([20, 20, 380, 80], fill='#007BFF', outline='#0056b3', width=1)
    draw.rectangle([40, 120, 140, 160], fill='#28a745', outline='#1e7e34', width=2)
    draw.rectangle([160, 120, 260, 160], fill='#dc3545', outline='#bd2130', width=2)
    draw.rectangle([280, 120, 360, 160], fill='#ffc107', outline='#d39e00', width=2)
    draw.rectangle([40, 200, 360, 220], fill='#e9ecef', outline='#ced4da', width=1)
    draw.rectangle([40, 240, 200, 260], fill='#e9ecef', outline='#ced4da', width=1)
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    return base64.b64encode(img_data).decode('utf-8')

class TestScenario:
    """Represents a test scenario with all necessary data"""
    def __init__(self, name, system_prompt, user_prompt, image_data=None, image_type=None):
        self.name = name
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        self.image_data = image_data
        self.image_type = image_type
        self.has_image = bool(image_data)

def get_test_scenarios():
    """Define all test scenarios"""
    small_image = create_test_image()
    complex_image = create_complex_test_image()
    
    return [
        TestScenario(
            name="Simple Text-Only",
            system_prompt="You are a helpful UI/UX designer. Generate clean, modern HTML code.",
            user_prompt="Create a simple HTML page with a button"
        ),
        TestScenario(
            name="Detailed HTML Instructions",
            system_prompt="You are an expert web developer. Create complete, production-ready HTML.",
            user_prompt="Generate a complete HTML page with a modern button component"
        ),
        TestScenario(
            name="Small Image Analysis",
            system_prompt="You are a helpful UI/UX designer. Generate clean, modern HTML code.",
            user_prompt="Create an HTML button component based on the provided image. Analyze the image and recreate the button style you see.",
            image_data=small_image,
            image_type="image/png"
        ),
        TestScenario(
            name="Complex Image Analysis",
            system_prompt="You are a helpful UI/UX designer. Generate clean, modern HTML code.",
            user_prompt="Analyze the provided image and create an HTML component that replicates the design you see. Pay attention to colors, layout, and styling.",
            image_data=complex_image,
            image_type="image/png"
        ),
        TestScenario(
            name="Empty System Prompt",
            system_prompt="",
            user_prompt="Create a simple HTML page"
        )
    ]

def test_direct_gemini(scenario):
    """Test scenario directly through Google Gemini API"""
    print(f"🔗 DIRECT API: {scenario.name}")
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "success": False,
            "error": "No Google API key found",
            "content_length": 0,
            "output_tokens": 0,
            "execution_time": 0
        }
    
    try:
        # Create LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-pro",
            google_api_key=api_key
        )
        
        # Prepare prompt
        full_prompt = f"""
{scenario.system_prompt}

{scenario.user_prompt}
"""
        
        start_time = time.time()
        
        if scenario.has_image:
            # Use multimodal format
            message_content = [
                {
                    "type": "text",
                    "text": full_prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{scenario.image_type};base64,{scenario.image_data}"
                    }
                }
            ]
            
            human_message = HumanMessage(content=message_content)
            result = llm.invoke([human_message])
        else:
            # Text-only
            result = llm.invoke(full_prompt)
        
        execution_time = time.time() - start_time
        
        # Extract results
        content = result.content if hasattr(result, 'content') else str(result)
        content_length = len(str(content))
        output_tokens = result.usage_metadata.get('output_tokens', 0) if hasattr(result, 'usage_metadata') else 0
        
        success = content_length > 100 and output_tokens > 0
        
        return {
            "success": success,
            "content_length": content_length,
            "output_tokens": output_tokens,
            "execution_time": execution_time,
            "content_preview": str(content)[:200] + "..." if len(str(content)) > 200 else str(content),
            "error": None if success else f"Short content ({content_length} chars) or 0 tokens ({output_tokens})"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "content_length": 0,
            "output_tokens": 0,
            "execution_time": time.time() - start_time if 'start_time' in locals() else 0
        }

def test_mcp_server(scenario):
    """Test scenario through MCP server"""
    print(f"🏠 MCP SERVER: {scenario.name}")
    
    payload = {
        "systemPrompt": scenario.system_prompt,
        "userPrompt": scenario.user_prompt,
        "framework": "react",
        "llm_provider": "google",
        "model": "gemini-2.5-pro"
    }
    
    if scenario.has_image:
        payload["imageData"] = scenario.image_data
        payload["imageType"] = scenario.image_type
    
    try:
        start_time = time.time()
        
        response = requests.post(
            "http://localhost:8000/generate-design-code",
            json=payload,
            timeout=60
        )
        
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            success = result.get('success', False)
            
            if success:
                data = result.get('data', {})
                html_length = len(data.get('html', ''))
                
                return {
                    "success": True,
                    "content_length": html_length,
                    "output_tokens": "N/A (processed by MCP)",
                    "execution_time": execution_time,
                    "content_preview": data.get('html', '')[:200] + "..." if len(data.get('html', '')) > 200 else data.get('html', ''),
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "error": result.get('error', 'Unknown MCP error'),
                    "content_length": 0,
                    "output_tokens": 0,
                    "execution_time": execution_time
                }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text[:200]}",
                "content_length": 0,
                "output_tokens": 0,
                "execution_time": execution_time
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "content_length": 0,
            "output_tokens": 0,
            "execution_time": time.time() - start_time if 'start_time' in locals() else 0
        }

def check_mcp_server():
    """Check if MCP server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def run_comparison_test():
    """Run the complete comparison test"""
    print("🚀 GOOGLE GEMINI: DIRECT API vs MCP SERVER COMPARISON")
    print("=" * 80)
    print("📅 Test Date:", json.dumps({"timestamp": "2024-12-19"}))
    print("🎯 Purpose: Compare Direct API calls vs MCP Server implementation")
    print("=" * 80)
    
    # Check prerequisites
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ Google API key not found. Please check mcp/env file.")
        return
    
    if not check_mcp_server():
        print("❌ MCP Server not accessible. Please start with: cd mcp && python mcp_server.py")
        return
    
    print("✅ Prerequisites checked - API key loaded, MCP server running")
    
    # Get test scenarios
    scenarios = get_test_scenarios()
    print(f"📋 Running {len(scenarios)} test scenarios...")
    
    results = {}
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{'='*60}")
        print(f"🧪 TEST {i}/5: {scenario.name}")
        print(f"📝 System: '{scenario.system_prompt[:50]}{'...' if len(scenario.system_prompt) > 50 else ''}'")
        print(f"📝 User: '{scenario.user_prompt[:50]}{'...' if len(scenario.user_prompt) > 50 else ''}'")
        print(f"🖼️  Has Image: {scenario.has_image}")
        if scenario.has_image:
            print(f"📊 Image Size: {len(scenario.image_data)} chars")
        print(f"{'='*60}")
        
        # Test both approaches
        direct_result = test_direct_gemini(scenario)
        mcp_result = test_mcp_server(scenario)
        
        # Store results
        results[scenario.name] = {
            "direct": direct_result,
            "mcp": mcp_result
        }
        
        # Print comparison
        print(f"\n📊 RESULTS COMPARISON:")
        print(f"{'Metric':<25} {'Direct API':<20} {'MCP Server':<20} {'Match':<10}")
        print("-" * 75)
        
        direct_success = "✅ PASS" if direct_result["success"] else "❌ FAIL"
        mcp_success = "✅ PASS" if mcp_result["success"] else "❌ FAIL"
        success_match = "✅" if direct_result["success"] == mcp_result["success"] else "❌"
        
        print(f"{'Success':<25} {direct_success:<20} {mcp_success:<20} {success_match:<10}")
        print(f"{'Content Length':<25} {direct_result['content_length']:<20} {mcp_result['content_length']:<20} {'✅' if abs(direct_result['content_length'] - mcp_result['content_length']) < 500 else '❌':<10}")
        print(f"{'Execution Time':<25} {direct_result['execution_time']:.2f}s{'':<12} {mcp_result['execution_time']:.2f}s{'':<12} {'✅' if abs(direct_result['execution_time'] - mcp_result['execution_time']) < 10 else '❌':<10}")
        
        if not direct_result["success"]:
            print(f"🔍 Direct Error: {direct_result.get('error', 'Unknown')}")
        if not mcp_result["success"]:
            print(f"🔍 MCP Error: {mcp_result.get('error', 'Unknown')}")
    
    # Final summary
    print(f"\n{'='*80}")
    print("📊 FINAL COMPARISON SUMMARY")
    print(f"{'='*80}")
    
    direct_successes = sum(1 for r in results.values() if r["direct"]["success"])
    mcp_successes = sum(1 for r in results.values() if r["mcp"]["success"])
    total_tests = len(results)
    
    print(f"📈 Success Rates:")
    print(f"   Direct API: {direct_successes}/{total_tests} ({direct_successes/total_tests*100:.1f}%)")
    print(f"   MCP Server: {mcp_successes}/{total_tests} ({mcp_successes/total_tests*100:.1f}%)")
    
    # Detailed analysis
    print(f"\n🔍 DETAILED ANALYSIS:")
    
    both_success = sum(1 for r in results.values() if r["direct"]["success"] and r["mcp"]["success"])
    both_fail = sum(1 for r in results.values() if not r["direct"]["success"] and not r["mcp"]["success"])
    direct_only = sum(1 for r in results.values() if r["direct"]["success"] and not r["mcp"]["success"])
    mcp_only = sum(1 for r in results.values() if not r["direct"]["success"] and r["mcp"]["success"])
    
    print(f"   Both Successful: {both_success}/{total_tests}")
    print(f"   Both Failed: {both_fail}/{total_tests}")
    print(f"   Direct Only: {direct_only}/{total_tests}")
    print(f"   MCP Only: {mcp_only}/{total_tests}")
    
    # Conclusions
    print(f"\n💡 CONCLUSIONS:")
    if both_success == total_tests:
        print("   🎉 PERFECT: Both approaches work identically!")
    elif both_success > total_tests // 2:
        print("   ✅ GOOD: Both approaches work well for most scenarios")
    elif direct_successes > mcp_successes:
        print("   ⚠️  Direct API performs better than MCP Server")
    elif mcp_successes > direct_successes:
        print("   ⚠️  MCP Server performs better than Direct API")
    else:
        print("   ❌ Both approaches have significant issues")
    
    if direct_only > 0:
        print(f"   🔍 {direct_only} scenarios work only with Direct API - investigate MCP implementation")
    if mcp_only > 0:
        print(f"   🔍 {mcp_only} scenarios work only with MCP Server - investigate Direct API calls")
    
    return results

if __name__ == "__main__":
    # Install PIL if not available
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow for image generation...")
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    run_comparison_test()
