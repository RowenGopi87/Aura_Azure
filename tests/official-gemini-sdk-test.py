#!/usr/bin/env python3
"""
Test using the official Google GenAI SDK as documented at:
https://ai.google.dev/gemini-api/docs/quickstart?authuser=1
https://ai.google.dev/gemini-api/docs/image-understanding?authuser=1

This test uses the official google-genai package instead of LangChain
"""
import os
import time
import base64
import io
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv("mcp/env")

def install_official_sdk():
    """Install the official Google GenAI SDK"""
    try:
        from google import genai
        print("✅ Official Google GenAI SDK already installed")
        return True
    except ImportError:
        print("📦 Installing official Google GenAI SDK...")
        os.system("pip install -q -U google-genai")
        try:
            from google import genai
            print("✅ Official Google GenAI SDK installed successfully")
            return True
        except ImportError:
            print("❌ Failed to install Google GenAI SDK")
            return False

def create_test_image():
    """Create a simple test image"""
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

def test_official_sdk_text_only():
    """Test text-only generation using official SDK"""
    print("\n" + "="*60)
    print("🧪 OFFICIAL SDK: Text-Only Generation")
    print("="*60)
    
    try:
        from google import genai
        
        # Initialize client - API key from environment variable GEMINI_API_KEY
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("❌ No GOOGLE_API_KEY found")
            return False
        
        # Set environment variable for the SDK
        os.environ['GEMINI_API_KEY'] = api_key
        
        # The client gets the API key from the environment variable `GEMINI_API_KEY`
        client = genai.Client()
        
        print(f"🔑 Using API key: {api_key[:10]}...{api_key[-10:]}")
        
        # Test different prompts
        test_prompts = [
            "Hello",
            "What is 2+2?", 
            "Create a simple HTML page",
            "Generate HTML code for a button",
            "You are a helpful UI/UX designer. Create a simple HTML page with a button."
        ]
        
        results = []
        
        for i, prompt in enumerate(test_prompts, 1):
            print(f"\n🧪 Test {i}: '{prompt}'")
            
            try:
                start_time = time.time()
                
                # Using the official SDK method from documentation
                response = client.models.generate_content(
                    model="gemini-2.5-flash", 
                    contents=prompt
                )
                
                execution_time = time.time() - start_time
                
                print(f"⏱️  Time: {execution_time:.2f}s")
                print(f"📄 Response text: '{response.text}'")
                print(f"📏 Content length: {len(response.text)}")
                
                if response.text and len(response.text) > 0:
                    print(f"✅ SUCCESS: Got content!")
                    results.append(True)
                else:
                    print(f"❌ FAILED: Empty content")
                    results.append(False)
                    
            except Exception as e:
                print(f"❌ Exception: {e}")
                results.append(False)
                
            # Wait between requests
            time.sleep(1)
        
        success_rate = sum(results) / len(results) * 100
        print(f"\n📊 Text-Only Success Rate: {sum(results)}/{len(results)} ({success_rate:.1f}%)")
        return success_rate > 50
        
    except Exception as e:
        print(f"❌ Failed to test official SDK: {e}")
        return False

def test_official_sdk_with_image():
    """Test image understanding using official SDK"""
    print("\n" + "="*60)
    print("🧪 OFFICIAL SDK: Image Understanding")
    print("="*60)
    
    try:
        from google import genai
        
        # Initialize client
        client = genai.Client()
        
        # Create test image
        image_data = create_test_image()
        print(f"📊 Image data length: {len(image_data)} chars")
        
        # Convert base64 to bytes for the official SDK
        image_bytes = base64.b64decode(image_data)
        
        print("🧪 Testing image understanding...")
        
        try:
            start_time = time.time()
            
            # Using the official SDK method for image understanding
            # Based on the documentation at https://ai.google.dev/gemini-api/docs/image-understanding
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    "Analyze this image and create HTML code for a button that matches the style you see.",
                    {"mime_type": "image/png", "data": image_bytes}
                ]
            )
            
            execution_time = time.time() - start_time
            
            print(f"⏱️  Time: {execution_time:.2f}s")
            print(f"📄 Response text length: {len(response.text)}")
            print(f"📄 Response preview: {response.text[:200]}...")
            
            if response.text and len(response.text) > 100:
                print(f"✅ SUCCESS: Generated substantial content!")
                return True
            else:
                print(f"❌ FAILED: Insufficient content")
                return False
                
        except Exception as e:
            print(f"❌ Image test exception: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to test image understanding: {e}")
        return False

def test_official_sdk_with_thinking_disabled():
    """Test with thinking disabled as shown in documentation"""
    print("\n" + "="*60)
    print("🧪 OFFICIAL SDK: With Thinking Disabled")
    print("="*60)
    
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client()
        
        print("🧪 Testing with thinking disabled...")
        
        try:
            start_time = time.time()
            
            # Using the thinking config from documentation
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents="Create a simple HTML page with a button",
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)  # Disables thinking
                ),
            )
            
            execution_time = time.time() - start_time
            
            print(f"⏱️  Time: {execution_time:.2f}s")
            print(f"📄 Response text length: {len(response.text)}")
            print(f"📄 Response preview: {response.text[:200]}...")
            
            if response.text and len(response.text) > 100:
                print(f"✅ SUCCESS: Generated content with thinking disabled!")
                return True
            else:
                print(f"❌ FAILED: Insufficient content")
                return False
                
        except Exception as e:
            print(f"❌ Thinking disabled test exception: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to test thinking disabled: {e}")
        return False

def run_official_sdk_tests():
    """Run all official SDK tests"""
    print("🚀 TESTING OFFICIAL GOOGLE GENAI SDK")
    print("📚 Based on: https://ai.google.dev/gemini-api/docs/quickstart")
    print("📚 And: https://ai.google.dev/gemini-api/docs/image-understanding")
    print("="*80)
    
    # Install SDK if needed
    if not install_official_sdk():
        return
    
    # Check API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ No GOOGLE_API_KEY found in environment")
        return
    
    print(f"✅ API key loaded: {api_key[:10]}...{api_key[-10:]}")
    
    # Run tests
    results = {}
    
    # Test 1: Text-only generation
    results['text_only'] = test_official_sdk_text_only()
    
    # Test 2: Image understanding
    results['image_understanding'] = test_official_sdk_with_image()
    
    # Test 3: Thinking disabled
    results['thinking_disabled'] = test_official_sdk_with_thinking_disabled()
    
    # Summary
    print("\n" + "="*80)
    print("📊 OFFICIAL SDK TEST RESULTS")
    print("="*80)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    passed = sum(results.values())
    total = len(results)
    success_rate = passed / total * 100
    
    print(f"\n📈 Overall Success Rate: {passed}/{total} ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print("🎉 EXCELLENT: Official SDK works great!")
    elif success_rate >= 50:
        print("✅ GOOD: Official SDK works reasonably well")
    elif success_rate > 0:
        print("⚠️  PARTIAL: Some functionality works with official SDK")
    else:
        print("❌ CRITICAL: Official SDK not working")
    
    return results

if __name__ == "__main__":
    # Install PIL if needed
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("📦 Installing Pillow...")
        os.system("pip install Pillow")
        from PIL import Image, ImageDraw
    
    run_official_sdk_tests()
