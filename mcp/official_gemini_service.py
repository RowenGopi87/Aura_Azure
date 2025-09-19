#!/usr/bin/env python3
"""
Official Google GenAI SDK Service Layer

This service provides a clean interface to the official Google GenAI SDK
for both text-only and multimodal (image + text) generation.

Based on:
- https://ai.google.dev/gemini-api/docs/quickstart
- https://ai.google.dev/gemini-api/docs/image-understanding
"""
import os
import time
import base64
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv("env")

class OfficialGeminiService:
    """Service class for official Google GenAI SDK integration"""
    
    def __init__(self):
        """Initialize the service with API key validation"""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Set environment variable for the SDK
        os.environ['GEMINI_API_KEY'] = self.api_key
        
        # Initialize the client
        try:
            from google import genai
            from google.genai import types
            self.genai = genai
            self.types = types
            self.client = genai.Client()
            print(f"[OFFICIAL-GEMINI] Initialized with API key: {self.api_key[:10]}...{self.api_key[-10:]}")
        except ImportError as e:
            raise ImportError(f"Official Google GenAI SDK not installed. Run: pip install google-genai. Error: {e}")
    
    def generate_text_content(
        self, 
        prompt: str, 
        model: str = "gemini-2.5-flash",
        disable_thinking: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate text-only content using the official SDK
        
        Args:
            prompt: The text prompt for generation
            model: The Gemini model to use
            disable_thinking: Whether to disable thinking mode for faster responses
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            print(f"[OFFICIAL-GEMINI] Text generation with model: {model}")
            print(f"[OFFICIAL-GEMINI] Prompt length: {len(prompt)} chars")
            print(f"[OFFICIAL-GEMINI] Thinking disabled: {disable_thinking}")
            
            # RAW REQUEST LOGGING
            print(f"[RAW-REQUEST] ===========================================")
            print(f"[RAW-REQUEST] Model: {model}")
            print(f"[RAW-REQUEST] Prompt length: {len(prompt)} chars")
            print(f"[RAW-REQUEST] Prompt repr: {repr(prompt)}")
            print(f"[RAW-REQUEST] Full prompt content:")
            print(f"[RAW-REQUEST] {'-'*50}")
            print(prompt)
            print(f"[RAW-REQUEST] {'-'*50}")
            
            start_time = time.time()
            
            # Prepare generation config
            config = None
            if disable_thinking:
                if model == "gemini-2.5-flash":
                    # For flash model, we can safely disable thinking
                    config = self.types.GenerateContentConfig(
                        thinking_config=self.types.ThinkingConfig(thinking_budget=0)
                    )
                    print(f"[RAW-REQUEST] Using thinking config for flash: {config}")
                elif model == "gemini-2.5-pro":
                    # For pro model, disabling thinking causes empty responses
                    # So we'll allow thinking but try to extract just the final answer
                    print(f"[RAW-REQUEST] gemini-2.5-pro: Allowing thinking to prevent empty responses")
                else:
                    print(f"[RAW-REQUEST] Unknown model {model}, no special config")
            else:
                print(f"[RAW-REQUEST] No special config")
            
            print(f"[RAW-REQUEST] API Key: {self.api_key[:10]}...{self.api_key[-10:]}")
            print(f"[RAW-REQUEST] Client: {self.client}")
            print(f"[RAW-REQUEST] Calling generate_content...")
            
            # Generate content
            if config:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config
                )
            else:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt
                )
            
            execution_time = time.time() - start_time
            
            # RAW RESPONSE LOGGING
            print(f"[RAW-RESPONSE] ==========================================")
            print(f"[RAW-RESPONSE] Response type: {type(response)}")
            print(f"[RAW-RESPONSE] Response object: {response}")
            print(f"[RAW-RESPONSE] Response dir: {dir(response)}")
            
            if hasattr(response, 'candidates'):
                print(f"[RAW-RESPONSE] Candidates: {response.candidates}")
                if response.candidates:
                    for i, candidate in enumerate(response.candidates):
                        print(f"[RAW-RESPONSE] Candidate {i}: {candidate}")
                        print(f"[RAW-RESPONSE] Candidate {i} dir: {dir(candidate)}")
                        if hasattr(candidate, 'content'):
                            print(f"[RAW-RESPONSE] Candidate {i} content: {candidate.content}")
                        if hasattr(candidate, 'finish_reason'):
                            print(f"[RAW-RESPONSE] Candidate {i} finish_reason: {candidate.finish_reason}")
                        if hasattr(candidate, 'safety_ratings'):
                            print(f"[RAW-RESPONSE] Candidate {i} safety_ratings: {candidate.safety_ratings}")
            
            if hasattr(response, 'text'):
                print(f"[RAW-RESPONSE] Response.text: {repr(response.text)}")
            
            if hasattr(response, 'parts'):
                print(f"[RAW-RESPONSE] Response.parts: {response.parts}")
            
            if hasattr(response, 'usage_metadata'):
                print(f"[RAW-RESPONSE] Usage metadata: {response.usage_metadata}")
            
            if hasattr(response, 'prompt_feedback'):
                print(f"[RAW-RESPONSE] Prompt feedback: {response.prompt_feedback}")
            
            print(f"[RAW-RESPONSE] ==========================================")
            
            # Extract content and metadata with proper None handling
            content = None
            
            # Try multiple ways to extract content from the response
            if hasattr(response, 'text') and response.text is not None:
                content = response.text
                print(f"[OFFICIAL-GEMINI] Extracted content from response.text")
            elif hasattr(response, 'candidates') and response.candidates:
                # Try to extract from candidates
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    if hasattr(candidate.content, 'parts') and candidate.content.parts:
                        # Extract from parts
                        parts_text = []
                        for part in candidate.content.parts:
                            if hasattr(part, 'text') and part.text:
                                parts_text.append(part.text)
                        if parts_text:
                            content = ''.join(parts_text)
                            print(f"[OFFICIAL-GEMINI] Extracted content from candidate.content.parts")
                    elif hasattr(candidate.content, 'text') and candidate.content.text:
                        content = candidate.content.text
                        print(f"[OFFICIAL-GEMINI] Extracted content from candidate.content.text")
            
            # If still no content, this might be an empty response (thinking mode issue)
            if not content:
                print(f"[OFFICIAL-GEMINI] Warning: No content found in response")
                print(f"[OFFICIAL-GEMINI] Response structure debug:")
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    print(f"[OFFICIAL-GEMINI] Candidate content: {candidate.content}")
                    if hasattr(candidate.content, 'parts'):
                        print(f"[OFFICIAL-GEMINI] Candidate parts: {candidate.content.parts}")
                content = ""
            
            # Handle None content gracefully
            if content is None:
                content = ""
                print(f"[OFFICIAL-GEMINI] Warning: Response content is None")
            
            content_length = len(str(content))
            
            print(f"[OFFICIAL-GEMINI] Generation completed in {execution_time:.2f}s")
            print(f"[OFFICIAL-GEMINI] Generated content length: {content_length} chars")
            print(f"[OFFICIAL-GEMINI] Content preview: {str(content)[:100]}...")
            
            if content and content_length > 5:  # Relaxed minimum viable content
                metadata = {
                    "execution_time": execution_time,
                    "content_length": content_length,
                    "model": model,
                    "thinking_disabled": disable_thinking,
                    "provider": "official_google_genai_sdk"
                }
                return True, content, metadata
            else:
                print(f"[OFFICIAL-GEMINI] Insufficient content generated: {content_length} chars")
                return False, "", {"error": "Insufficient content generated"}
                
        except Exception as e:
            error_str = str(e)
            print(f"[OFFICIAL-GEMINI] Text generation failed: {e}")
            
            # Check if this is a 500 error or content generation issue from gemini-2.5-pro and auto-fallback
            if model == "gemini-2.5-pro" and ("500 INTERNAL" in error_str or "Insufficient content" in error_str):
                print(f"[OFFICIAL-GEMINI] Content generation issue detected for gemini-2.5-pro, attempting fallback to gemini-2.5-flash")
                try:
                    return self.generate_text_content(
                        prompt=prompt,
                        model="gemini-2.5-flash",
                        disable_thinking=disable_thinking
                    )
                except Exception as fallback_error:
                    print(f"[OFFICIAL-GEMINI] Fallback also failed: {fallback_error}")
                    return False, "", {"error": f"Primary model failed: {error_str}, Fallback failed: {str(fallback_error)}"}
            
            # Check if this is a content generation issue from gemini-2.5-flash and try gemini-2.5-pro
            elif model == "gemini-2.5-flash" and "Insufficient content" in error_str:
                print(f"[OFFICIAL-GEMINI] Content generation issue detected for gemini-2.5-flash, attempting fallback to gemini-2.5-pro")
                try:
                    return self.generate_text_content(
                        prompt=prompt,
                        model="gemini-2.5-pro",
                        disable_thinking=disable_thinking
                    )
                except Exception as fallback_error:
                    print(f"[OFFICIAL-GEMINI] Fallback also failed: {fallback_error}")
                    return False, "", {"error": f"Primary model failed: {error_str}, Fallback failed: {str(fallback_error)}"}
            
            return False, "", {"error": str(e)}
    
    def generate_multimodal_content(
        self,
        text_prompt: str,
        image_data: bytes,
        image_mime_type: str = "image/png",
        model: str = "gemini-2.5-flash",
        disable_thinking: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate content from text + image using the official SDK
        
        Args:
            text_prompt: The text prompt for generation
            image_data: Raw image bytes
            image_mime_type: MIME type of the image (e.g., 'image/png', 'image/jpeg')
            model: The Gemini model to use
            disable_thinking: Whether to disable thinking mode for faster responses
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            print(f"[OFFICIAL-GEMINI] Multimodal generation with model: {model}")
            print(f"[OFFICIAL-GEMINI] Text prompt length: {len(text_prompt)} chars")
            print(f"[OFFICIAL-GEMINI] Image data length: {len(image_data)} bytes")
            print(f"[OFFICIAL-GEMINI] Image MIME type: {image_mime_type}")
            print(f"[OFFICIAL-GEMINI] Thinking disabled: {disable_thinking}")
            
            # RAW REQUEST LOGGING
            print(f"[RAW-MULTIMODAL-REQUEST] ===============================")
            print(f"[RAW-MULTIMODAL-REQUEST] Model: {model}")
            print(f"[RAW-MULTIMODAL-REQUEST] Text prompt: {repr(text_prompt)}")
            print(f"[RAW-MULTIMODAL-REQUEST] Text prompt content:")
            print(f"[RAW-MULTIMODAL-REQUEST] {'-'*30}")
            print(text_prompt)
            print(f"[RAW-MULTIMODAL-REQUEST] {'-'*30}")
            print(f"[RAW-MULTIMODAL-REQUEST] Image data length: {len(image_data)} bytes")
            print(f"[RAW-MULTIMODAL-REQUEST] Image MIME type: {image_mime_type}")
            print(f"[RAW-MULTIMODAL-REQUEST] Image data preview: {image_data[:50]}...")
            
            start_time = time.time()
            
            # Prepare generation config
            config = None
            if disable_thinking:
                if model == "gemini-2.5-flash":
                    # For flash model, we can safely disable thinking
                    config = self.types.GenerateContentConfig(
                        thinking_config=self.types.ThinkingConfig(thinking_budget=0)
                    )
                    print(f"[RAW-MULTIMODAL-REQUEST] Using thinking config for flash: {config}")
                elif model == "gemini-2.5-pro":
                    # For pro model, disabling thinking causes empty responses
                    # So we'll allow thinking but try to extract just the final answer
                    print(f"[RAW-MULTIMODAL-REQUEST] gemini-2.5-pro: Allowing thinking to prevent empty responses")
                else:
                    print(f"[RAW-MULTIMODAL-REQUEST] Unknown model {model}, no special config")
            else:
                print(f"[RAW-MULTIMODAL-REQUEST] No special config")
            
            # Create multimodal content using the correct format
            image_part = self.types.Part.from_bytes(
                data=image_data,
                mime_type=image_mime_type,
            )
            print(f"[RAW-MULTIMODAL-REQUEST] Image part created: {image_part}")
            
            contents = [image_part, text_prompt]
            print(f"[RAW-MULTIMODAL-REQUEST] Contents: {contents}")
            print(f"[RAW-MULTIMODAL-REQUEST] Contents length: {len(contents)}")
            
            print(f"[RAW-MULTIMODAL-REQUEST] API Key: {self.api_key[:10]}...{self.api_key[-10:]}")
            print(f"[RAW-MULTIMODAL-REQUEST] Client: {self.client}")
            print(f"[RAW-MULTIMODAL-REQUEST] Calling generate_content...")
            
            # Generate content
            if config:
                response = self.client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            else:
                response = self.client.models.generate_content(
                    model=model,
                    contents=contents
                )
            
            execution_time = time.time() - start_time
            
            # RAW RESPONSE LOGGING
            print(f"[RAW-MULTIMODAL-RESPONSE] ==============================")
            print(f"[RAW-MULTIMODAL-RESPONSE] Response type: {type(response)}")
            print(f"[RAW-MULTIMODAL-RESPONSE] Response object: {response}")
            print(f"[RAW-MULTIMODAL-RESPONSE] Response dir: {dir(response)}")
            
            if hasattr(response, 'candidates'):
                print(f"[RAW-MULTIMODAL-RESPONSE] Candidates: {response.candidates}")
                if response.candidates:
                    for i, candidate in enumerate(response.candidates):
                        print(f"[RAW-MULTIMODAL-RESPONSE] Candidate {i}: {candidate}")
                        print(f"[RAW-MULTIMODAL-RESPONSE] Candidate {i} dir: {dir(candidate)}")
                        if hasattr(candidate, 'content'):
                            print(f"[RAW-MULTIMODAL-RESPONSE] Candidate {i} content: {candidate.content}")
                        if hasattr(candidate, 'finish_reason'):
                            print(f"[RAW-MULTIMODAL-RESPONSE] Candidate {i} finish_reason: {candidate.finish_reason}")
                        if hasattr(candidate, 'safety_ratings'):
                            print(f"[RAW-MULTIMODAL-RESPONSE] Candidate {i} safety_ratings: {candidate.safety_ratings}")
            
            if hasattr(response, 'text'):
                print(f"[RAW-MULTIMODAL-RESPONSE] Response.text: {repr(response.text)}")
            
            if hasattr(response, 'parts'):
                print(f"[RAW-MULTIMODAL-RESPONSE] Response.parts: {response.parts}")
            
            if hasattr(response, 'usage_metadata'):
                print(f"[RAW-MULTIMODAL-RESPONSE] Usage metadata: {response.usage_metadata}")
            
            if hasattr(response, 'prompt_feedback'):
                print(f"[RAW-MULTIMODAL-RESPONSE] Prompt feedback: {response.prompt_feedback}")
            
            print(f"[RAW-MULTIMODAL-RESPONSE] ==============================")
            
            # Extract content and metadata with proper None handling
            content = None
            
            # Try multiple ways to extract content from the response
            if hasattr(response, 'text') and response.text is not None:
                content = response.text
                print(f"[OFFICIAL-GEMINI] Extracted multimodal content from response.text")
            elif hasattr(response, 'candidates') and response.candidates:
                # Try to extract from candidates
                candidate = response.candidates[0]
                if hasattr(candidate, 'content') and candidate.content:
                    if hasattr(candidate.content, 'parts') and candidate.content.parts:
                        # Extract from parts
                        parts_text = []
                        for part in candidate.content.parts:
                            if hasattr(part, 'text') and part.text:
                                parts_text.append(part.text)
                        if parts_text:
                            content = ''.join(parts_text)
                            print(f"[OFFICIAL-GEMINI] Extracted multimodal content from candidate.content.parts")
                    elif hasattr(candidate.content, 'text') and candidate.content.text:
                        content = candidate.content.text
                        print(f"[OFFICIAL-GEMINI] Extracted multimodal content from candidate.content.text")
            
            # If still no content, this might be an empty response
            if not content:
                print(f"[OFFICIAL-GEMINI] Warning: No multimodal content found in response")
                print(f"[OFFICIAL-GEMINI] Multimodal response structure debug:")
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    print(f"[OFFICIAL-GEMINI] Candidate content: {candidate.content}")
                    if hasattr(candidate.content, 'parts'):
                        print(f"[OFFICIAL-GEMINI] Candidate parts: {candidate.content.parts}")
                content = ""
            
            # Handle None content gracefully
            if content is None:
                content = ""
                print(f"[OFFICIAL-GEMINI] Warning: Multimodal response content is None")
            
            content_length = len(str(content))
            
            print(f"[OFFICIAL-GEMINI] Multimodal generation completed in {execution_time:.2f}s")
            print(f"[OFFICIAL-GEMINI] Generated content length: {content_length} chars")
            print(f"[OFFICIAL-GEMINI] Content preview: {str(content)[:100]}...")
            
            if content and content_length > 5:  # Relaxed threshold for multimodal
                metadata = {
                    "execution_time": execution_time,
                    "content_length": content_length,
                    "model": model,
                    "thinking_disabled": disable_thinking,
                    "image_size_bytes": len(image_data),
                    "image_mime_type": image_mime_type,
                    "provider": "official_google_genai_sdk"
                }
                return True, content, metadata
            else:
                print(f"[OFFICIAL-GEMINI] Insufficient content generated: {content_length} chars")
                return False, "", {"error": "Insufficient content generated"}
                
        except Exception as e:
            error_str = str(e)
            print(f"[OFFICIAL-GEMINI] Multimodal generation failed: {e}")
            
            # Check if this is a 500 error or content generation issue from gemini-2.5-pro and auto-fallback
            if model == "gemini-2.5-pro" and ("500 INTERNAL" in error_str or "Insufficient content" in error_str):
                print(f"[OFFICIAL-GEMINI] Content generation issue detected for gemini-2.5-pro multimodal, attempting fallback to gemini-2.5-flash")
                try:
                    return self.generate_multimodal_content(
                        text_prompt=text_prompt,
                        image_data=image_data,
                        image_mime_type=image_mime_type,
                        model="gemini-2.5-flash",
                        disable_thinking=disable_thinking
                    )
                except Exception as fallback_error:
                    print(f"[OFFICIAL-GEMINI] Multimodal fallback also failed: {fallback_error}")
                    return False, "", {"error": f"Primary model failed: {error_str}, Fallback failed: {str(fallback_error)}"}
            
            # Check if this is a content generation issue from gemini-2.5-flash and try gemini-2.5-pro
            elif model == "gemini-2.5-flash" and "Insufficient content" in error_str:
                print(f"[OFFICIAL-GEMINI] Content generation issue detected for gemini-2.5-flash multimodal, attempting fallback to gemini-2.5-pro")
                try:
                    return self.generate_multimodal_content(
                        text_prompt=text_prompt,
                        image_data=image_data,
                        image_mime_type=image_mime_type,
                        model="gemini-2.5-pro",
                        disable_thinking=disable_thinking
                    )
                except Exception as fallback_error:
                    print(f"[OFFICIAL-GEMINI] Multimodal fallback also failed: {fallback_error}")
                    return False, "", {"error": f"Primary model failed: {error_str}, Fallback failed: {str(fallback_error)}"}
            
            return False, "", {"error": str(e)}
    
    def generate_multimodal_from_base64(
        self,
        text_prompt: str,
        image_base64: str,
        image_mime_type: str = "image/png",
        model: str = "gemini-2.5-flash",
        disable_thinking: bool = False
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Generate content from text + base64 image using the official SDK
        
        Args:
            text_prompt: The text prompt for generation
            image_base64: Base64 encoded image data
            image_mime_type: MIME type of the image
            model: The Gemini model to use
            disable_thinking: Whether to disable thinking mode
            
        Returns:
            Tuple of (success, content, metadata)
        """
        try:
            # Decode base64 to bytes
            image_data = base64.b64decode(image_base64)
            return self.generate_multimodal_content(
                text_prompt=text_prompt,
                image_data=image_data,
                image_mime_type=image_mime_type,
                model=model,
                disable_thinking=disable_thinking
            )
        except Exception as e:
            print(f"[OFFICIAL-GEMINI] Base64 decode failed: {e}")
            return False, "", {"error": f"Base64 decode failed: {e}"}
    
    def is_available(self) -> bool:
        """Check if the service is available and working"""
        try:
            # Simple test generation
            success, content, metadata = self.generate_text_content(
                prompt="Hello",
                disable_thinking=True
            )
            return success and len(content) > 0
        except Exception as e:
            print(f"[OFFICIAL-GEMINI] Availability check failed: {e}")
            return False
    
    def get_supported_models(self) -> list:
        """Get list of supported Gemini models"""
        return [
            "gemini-2.5-flash",
            "gemini-2.5-pro", 
            "gemini-1.5-flash",
            "gemini-1.5-pro"
        ]
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get service information and status"""
        return {
            "service_name": "Official Google GenAI SDK",
            "api_key_configured": bool(self.api_key),
            "api_key_preview": f"{self.api_key[:10]}...{self.api_key[-10:]}" if self.api_key else None,
            "supported_models": self.get_supported_models(),
            "supports_text": True,
            "supports_multimodal": True,
            "supports_thinking_control": True,
            "is_available": self.is_available()
        }

# Global service instance
_official_gemini_service = None

def get_official_gemini_service() -> OfficialGeminiService:
    """Get or create the global OfficialGeminiService instance"""
    global _official_gemini_service
    if _official_gemini_service is None:
        _official_gemini_service = OfficialGeminiService()
    return _official_gemini_service

# Convenience functions for easy integration
def generate_text_with_official_gemini(
    prompt: str,
    model: str = "gemini-2.5-flash",
    disable_thinking: bool = False
) -> Tuple[bool, str, Dict[str, Any]]:
    """Convenience function for text generation"""
    service = get_official_gemini_service()
    return service.generate_text_content(prompt, model, disable_thinking)

def generate_multimodal_with_official_gemini(
    text_prompt: str,
    image_base64: str,
    image_mime_type: str = "image/png",
    model: str = "gemini-2.5-flash",
    disable_thinking: bool = False
) -> Tuple[bool, str, Dict[str, Any]]:
    """Convenience function for multimodal generation"""
    service = get_official_gemini_service()
    return service.generate_multimodal_from_base64(
        text_prompt, image_base64, image_mime_type, model, disable_thinking
    )

if __name__ == "__main__":
    # Test the service
    print("🧪 Testing Official Gemini Service...")
    
    try:
        service = OfficialGeminiService()
        info = service.get_service_info()
        print(f"📊 Service Info: {info}")
        
        # Test text generation
        success, content, metadata = service.generate_text_content(
            "Create a simple HTML button",
            disable_thinking=True
        )
        
        if success:
            print(f"✅ Text generation successful: {len(content)} chars")
            print(f"📄 Content preview: {content[:100]}...")
        else:
            print(f"❌ Text generation failed")
            
    except Exception as e:
        print(f"❌ Service test failed: {e}")
