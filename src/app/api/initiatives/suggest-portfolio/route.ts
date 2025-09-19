import { NextRequest, NextResponse } from 'next/server';
import { databaseService, embeddingService, vectorStore } from '@/lib/database';
import { z } from 'zod';

const suggestPortfolioSchema = z.object({
  initiatives: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    businessValue: z.string().optional()
  }))
});

// Portfolio keywords mapping for AI-powered suggestion
const PORTFOLIO_KEYWORDS = {
  'PORTFOLIO-WEB-MOBILE': [
    'web', 'mobile', 'app', 'website', 'frontend', 'ui', 'ux', 'responsive', 'ios', 'android', 
    'pwa', 'progressive', 'customer facing', 'user interface', 'react', 'vue', 'angular'
  ],
  'PORTFOLIO-CUSTOMER': [
    'customer', 'client', 'rugby', 'sevens', 'events', 'portal', 'customer experience',
    'cx', 'engagement', 'loyalty', 'personalization', 'customer service'
  ],
  'PORTFOLIO-COMMERCIAL': [
    'agent', 'booking', 'resconnect', 'travel agent', 'b2b', 'commercial', 'reservation',
    'gds', 'amadeus', 'sabre', 'travelport', 'corporate', 'business', 'sales'
  ],
  'PORTFOLIO-GROUP-SERVICE': [
    'payroll', 'hr', 'hiring', 'internal', 'employee', 'staff', 'payment gateway',
    'payment', 'gateway', 'infrastructure', 'backend services', 'api', 'microservices',
    'integration', 'workflow', 'automation'
  ],
  'PORTFOLIO-DONATA': [
    'baggage', 'ground', 'operations', 'cargo', 'airport', 'below wing', 'handling',
    'ops', 'operational', 'logistics', 'maintenance', 'aircraft', 'ground crew'
  ]
};

function calculatePortfolioScore(content: string, keywords: string[]): number {
  const normalizedContent = content.toLowerCase();
  let score = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    // Count occurrences of keyword
    const matches = (normalizedContent.match(new RegExp(keywordLower, 'g')) || []).length;
    score += matches;
    
    // Boost score for exact matches
    if (normalizedContent.includes(keywordLower)) {
      score += 2;
    }
  }
  
  return score;
}

async function suggestPortfolioForInitiative(initiative: any, portfolios: any[]) {
  const content = `${initiative.title} ${initiative.description} ${initiative.businessValue || ''}`;
  
  try {
    // Try RAG-based approach first if embedding service is available
    if (embeddingService.isEnabled()) {
      return await suggestWithRAG(content, portfolios, initiative.id);
    }
  } catch (error) {
    console.warn('RAG-based suggestion failed, falling back to keyword matching:', error);
  }
  
  // Fallback to enhanced keyword matching
  return suggestWithKeywords(content, portfolios);
}

async function suggestWithRAG(content: string, portfolios: any[], initiativeId: string) {
  try {
    // Create portfolio context documents if they don't exist
    const portfolioContexts = portfolios.map(p => ({
      id: p.id,
      content: `Portfolio: ${p.name}. ${p.description}. Function: ${p.function}`,
      metadata: { type: 'portfolio', portfolioId: p.id, portfolioName: p.name }
    }));
    
    // Store portfolio contexts in vector store
    for (const context of portfolioContexts) {
      await vectorStore.addDocument(context.id, context.content, context.metadata);
    }
    
    // Generate embedding for the initiative content
    const initiativeEmbedding = await embeddingService.generateEmbedding(content);
    
    // Find most similar portfolios using semantic search
    const similarPortfolios = await vectorStore.similaritySearch(
      initiativeEmbedding, 
      3, // Top 3 matches
      { type: 'portfolio' } // Filter for portfolio documents only
    );
    
    if (similarPortfolios.length > 0) {
      const bestMatch = similarPortfolios[0];
      const confidence = Math.round(bestMatch.similarity * 100);
      
      // Only suggest if confidence is above threshold
      if (confidence >= 60) {
        return {
          portfolioId: bestMatch.metadata.portfolioId,
          confidence,
          reason: `RAG semantic analysis found ${confidence}% similarity with ${bestMatch.metadata.portfolioName} portfolio`
        };
      }
    }
    
    return {
      portfolioId: null,
      confidence: 0,
      reason: 'No strong semantic match found via RAG analysis'
    };
    
  } catch (error) {
    console.error('RAG suggestion failed:', error);
    throw error;
  }
}

function suggestWithKeywords(content: string, portfolios: any[]) {
  let bestMatch = {
    portfolioId: null as string | null,
    score: 0,
    confidence: 0
  };
  
  // Calculate scores for each portfolio
  for (const [portfolioId, keywords] of Object.entries(PORTFOLIO_KEYWORDS)) {
    const score = calculatePortfolioScore(content, keywords);
    
    if (score > bestMatch.score) {
      bestMatch = {
        portfolioId,
        score,
        confidence: Math.min(score * 10, 100) // Convert to percentage, max 100%
      };
    }
  }
  
  // Only suggest if confidence is above threshold
  const minConfidence = 30;
  if (bestMatch.confidence < minConfidence) {
    return {
      portfolioId: null,
      confidence: 0,
      reason: 'No clear portfolio match found based on keyword analysis'
    };
  }
  
  return {
    portfolioId: bestMatch.portfolioId,
    confidence: bestMatch.confidence,
    reason: `Keyword analysis suggests this portfolio based on ${bestMatch.score} matching terms`
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Portfolio suggestion API called');
    
    const body = await request.json();
    console.log('📥 Request body:', { initiativeCount: body.initiatives?.length });

    // Validate request
    const validatedData = suggestPortfolioSchema.parse(body);
    const { initiatives } = validatedData;

    // Handle empty initiatives array
    if (!initiatives || initiatives.length === 0) {
      console.log('No initiatives provided for portfolio suggestions');
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          summary: {
            total: 0,
            autoAssignable: 0,
            needsManualAssignment: 0,
            portfolios: []
          }
        },
        message: 'No initiatives to suggest portfolios for'
      });
    }

    await databaseService.initialize();
    
    // Get all portfolios for reference
    const portfolios = await databaseService.getAllPortfolios();
    const portfolioMap = new Map(portfolios.map(p => [p.id, p]));
    
    // Generate suggestions for each initiative (now async)
    const suggestions = await Promise.all(initiatives.map(async (initiative) => {
      const suggestion = await suggestPortfolioForInitiative(initiative, portfolios);
      
      return {
        initiativeId: initiative.id,
        initiative: {
          title: initiative.title,
          description: initiative.description.substring(0, 100) + '...' // Truncate for response
        },
        suggestion: {
          portfolioId: suggestion.portfolioId,
          portfolio: suggestion.portfolioId ? portfolioMap.get(suggestion.portfolioId) : null,
          confidence: suggestion.confidence,
          reason: suggestion.reason
        }
      };
    }));

    const autoAssignableCount = suggestions.filter(s => s.suggestion.portfolioId).length;
    const manualAssignCount = suggestions.length - autoAssignableCount;

    console.log(`✅ Generated suggestions: ${autoAssignableCount} auto-assignable, ${manualAssignCount} need manual assignment`);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        summary: {
          total: initiatives.length,
          autoAssignable: autoAssignableCount,
          needsManualAssignment: manualAssignCount,
          portfolios: portfolios
        }
      },
      message: `Portfolio suggestions generated for ${initiatives.length} initiatives`
    });

  } catch (error: any) {
    console.error('❌ Failed to generate portfolio suggestions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate portfolio suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
