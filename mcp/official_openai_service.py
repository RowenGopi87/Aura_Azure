#!/usr/bin/env python3
"""
Official OpenAI SDK Service Layer

This service provides a clean interface to the official OpenAI SDK
for both text-only and multimodal (image + text) generation.

Based on:
- https://platform.openai.com/docs/quickstart
- https://platform.openai.com/docs/guides/vision
"""
import os
import time
import base64
from typing import Dict, Any, Optional, Tuple, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv("env")

class OfficialOpenAIService:
    """Service class for official OpenAI SDK integration"""
    
    def __init__(self):
        """Initialize the service with API key validation"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        # Initialize the client
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.api_key)
            print(f"[OFFICIAL-OPENAI] Initialized with API key: {self.api_key[:10]}...{self.api_key[-10:]}")
        except ImportError as e:
            raise ImportError(f"Official OpenAI SDK not installed. Run: pip install openai. Error: {e}")
    
    def generate_text_content(
        self, 
        prompt: str, 
        model: str = "gpt-4o",
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate text-only content using the official SDK
        
        Args:
            prompt: The text prompt for generation
            model: The OpenAI model to use
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            print(f"[OFFICIAL-OPENAI] Text generation with model: {model}")
            print(f"[OFFICIAL-OPENAI] Prompt length: {len(prompt)} chars")
            print(f"[OFFICIAL-OPENAI] Temperature: {temperature}")
            if max_tokens:
                print(f"[OFFICIAL-OPENAI] Max tokens: {max_tokens}")
            
            start_time = time.time()
            
            # Prepare messages
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            # Generate content
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            execution_time = time.time() - start_time
            
            # Extract content and metadata
            content = response.choices[0].message.content
            content_length = len(content) if content else 0
            
            print(f"[OFFICIAL-OPENAI] Generation completed in {execution_time:.2f}s")
            print(f"[OFFICIAL-OPENAI] Generated content length: {content_length} chars")
            
            if content and content_length > 10:  # Minimum viable content
                metadata = {
                    "execution_time": execution_time,
                    "content_length": content_length,
                    "model": model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "provider": "official_openai_sdk",
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0
                    }
                }
                return True, content, metadata
            else:
                print(f"[OFFICIAL-OPENAI] Insufficient content generated: {content_length} chars")
                return False, "", {"error": "Insufficient content generated"}
                
        except Exception as e:
            print(f"[OFFICIAL-OPENAI] Text generation failed: {e}")
            return False, "", {"error": str(e)}
    
    def generate_multimodal_content(
        self,
        text_prompt: str,
        image_data: bytes,
        image_mime_type: str = "image/png",
        model: str = "gpt-4o",
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        detail: str = "auto"
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate content from text + image using the official SDK
        
        Args:
            text_prompt: The text prompt for generation
            image_data: Raw image bytes
            image_mime_type: MIME type of the image (e.g., 'image/png', 'image/jpeg')
            model: The OpenAI model to use (must support vision)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt
            detail: Image detail level ('low', 'high', 'auto')
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            print(f"[OFFICIAL-OPENAI] Multimodal generation with model: {model}")
            print(f"[OFFICIAL-OPENAI] Text prompt length: {len(text_prompt)} chars")
            print(f"[OFFICIAL-OPENAI] Image data length: {len(image_data)} bytes")
            print(f"[OFFICIAL-OPENAI] Image MIME type: {image_mime_type}")
            print(f"[OFFICIAL-OPENAI] Detail level: {detail}")
            
            start_time = time.time()
            
            # Convert image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare messages
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            # Create multimodal message content
            user_content = [
                {
                    "type": "text",
                    "text": text_prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{image_mime_type};base64,{image_base64}",
                        "detail": detail
                    }
                }
            ]
            
            messages.append({"role": "user", "content": user_content})
            
            # Generate content
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            execution_time = time.time() - start_time
            
            # Extract content and metadata
            content = response.choices[0].message.content
            content_length = len(content) if content else 0
            
            print(f"[OFFICIAL-OPENAI] Multimodal generation completed in {execution_time:.2f}s")
            print(f"[OFFICIAL-OPENAI] Generated content length: {content_length} chars")
            
            if content and content_length > 50:  # Higher threshold for multimodal
                metadata = {
                    "execution_time": execution_time,
                    "content_length": content_length,
                    "model": model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "image_size_bytes": len(image_data),
                    "image_mime_type": image_mime_type,
                    "detail_level": detail,
                    "provider": "official_openai_sdk",
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0
                    }
                }
                return True, content, metadata
            else:
                print(f"[OFFICIAL-OPENAI] Insufficient content generated: {content_length} chars")
                return False, "", {"error": "Insufficient content generated"}
                
        except Exception as e:
            print(f"[OFFICIAL-OPENAI] Multimodal generation failed: {e}")
            return False, "", {"error": str(e)}
    
    def generate_multimodal_from_base64(
        self,
        text_prompt: str,
        image_base64: str,
        image_mime_type: str = "image/png",
        model: str = "gpt-4o",
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        detail: str = "auto"
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate content from text + base64 image using the official SDK
        
        Args:
            text_prompt: The text prompt for generation
            image_base64: Base64 encoded image data
            image_mime_type: MIME type of the image
            model: The OpenAI model to use
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            system_prompt: Optional system prompt
            detail: Image detail level
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            # Decode base64 to bytes for metadata
            image_data = base64.b64decode(image_base64)
            
            print(f"[OFFICIAL-OPENAI] Multimodal generation with model: {model}")
            print(f"[OFFICIAL-OPENAI] Text prompt length: {len(text_prompt)} chars")
            print(f"[OFFICIAL-OPENAI] Image base64 length: {len(image_base64)} chars")
            print(f"[OFFICIAL-OPENAI] Image MIME type: {image_mime_type}")
            print(f"[OFFICIAL-OPENAI] Detail level: {detail}")
            
            start_time = time.time()
            
            # Prepare messages
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            # Create multimodal message content
            user_content = [
                {
                    "type": "text",
                    "text": text_prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{image_mime_type};base64,{image_base64}",
                        "detail": detail
                    }
                }
            ]
            
            messages.append({"role": "user", "content": user_content})
            
            # Generate content
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            execution_time = time.time() - start_time
            
            # Extract content and metadata
            content = response.choices[0].message.content
            content_length = len(content) if content else 0
            
            print(f"[OFFICIAL-OPENAI] Multimodal generation completed in {execution_time:.2f}s")
            print(f"[OFFICIAL-OPENAI] Generated content length: {content_length} chars")
            
            if content and content_length > 50:  # Higher threshold for multimodal
                metadata = {
                    "execution_time": execution_time,
                    "content_length": content_length,
                    "model": model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "image_size_bytes": len(image_data),
                    "image_mime_type": image_mime_type,
                    "detail_level": detail,
                    "provider": "official_openai_sdk",
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0
                    }
                }
                return True, content, metadata
            else:
                print(f"[OFFICIAL-OPENAI] Insufficient content generated: {content_length} chars")
                return False, "", {"error": "Insufficient content generated"}
                
        except Exception as e:
            print(f"[OFFICIAL-OPENAI] Multimodal generation failed: {e}")
            return False, "", {"error": str(e)}
    
    def is_available(self) -> bool:
        """Check if the service is available and working"""
        try:
            # Simple test generation
            success, content, metadata = self.generate_text_content(
                prompt="Hello",
                max_tokens=10
            )
            return success and len(content) > 0
        except Exception as e:
            print(f"[OFFICIAL-OPENAI] Availability check failed: {e}")
            return False
    
    def get_supported_models(self) -> List[str]:
        """Get list of supported OpenAI models"""
        return [
            "gpt-4o",
            "gpt-4o-mini", 
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        ]
    
    def get_vision_models(self) -> List[str]:
        """Get list of models that support vision"""
        return [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4-vision-preview"
        ]
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get service information and status"""
        return {
            "service_name": "Official OpenAI SDK",
            "api_key_configured": bool(self.api_key),
            "api_key_preview": f"{self.api_key[:10]}...{self.api_key[-10:]}" if self.api_key else None,
            "supported_models": self.get_supported_models(),
            "vision_models": self.get_vision_models(),
            "supports_text": True,
            "supports_multimodal": True,
            "supports_system_prompts": True,
            "supports_temperature_control": True,
            "supports_max_tokens": True,
            "is_available": self.is_available()
        }

