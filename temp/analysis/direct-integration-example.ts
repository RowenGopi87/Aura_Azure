// Example: Direct integration in Next.js API route
// src/app/api/generate-design-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  llm_provider: 'openai' | 'google';
  model: string;
  imageData?: string;
  imageType?: string;
  framework: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    let content: string;
    
    if (body.llm_provider === 'openai') {
      // Direct OpenAI integration
      const messages: any[] = [
        { role: 'system', content: body.systemPrompt },
      ];
      
      if (body.imageData) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: body.userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${body.imageType};base64,${body.imageData}`,
                detail: 'high'
              }
            }
          ]
        });
      } else {
        messages.push({ role: 'user', content: body.userPrompt });
      }
      
      const response = await openai.chat.completions.create({
        model: body.model,
        messages,
        max_tokens: 4000,
        temperature: 0.7,
      });
      
      content = response.choices[0]?.message?.content || '';
      
    } else {
      // Direct Google Gemini integration
      const model = genAI.getGenerativeModel({ model: body.model });
      
      if (body.imageData) {
        const imageBuffer = Buffer.from(body.imageData, 'base64');
        const imagePart = {
          inlineData: {
            data: body.imageData,
            mimeType: body.imageType || 'image/png'
          }
        };
        
        const result = await model.generateContent([
          `${body.systemPrompt}\n\n${body.userPrompt}`,
          imagePart
        ]);
        
        content = result.response.text();
      } else {
        const result = await model.generateContent(
          `${body.systemPrompt}\n\n${body.userPrompt}`
        );
        
        content = result.response.text();
      }
    }
    
    // Parse HTML from response (simplified version)
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const html = htmlMatch ? htmlMatch[1] : '';
    
    if (!html) {
      throw new Error('No HTML found in response');
    }
    
    // Extract CSS from HTML
    const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const css = cssMatch ? cssMatch[1] : '';
    
    return NextResponse.json({
      success: true,
      data: {
        html,
        css,
        javascript: '',
        framework: body.framework,
        generatedAt: new Date().toISOString()
      },
      message: 'Code generated successfully'
    });
    
  } catch (error) {
    console.error('Generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
