#!/usr/bin/env python3
"""
Comprehensive test for ALL features with official SDK integration
Testing: Design Generation, Design Reverse Engineering, Code Generation, Code Reverse Engineering, Ideas & Work Items
"""
import requests
import json
import base64
import io
import time
from PIL import Image

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

def test_feature(feature_name: str, endpoint: str, payload: dict, provider: str, model: str):
    """Test a specific feature"""
    print(f"\n{'='*80}")
    print(f"🧪 TESTING: {feature_name} - {provider.upper()} {model}")
    print(f"{'='*80}")
    
    print(f"📋 Request Details:")
    print(f"   Feature: {feature_name}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Provider: {provider}")
    print(f"   Model: {model}")
    print(f"   Payload keys: {list(payload.keys())}")
    
    try:
        print(f"\n📡 Sending request to MCP server...")
        start_time = time.time()
        
        response = requests.post(
            f"http://localhost:8000{endpoint}",
            json=payload,
            timeout=120
        )
        
        execution_time = time.time() - start_time
        print(f"⏱️  Request completed in {execution_time:.2f}s")
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ JSON Response received")
            print(f"🔍 Response Keys: {list(result.keys())}")
            print(f"🔍 Success: {result.get('success', 'NOT FOUND')}")
            print(f"🔍 Message: {result.get('message', 'NO MESSAGE')}")
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"📄 Data Keys: {list(data.keys())}")
                
                # Feature-specific validation
                if 'html' in data:
                    html = data.get('html', '')
                    print(f"📏 HTML Length: {len(html)} chars")
                    if html and (html.startswith('<!DOCTYPE html>') or html.startswith('<html')):
                        print(f"✅ SUCCESS: Valid HTML generated")
                        return True, "Valid HTML generated"
                elif 'code' in data:
                    code = data.get('code', '')
                    print(f"📏 Code Length: {len(code)} chars")
                    print(f"📄 Code Preview: {code[:100]}...")
                    if code:
                        print(f"✅ SUCCESS: Code generated")
                        return True, "Code generated"
                elif 'analysis' in data or 'stories' in data or 'requirements' in data:
                    print(f"✅ SUCCESS: Analysis/Requirements generated")
                    return True, "Analysis generated"
                elif 'ideas' in data or 'workItems' in data:
                    print(f"✅ SUCCESS: Ideas/Work items generated")
                    return True, "Ideas generated"
                else:
                    print(f"✅ SUCCESS: Content generated successfully")
                    return True, "Success"
                
            else:
                error = result.get('error', result.get('message', 'Unknown error'))
                print(f"❌ FAILED: {error}")
                return False, error
                
        else:
            error_text = response.text[:500] if response.text else "No response text"
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response: {error_text}")
            return False, f"HTTP {response.status_code}"
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False, str(e)