# Global service instance
_official_openai_service = None

def get_official_openai_service() -> OfficialOpenAIService:
    """Get or create the global OfficialOpenAIService instance"""
    global _official_openai_service
    if _official_openai_service is None:
        _official_openai_service = OfficialOpenAIService()
    return _official_openai_service

# Convenience functions for easy integration
def generate_text_with_official_openai(
    prompt: str,
    model: str = "gpt-4o",
    max_tokens: Optional[int] = None,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None
) -> Tuple[bool, str, Dict[str, Any]]:
    """Convenience function for text generation"""
    service = get_official_openai_service()
    return service.generate_text_content(prompt, model, max_tokens, temperature, system_prompt)

def generate_multimodal_with_official_openai(
    text_prompt: str,
    image_base64: str,
    image_mime_type: str = "image/png",
    model: str = "gpt-4o",
    max_tokens: Optional[int] = None,
    temperature: float = 0.7,
    system_prompt: Optional[str] = None,
    detail: str = "auto"
) -> Tuple[bool, str, Dict[str, Any]]:
    """Convenience function for multimodal generation"""
    service = get_official_openai_service()
    return service.generate_multimodal_from_base64(
        text_prompt, image_base64, image_mime_type, model, max_tokens, temperature, system_prompt, detail
    )

if __name__ == "__main__":
    # Test the service
    print("🧪 Testing Official OpenAI Service...")
    
    try:
        service = OfficialOpenAIService()
        info = service.get_service_info()
        print(f"📊 Service Info: {info}")
        
        # Test text generation
        success, content, metadata = service.generate_text_content(
            "Create a simple HTML button",
            max_tokens=500
        )
        
        if success:
            print(f"✅ Text generation successful: {len(content)} chars")
            print(f"📄 Content preview: {content[:100]}...")
            print(f"📊 Usage: {metadata.get('usage', {})}")
        else:
            print(f"❌ Text generation failed")
            
    except Exception as e:
        print(f"❌ Service test failed: {e}")
