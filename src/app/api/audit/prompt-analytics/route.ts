import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const promptAnalytics = await request.json();
    
    // Extract keywords from prompt if not provided
    if (!promptAnalytics.keywords) {
      promptAnalytics.keywords = extractKeywords(promptAnalytics.promptText);
    }
    
    // Calculate prompt length if not provided
    if (!promptAnalytics.promptLength) {
      promptAnalytics.promptLength = promptAnalytics.promptText.length;
    }
    
    // Add server-side data
    const enrichedAnalytics = {
      ...promptAnalytics,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      ipAddress: getClientIP(request),
    };

    // In production, this would save to database
    console.log('Prompt Analytics:', JSON.stringify(enrichedAnalytics, null, 2));
    
    // TODO: Save to database
    // await savePromptAnalytics(enrichedAnalytics);

    return NextResponse.json({ success: true, analyticsId: enrichedAnalytics.id });
  } catch (error) {
    console.error('Failed to process prompt analytics:', error);
    return NextResponse.json(
      { error: 'Failed to process prompt analytics' },
      { status: 500 }
    );
  }
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'would', 'could', 'should', 'create', 'generate', 'make'].includes(word));
  
  // Return unique words, sorted by frequency
  const frequency: { [key: string]: number } = {};
  words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
  
  return Object.keys(frequency)
    .sort((a, b) => frequency[b] - frequency[a])
    .slice(0, 10);
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