def run_comprehensive_all_features_test():
    """Run comprehensive test for all features"""
    print("🎯 COMPREHENSIVE ALL FEATURES TEST")
    print("Testing ALL features with official SDK integration")
    print("="*80)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ MCP Server not accessible")
            return
    except:
        print("❌ MCP Server not running. Please start with: cd mcp && python mcp_server.py")
        return
    
    print("✅ MCP Server is running")
    
    # Test image for multimodal tests
    test_image = create_test_image()
    
    # Define all test scenarios
    test_scenarios = [
        # 1. DESIGN GENERATION (already tested, but including for completeness)
        {
            "feature": "Design Generation (Text)",
            "endpoint": "/generate-design-code",
            "payload": {
                "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
                "userPrompt": "Create a simple HTML page with a modern button component",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        {
            "feature": "Design Generation (Image)",
            "endpoint": "/generate-design-code",
            "payload": {
                "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
                "userPrompt": "Create HTML code for a button that matches this image style",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-flash",
                "imageData": test_image,
                "imageType": "image/png"
            }
        },
        
        # 2. DESIGN REVERSE ENGINEERING
        {
            "feature": "Design Reverse Engineering (Text)",
            "endpoint": "/reverse-engineer-design",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided design and extract business requirements in JSON format.",
                "userPrompt": "Analyze this design and create user stories and acceptance criteria",
                "analysisLevel": "story",
                "hasImage": False,
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        {
            "feature": "Design Reverse Engineering (Image)",
            "endpoint": "/reverse-engineer-design",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided design and extract business requirements in JSON format.",
                "userPrompt": "Analyze this design and create user stories and acceptance criteria",
                "analysisLevel": "story",
                "hasImage": True,
                "imageData": test_image,
                "imageType": "image/png",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        
        # 3. CODE GENERATION
        {
            "feature": "Code Generation (React)",
            "endpoint": "/generate-code",
            "payload": {
                "systemPrompt": "You are an expert React developer. Generate clean, modern React code.",
                "userPrompt": "Create a React component for a modern button with hover effects",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        {
            "feature": "Code Generation (Vue)",
            "endpoint": "/generate-code",
            "payload": {
                "systemPrompt": "You are an expert Vue.js developer. Generate clean, modern Vue code.",
                "userPrompt": "Create a Vue component for a modern button with hover effects",
                "framework": "vue",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        
        # 4. CODE REVERSE ENGINEERING
        {
            "feature": "Code Reverse Engineering",
            "endpoint": "/reverse-engineer-code",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided code and extract business requirements.",
                "userPrompt": "Analyze this code and create user stories and acceptance criteria",
                "code": "function Button({ onClick, children }) { return <button className='btn-primary' onClick={onClick}>{children}</button>; }",
                "analysisLevel": "story",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        
        # 5. IDEAS GENERATION
        {
            "feature": "Ideas Generation",
            "endpoint": "/generate-ideas",
            "payload": {
                "systemPrompt": "You are a creative product manager. Generate innovative ideas.",
                "userPrompt": "Generate ideas for improving user experience in a web application",
                "ideaType": "feature",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        
        # 6. WORK ITEMS GENERATION
        {
            "feature": "Work Items Generation",
            "endpoint": "/generate-work-items",
            "payload": {
                "systemPrompt": "You are an expert project manager. Generate detailed work items.",
                "userPrompt": "Create work items for implementing a user authentication system",
                "workItemType": "task",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        
        # Test with OpenAI as well for key features
        {
            "feature": "Design Generation (OpenAI)",
            "endpoint": "/generate-design-code",
            "payload": {
                "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
                "userPrompt": "Create a simple HTML page with a modern button component",
                "framework": "react",
                "llm_provider": "openai",
                "model": "gpt-4o-mini"
            }
        },
        {
            "feature": "Code Generation (OpenAI)",
            "endpoint": "/generate-code",
            "payload": {
                "systemPrompt": "You are an expert React developer. Generate clean, modern React code.",
                "userPrompt": "Create a React component for a modern button with hover effects",
                "framework": "react",
                "llm_provider": "openai",
                "model": "gpt-4o-mini"
            }
        }
    ]
    
    results = []
    
    for scenario in test_scenarios:
        success, error = test_feature(
            scenario["feature"],
            scenario["endpoint"],
            scenario["payload"],
            scenario["payload"]["llm_provider"],
            scenario["payload"]["model"]
        )
        results.append({
            "feature": scenario["feature"],
            "endpoint": scenario["endpoint"],
            "provider": scenario["payload"]["llm_provider"],
            "model": scenario["payload"]["model"],
            "success": success,
            "error": error
        })
        
        # Wait between tests to avoid rate limiting
        time.sleep(3)
    
    # Summary Analysis
    print(f"\n{'='*80}")
    print("📊 COMPREHENSIVE ALL FEATURES TEST SUMMARY")
    print(f"{'='*80}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    print(f"📊 Success Rate: {(len(successful)/len(results)*100):.1f}%")
    
    if successful:
        print(f"\n🎉 WORKING FEATURES:")
        for result in successful:
            print(f"   ✅ {result['feature']} ({result['provider']} {result['model']})")
    
    if failed:
        print(f"\n🔍 FAILED FEATURES:")
        for result in failed:
            print(f"   ❌ {result['feature']} ({result['provider']} {result['model']}): {result['error']}")
    
    # Feature Category Analysis
    print(f"\n🔍 FEATURE CATEGORY ANALYSIS:")
    
    categories = {
        "Design Generation": [r for r in results if "Design Generation" in r["feature"]],
        "Design Reverse Engineering": [r for r in results if "Design Reverse Engineering" in r["feature"]],
        "Code Generation": [r for r in results if "Code Generation" in r["feature"]],
        "Code Reverse Engineering": [r for r in results if "Code Reverse Engineering" in r["feature"]],
        "Ideas Generation": [r for r in results if "Ideas Generation" in r["feature"]],
        "Work Items Generation": [r for r in results if "Work Items Generation" in r["feature"]]
    }
    
    for category, category_results in categories.items():
        if category_results:
            success_count = len([r for r in category_results if r["success"]])
            total_count = len(category_results)
            success_rate = (success_count / total_count) * 100
            print(f"   {category}: {success_count}/{total_count} ({success_rate:.1f}%)")
    
    # Provider Analysis
    print(f"\n🔍 PROVIDER ANALYSIS:")
    
    google_results = [r for r in results if r["provider"] == "google"]
    openai_results = [r for r in results if r["provider"] == "openai"]
    
    if google_results:
        google_success = len([r for r in google_results if r["success"]])
        print(f"   Google Gemini: {google_success}/{len(google_results)} ({(google_success/len(google_results)*100):.1f}%)")
    
    if openai_results:
        openai_success = len([r for r in openai_results if r["success"]])
        print(f"   OpenAI GPT: {openai_success}/{len(openai_results)} ({(openai_success/len(openai_results)*100):.1f}%)")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    
    if len(failed) == 0:
        print("🎉 ALL FEATURES WORKING PERFECTLY!")
        print("   - Official SDK integration is complete and successful")
        print("   - All features are ready for production use")
    elif len(failed) < len(results) * 0.2:  # Less than 20% failure
        print("✅ EXCELLENT: Most features working well")
        print("   - Focus on fixing the few remaining issues")
        print("   - Consider the working features ready for production")
    elif len(failed) < len(results) * 0.5:  # Less than 50% failure
        print("⚠️  GOOD: Majority of features working")
        print("   - Some features need attention")
        print("   - Prioritize fixing the most critical features")
    else:
        print("🔧 NEEDS WORK: Many features need attention")
        print("   - Focus on systematic fixes")
        print("   - Consider rolling back to previous stable version")
    
    return results

if __name__ == "__main__":
    # Install PIL if needed
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow...")
        import os
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    run_comprehensive_all_features_test()
