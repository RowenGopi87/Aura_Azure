import { NextRequest, NextResponse } from 'next/server';

// Safely import optional services
let embeddingService: any = null;
let vectorStore: any = null;

try {
  const services = require('@/lib/database');
  embeddingService = services.embeddingService;
  vectorStore = services.vectorStore;
} catch (error) {
  console.log('Optional embedding services not available, using keyword-based suggestions only');
}
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
    'pwa', 'progressive', 'customer facing', 'user interface', 'react', 'vue', 'angular',
    'digital', 'online', 'web application', 'mobile app', 'user experience', 'interface',
    'browser', 'smartphone', 'tablet', 'responsive design', 'web portal'
  ],
  'PORTFOLIO-CUSTOMER': [
    'customer', 'client', 'rugby', 'sevens', 'events', 'portal', 'customer experience',
    'cx', 'engagement', 'loyalty', 'personalization', 'customer service', 'customer portal',
    'customer support', 'customer management', 'customer relationship', 'customer journey',
    'customer satisfaction', 'customer retention', 'customer acquisition', 'self service'
  ],
  'PORTFOLIO-COMMERCIAL': [
    'agent', 'booking', 'resconnect', 'travel agent', 'b2b', 'commercial', 'reservation',
    'gds', 'amadeus', 'sabre', 'travelport', 'corporate', 'business', 'sales',
    'booking system', 'travel booking', 'reservation system', 'agent portal', 'travel agents',
    'commercial booking', 'corporate travel', 'business travel', 'booking platform'
  ],
  'PORTFOLIO-GROUP-SERVICE': [
    'payroll', 'hr', 'hiring', 'internal', 'employee', 'staff', 'payment gateway',
    'payment', 'gateway', 'infrastructure', 'backend services', 'api', 'microservices',
    'integration', 'workflow', 'automation', 'internal system', 'backend', 'service',
    'payment processing', 'payment system', 'internal operations', 'system integration'
  ],
  'PORTFOLIO-DONATA': [
    'baggage', 'ground', 'operations', 'cargo', 'airport', 'below wing', 'handling',
    'ops', 'operational', 'logistics', 'maintenance', 'aircraft', 'ground crew',
    'baggage handling', 'ground operations', 'cargo handling', 'airport operations',
    'operational efficiency', 'ground services', 'baggage system', 'cargo management'
  ]
};

function calculatePortfolioScore(content: string, keywords: string[]): number {
  const normalizedContent = content.toLowerCase();
  let score = 0;
  let matchedKeywords = 0;
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Check for exact keyword match
    if (normalizedContent.includes(keywordLower)) {
      matchedKeywords++;
      
      // Count occurrences of keyword
      const matches = (normalizedContent.match(new RegExp(keywordLower, 'g')) || []).length;
      
      // Base score for keyword presence
      score += 3;
      
      // Additional points for multiple occurrences
      if (matches > 1) {
        score += matches - 1;
      }
      
      // Boost score for multi-word keywords (more specific)
      if (keyword.includes(' ')) {
        score += 2;
      }
    }
    
    // Check for partial matches (word boundaries)
    const words = keywordLower.split(' ');
    for (const word of words) {
      if (word.length > 3 && normalizedContent.includes(word)) {
        score += 1;
      }
    }
  }
  
  // Bonus for matching multiple keywords (indicates stronger relevance)
  if (matchedKeywords >= 2) {
    score += matchedKeywords * 2;
  }
  
  return score;
}

async function suggestPortfolioForInitiative(initiative: any, portfolios: any[]) {
  const content = `${initiative.title} ${initiative.description} ${initiative.businessValue || ''}`;
  
  try {
    // Try RAG-based approach first if embedding service is available
    if (embeddingService && embeddingService.isEnabled && embeddingService.isEnabled()) {
      console.log('🧠 Using RAG-based portfolio suggestion');
      return await suggestWithRAG(content, portfolios, initiative.id);
    }
  } catch (error) {
    console.warn('RAG-based suggestion failed, falling back to keyword matching:', error);
  }
  
  // Fallback to enhanced keyword matching
  console.log('🔍 Using keyword-based portfolio suggestion');
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
      // Improved confidence calculation
      let confidence = 0;
      if (score >= 15) confidence = 90;        // Very high confidence
      else if (score >= 10) confidence = 80;   // High confidence  
      else if (score >= 7) confidence = 70;    // Good confidence (auto-assign threshold)
      else if (score >= 5) confidence = 60;    // Medium confidence
      else if (score >= 3) confidence = 45;    // Low confidence
      else if (score >= 1) confidence = 25;    // Very low confidence
      
      bestMatch = {
        portfolioId,
        score,
        confidence
      };
    }
  }
  
  // Only suggest if confidence is above threshold
  const minConfidence = 25;
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

    // Dynamic import of database service
    console.log('🔄 Loading database service...');
    const { databaseService } = await import('@/lib/database/service');
    
    if (!databaseService) {
      console.error('❌ Database service not available after import');
      return NextResponse.json({
        success: false,
        error: 'Database service not available',
        message: 'Database service could not be loaded'
      }, { status: 500 });
    }

    await databaseService.initialize();
    
    // Get all portfolios for reference
    const portfolios = await databaseService.getAllPortfolios();
    const portfolioMap = new Map(portfolios.map(p => [p.id, p]));
    
    // Generate suggestions for each initiative (now async)
    const suggestions = await Promise.all(initiatives.map(async (initiative) => {
      try {
        console.log(`🎯 Processing initiative: ${initiative.title}`);
        const suggestion = await suggestPortfolioForInitiative(initiative, portfolios);
        
        console.log(`✅ Suggestion for "${initiative.title}": ${suggestion.portfolioId || 'none'} (${suggestion.confidence}%)`);
        
        return {
          initiativeId: initiative.id,
          initiative: {
            title: initiative.title,
            description: initiative.description ? initiative.description.substring(0, 100) + '...' : '' // Truncate for response
          },
          suggestion: {
            portfolioId: suggestion.portfolioId,
            portfolio: suggestion.portfolioId ? portfolioMap.get(suggestion.portfolioId) : null,
            confidence: suggestion.confidence,
            reason: suggestion.reason
          }
        };
      } catch (error) {
        console.error(`❌ Error processing initiative "${initiative.title}":`, error);
        return {
          initiativeId: initiative.id,
          initiative: {
            title: initiative.title,
            description: initiative.description ? initiative.description.substring(0, 100) + '...' : ''
          },
          suggestion: {
            portfolioId: null,
            portfolio: null,
            confidence: 0,
            reason: `Error generating suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        };
      }
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
