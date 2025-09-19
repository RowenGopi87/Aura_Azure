#!/usr/bin/env python3
"""
Focused test for Code Generation and Code Reverse Engineering features
"""
import requests
import json
import time

def test_feature(feature_name: str, endpoint: str, payload: dict, provider: str, model: str):
    """Test a specific feature"""
    print(f"\n{'='*80}")
    print(f"🧪 TESTING: {feature_name} - {provider.upper()} {model}")
    print(f"{'='*80}")
    
    try:
        print(f"📡 Sending request to MCP server...")
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
            print(f"🔍 Success: {result.get('success', 'NOT FOUND')}")
            print(f"🔍 Message: {result.get('message', 'NO MESSAGE')}")
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"📄 Data Keys: {list(data.keys())}")
                print(f"✅ SUCCESS: Feature working correctly")
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

def run_code_features_test():
    """Run focused test for code features"""
    print("🎯 CODE FEATURES TEST")
    print("Testing Code Generation and Code Reverse Engineering with official SDK integration")
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
    
    # Sample code for reverse engineering
    sample_code = """
function Button({ onClick, children, variant = 'primary', disabled = false }) {
    const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
    const variantClasses = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white'
    };
    
    return (
        <button 
            className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
"""
    
    # Define test scenarios
    test_scenarios = [
        # CODE GENERATION
        {
            "feature": "Code Generation (React) - Google",
            "endpoint": "/generate-code",
            "payload": {
                "systemPrompt": "You are an expert React developer. Generate clean, modern React code.",
                "userPrompt": "Create a React component for a modern button with hover effects",
                "codeType": "component",
                "language": "javascript",
                "framework": "react",
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        {
            "feature": "Code Generation (React) - OpenAI",
            "endpoint": "/generate-code",
            "payload": {
                "systemPrompt": "You are an expert React developer. Generate clean, modern React code.",
                "userPrompt": "Create a React component for a modern button with hover effects",
                "codeType": "component",
                "language": "javascript",
                "framework": "react",
                "llm_provider": "openai",
                "model": "gpt-4o-mini"
            }
        },
        
        # CODE REVERSE ENGINEERING
        {
            "feature": "Code Reverse Engineering - Google",
            "endpoint": "/reverse-engineer-code",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided code and extract business requirements in JSON format.",
                "userPrompt": "Analyze this code and create user stories and acceptance criteria in JSON format",
                "code": sample_code,
                "analysisLevel": "story",
                "codeLength": len(sample_code),
                "llm_provider": "google",
                "model": "gemini-2.5-flash"
            }
        },
        {
            "feature": "Code Reverse Engineering - OpenAI",
            "endpoint": "/reverse-engineer-code",
            "payload": {
                "systemPrompt": "You are an expert business analyst. Analyze the provided code and extract business requirements in JSON format.",
                "userPrompt": "Analyze this code and create user stories and acceptance criteria in JSON format",
                "code": sample_code,
                "analysisLevel": "story",
                "codeLength": len(sample_code),
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
            "success": success,
            "error": error
        })
        
        # Wait between tests
        time.sleep(3)
    
    # Summary
    print(f"\n{'='*80}")
    print("📊 CODE FEATURES TEST SUMMARY")
    print(f"{'='*80}")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    print(f"📊 Success Rate: {(len(successful)/len(results)*100):.1f}%")
    
    if successful:
        print(f"\n🎉 WORKING FEATURES:")
        for result in successful:
            print(f"   ✅ {result['feature']}")
    
    if failed:
        print(f"\n🔍 FAILED FEATURES:")
        for result in failed:
            print(f"   ❌ {result['feature']}: {result['error']}")
    
    return results

if __name__ == "__main__":
    run_code_features_test()
