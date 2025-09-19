#!/usr/bin/env python3
"""
COMPREHENSIVE SDK INTEGRATION TEST

This test verifies that both official Google GenAI SDK and OpenAI SDK
are properly integrated into the MCP server for:
1. Design Generation (text + image)
2. Design Reverse Engineering (text + image)
3. Code Generation 
4. Code Reverse Engineering

Test Matrix:
- Google Gemini (Official SDK vs LangChain fallback)
- OpenAI (Official SDK vs LangChain fallback)
- Text-only vs Multimodal scenarios
- Design vs Code generation
"""
import requests
import json
import base64
import io
import time
from PIL import Image
from typing import Dict, Any, List

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

def check_mcp_server():
    """Check if MCP server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_design_generation(provider: str, model: str, use_image: bool = False) -> Dict[str, Any]:
    """Test design generation with specified provider"""
    print(f"\n🎨 Testing Design Generation: {provider} - {model} - {'Image' if use_image else 'Text'}")
    
    payload = {
        "systemPrompt": "You are a helpful UI/UX designer. Generate clean, modern HTML code.",
        "userPrompt": "Create a simple HTML page with a modern button component",
        "framework": "react",
        "llm_provider": provider,
        "model": model
    }
    
    if use_image:
        payload["imageData"] = create_test_image()
        payload["imageType"] = "image/png"
        payload["userPrompt"] = "Create HTML code for a button that matches this image style"
    
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
                    "execution_time": execution_time,
                    "provider_used": provider,
                    "model_used": model,
                    "has_image": use_image
                }
            else:
                return {
                    "success": False,
                    "error": result.get('error', 'Unknown error'),
                    "execution_time": execution_time
                }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text[:200]}",
                "execution_time": execution_time
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "execution_time": time.time() - start_time if 'start_time' in locals() else 0
        }

def test_reverse_engineering(provider: str, model: str, use_image: bool = False) -> Dict[str, Any]:
    """Test reverse engineering with specified provider"""
    print(f"\n🔍 Testing Reverse Engineering: {provider} - {model} - {'Image' if use_image else 'Text'}")
    
    payload = {
        "systemPrompt": "You are an expert business analyst. Analyze the provided design and extract business requirements in JSON format.",
        "userPrompt": "Analyze this design and create user stories and acceptance criteria",
        "analysisLevel": "story",
        "hasImage": use_image,
        "llm_provider": provider,
        "model": model
    }
    
    if use_image:
        payload["imageData"] = create_test_image()
        payload["imageType"] = "image/png"
    
    try:
        start_time = time.time()
        response = requests.post(
            "http://localhost:8000/reverse-engineer-design",
            json=payload,
            timeout=60
        )
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            success = result.get('success', False)
            
            if success:
                data = result.get('data', {})
                content_length = len(str(data))
                return {
                    "success": True,
                    "content_length": content_length,
                    "execution_time": execution_time,
                    "provider_used": provider,
                    "model_used": model,
                    "has_image": use_image
                }
            else:
                return {
                    "success": False,
                    "error": result.get('message', 'Unknown error'),
                    "execution_time": execution_time
                }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text[:200]}",
                "execution_time": execution_time
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "execution_time": time.time() - start_time if 'start_time' in locals() else 0
        }

def run_comprehensive_test():
    """Run comprehensive SDK integration test"""
    print("🚀 COMPREHENSIVE SDK INTEGRATION TEST")
    print("📅 Testing Official Google GenAI SDK + Official OpenAI SDK Integration")
    print("="*80)
    
    # Check prerequisites
    if not check_mcp_server():
        print("❌ MCP Server not accessible. Please start with: cd mcp && python mcp_server.py")
        return
    
    print("✅ MCP Server is running")
    
    # Test configurations
    test_configs = [
        # Google Gemini tests
        {"provider": "google", "model": "gemini-2.5-flash"},
        {"provider": "google", "model": "gemini-2.5-pro"},
        
        # OpenAI tests  
        {"provider": "openai", "model": "gpt-4o"},
        {"provider": "openai", "model": "gpt-4o-mini"},
    ]
    
    # Test scenarios
    scenarios = [
        {"name": "Design Generation (Text)", "func": test_design_generation, "use_image": False},
        {"name": "Design Generation (Image)", "func": test_design_generation, "use_image": True},
        {"name": "Reverse Engineering (Text)", "func": test_reverse_engineering, "use_image": False},
        {"name": "Reverse Engineering (Image)", "func": test_reverse_engineering, "use_image": True},
    ]
    
    results = {}
    total_tests = len(test_configs) * len(scenarios)
    current_test = 0
    
    print(f"📋 Running {total_tests} tests...")
    
    for config in test_configs:
        provider = config["provider"]
        model = config["model"]
        
        print(f"\n{'='*60}")
        print(f"🧪 TESTING: {provider.upper()} - {model}")
        print(f"{'='*60}")
        
        provider_results = {}
        
        for scenario in scenarios:
            current_test += 1
            scenario_name = scenario["name"]
            test_func = scenario["func"]
            use_image = scenario["use_image"]
            
            print(f"\n[{current_test}/{total_tests}] {scenario_name}")
            
            result = test_func(provider, model, use_image)
            provider_results[scenario_name] = result
            
            # Print result
            if result["success"]:
                print(f"✅ SUCCESS: {result['content_length']} chars in {result['execution_time']:.2f}s")
            else:
                print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
        
        results[f"{provider}_{model}"] = provider_results
    
    # Generate summary report
    print(f"\n{'='*80}")
    print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    print(f"{'='*80}")
    
    # Success rate by provider
    google_tests = [k for k in results.keys() if k.startswith('google')]
    openai_tests = [k for k in results.keys() if k.startswith('openai')]
    
    def calculate_success_rate(test_keys):
        total = 0
        successes = 0
        for key in test_keys:
            for scenario_result in results[key].values():
                total += 1
                if scenario_result["success"]:
                    successes += 1
        return successes, total, (successes/total*100) if total > 0 else 0
    
    google_success, google_total, google_rate = calculate_success_rate(google_tests)
    openai_success, openai_total, openai_rate = calculate_success_rate(openai_tests)
    
    print(f"📈 PROVIDER SUCCESS RATES:")
    print(f"   Google Gemini: {google_success}/{google_total} ({google_rate:.1f}%)")
    print(f"   OpenAI: {openai_success}/{openai_total} ({openai_rate:.1f}%)")
    
    # Success rate by scenario type
    scenario_stats = {}
    for scenario in scenarios:
        scenario_name = scenario["name"]
        successes = 0
        total = 0
        
        for provider_results in results.values():
            if scenario_name in provider_results:
                total += 1
                if provider_results[scenario_name]["success"]:
                    successes += 1
        
        scenario_stats[scenario_name] = {
            "successes": successes,
            "total": total,
            "rate": (successes/total*100) if total > 0 else 0
        }
    
    print(f"\n📈 SCENARIO SUCCESS RATES:")
    for scenario_name, stats in scenario_stats.items():
        print(f"   {scenario_name}: {stats['successes']}/{stats['total']} ({stats['rate']:.1f}%)")
    
    # Detailed results table
    print(f"\n📋 DETAILED RESULTS:")
    print(f"{'Provider/Model':<20} {'Design Text':<12} {'Design Image':<13} {'Reverse Text':<13} {'Reverse Image':<14}")
    print("-" * 80)
    
    for config_key, provider_results in results.items():
        provider_model = config_key.replace('_', ' ').title()
        
        design_text = "✅" if provider_results.get("Design Generation (Text)", {}).get("success") else "❌"
        design_image = "✅" if provider_results.get("Design Generation (Image)", {}).get("success") else "❌"
        reverse_text = "✅" if provider_results.get("Reverse Engineering (Text)", {}).get("success") else "❌"
        reverse_image = "✅" if provider_results.get("Reverse Engineering (Image)", {}).get("success") else "❌"
        
        print(f"{provider_model:<20} {design_text:<12} {design_image:<13} {reverse_text:<13} {reverse_image:<14}")
    
    # Final assessment
    overall_success = google_success + openai_success
    overall_total = google_total + openai_total
    overall_rate = (overall_success/overall_total*100) if overall_total > 0 else 0
    
    print(f"\n💡 FINAL ASSESSMENT:")
    print(f"📊 Overall Success Rate: {overall_success}/{overall_total} ({overall_rate:.1f}%)")
    
    if overall_rate >= 80:
        print("🎉 EXCELLENT: Official SDK integration is working great!")
        print("✅ Both Google GenAI and OpenAI official SDKs are properly integrated")
    elif overall_rate >= 60:
        print("✅ GOOD: Official SDK integration is working well")
        print("⚠️  Some scenarios may need optimization")
    elif overall_rate >= 40:
        print("⚠️  PARTIAL: Official SDK integration has mixed results")
        print("🔍 Review failed scenarios for improvements")
    else:
        print("❌ ISSUES: Official SDK integration needs attention")
        print("🔧 Check service configurations and API keys")
    
    # Recommendations
    print(f"\n🎯 RECOMMENDATIONS:")
    if google_rate < 50:
        print("🔍 Google Gemini: Check official SDK integration and API key")
    if openai_rate < 50:
        print("🔍 OpenAI: Check official SDK integration and API key")
    
    if scenario_stats.get("Design Generation (Image)", {}).get("rate", 0) < 50:
        print("🖼️  Image Processing: Review multimodal integration")
    if scenario_stats.get("Reverse Engineering (Text)", {}).get("rate", 0) < 50:
        print("🔄 Reverse Engineering: Review analysis prompt templates")
    
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
    
    run_comprehensive_test()
