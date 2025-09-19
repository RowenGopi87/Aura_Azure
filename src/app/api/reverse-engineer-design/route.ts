import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getReverseEngineeringProviders, getDefaultReverseEngineeringProviders } from '@/lib/reverse-engineering-settings';

// Define the request schema
const DesignReverseEngineerSchema = z.object({
  inputType: z.enum(['figma', 'image', 'upload']),
  figmaUrl: z.string().optional(),
  designData: z.string(),
  imageData: z.string().optional(),
  imageType: z.string().optional(),
  fileData: z.array(z.object({
    filename: z.string(),
    content: z.string()
  })).optional(),
  analysisLevel: z.enum(['story', 'epic', 'feature', 'initiative', 'business-brief']),
  extractUserFlows: z.boolean().default(true),
  includeAccessibility: z.boolean().default(true),
  useRealLLM: z.boolean().default(false),
  reverseEngineeringSettings: z.object({
    design: z.object({
      provider: z.string(),
      model: z.string()
    }),
    code: z.object({
      provider: z.string(),
      model: z.string()
    })
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 Design reverse engineering API called');

    // Parse and validate the request body
    const body = await request.json();
    console.log('📥 Request body:', body);

    const validatedData = DesignReverseEngineerSchema.parse(body);
    const { 
      inputType, 
      figmaUrl, 
      designData, 
      imageData,
      imageType,
      fileData, 
      analysisLevel, 
      extractUserFlows, 
      includeAccessibility,
      useRealLLM,
      reverseEngineeringSettings
    } = validatedData;

    console.log('✅ Request validation passed');
    console.log('🎨 Reverse engineering level:', analysisLevel);

    // Build the comprehensive system prompt for design reverse engineering
    const systemPrompt = buildDesignReverseEngineeringPrompt(analysisLevel);

    // Build the user prompt with design analysis
    const userPrompt = buildDesignAnalysisPrompt(
      inputType,
      figmaUrl,
      designData,
      imageData,
      imageType,
      fileData,
      analysisLevel,
      extractUserFlows,
      includeAccessibility
    );

    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 User prompt length:', userPrompt.length);

    // Call the LLM service to analyze design and extract work items
    const reverseEngineeredItems = await analyzeDesignWithLLM(
      systemPrompt, 
      userPrompt, 
      analysisLevel,
      !!imageData,
      useRealLLM,
      imageData,
      imageType,
      reverseEngineeringSettings
    );

    console.log('✅ Design analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: reverseEngineeredItems,
      message: 'Design reverse engineered successfully'
    });

  } catch (error) {
    console.error('❌ Error in design reverse engineering API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reverse engineer design'
    }, { status: 500 });
  }
}

function buildDesignReverseEngineeringPrompt(analysisLevel: string): string {
  return `**CRITICAL: YOU MUST RETURN VALID JSON ONLY**

Your response must be a properly formatted JSON object with no additional text, explanations, or markdown formatting. Do not include code blocks, backticks, or any text outside the JSON structure.

You are an expert Product Owner with deep expertise in requirements engineering, user story creation, and visual design analysis. Your role is to reverse engineer visual designs into high-quality business requirements that follow the seven fundamental characteristics of excellent requirements.

🎯 **PRIMARY ROLE**: Acting as a Senior Product Owner, analyze visual designs and extract well-structured work items that drive business value and enable development teams to deliver exceptional user experiences.

📋 **THE SEVEN CHARACTERISTICS OF EXCELLENT REQUIREMENTS**:
Every requirement you create MUST demonstrate these qualities:

1. **CLEAR** - Easily understood by all stakeholders without ambiguity
2. **UNAMBIGUOUS** - Has only one possible interpretation 
3. **CONCISE** - Expressed in minimal words without losing meaning
4. **TESTABLE** - Can be verified through specific acceptance criteria
5. **UNDERSTANDABLE** - Accessible to technical and non-technical team members
6. **ADDS VALUE** - Directly contributes to user satisfaction and business goals
7. **COMPLETE** - Contains all necessary information for implementation

🔍 **ANALYSIS APPROACH**:

**Visual Design Analysis**: Examine layouts, components, navigation patterns, information architecture, and UI elements to extract business functionality and user needs.

**User Journey Mapping**: Identify user workflows, interaction patterns, task completion flows, and user experience requirements from visual cues.

**Component-to-Requirement Translation**: Convert interface elements (forms, buttons, navigation, content areas) into actionable business requirements with clear acceptance criteria.

**Business Value Extraction**: Connect visual design elements to measurable business outcomes and user value propositions.

**Requirements Hierarchy Generation**: Create appropriately leveled work items based on analysis depth:
- **Business Brief**: Strategic context, market positioning, high-level business objectives
- **Initiative**: Large-scale business capabilities and measurable outcomes  
- **Feature**: Specific user-facing capabilities that deliver business value
- **Epic**: Cohesive collections of user stories that achieve feature goals
- **Story**: Specific, implementable user requirements with detailed acceptance criteria

🎨 **CRITICAL: ANALYZE THE ACTUAL UPLOADED IMAGE**:
You MUST base ALL analysis on the specific visual design image provided. Do NOT generate generic or hypothetical UI analysis.

**VISUAL ANALYSIS FOCUS AREAS**:
- **LOOK AT THE IMAGE**: Identify what you actually see in the uploaded design
- **Navigation structures** → Information architecture requirements from the visible UI
- **Forms and inputs** → Data collection requirements from actual form fields shown
- **Buttons and CTAs** → User action requirements from visible interactive elements  
- **Content layouts** → Information display requirements from the actual layout
- **Interactive elements** → User engagement requirements from visible components  
- **Visual hierarchy** → Business priority requirements from the design's emphasis
- **Colors and styling** → Brand and UX requirements from the visual theme
- **Text and labels** → Content and messaging requirements from visible text

**MANDATORY**: Your entire analysis must reflect what is ACTUALLY shown in the uploaded image, not generic UI patterns.

ANALYSIS DEPTH BASED ON LEVEL:
- Business Brief: Extract overall business domain, user experience strategy, market context
- Initiative: Identify major user experience capabilities and business outcomes
- Feature: Focus on specific interface areas and user capabilities
- Epic: Group related interface functionality into coherent user journeys
- Story: Create specific, actionable user stories based on interface elements

CRITICAL REQUIREMENTS FOR VISUAL DESIGN ANALYSIS:
- Analyze actual interface patterns and visual elements, don't make generic assumptions
- Extract specific functionality from buttons, forms, navigation, and interactive elements
- Identify user roles and access patterns from interface design
- Understand data models and content types from information architecture
- Map user workflows and interaction patterns from visual flows
- Identify integration points from external service indicators
- Extract quality attributes (accessibility, responsiveness, performance requirements)
- Analyze visual hierarchy to understand business priorities
- Consider mobile/responsive design patterns if present

VISUAL ELEMENTS TO ANALYZE:
- Navigation systems and menu structures
- Forms and input fields (registration, login, data entry)
- Buttons and call-to-action elements
- Content layouts and information hierarchy
- Interactive components (dropdowns, modals, tabs)
- Visual branding and design system elements
- Mobile responsiveness indicators
- Accessibility features visible in design

**JSON RESPONSE FORMAT REQUIREMENTS**:

You MUST return ONLY a valid JSON object. Your entire response should be a single JSON object with no other text.

For Business Brief level, return this EXACT structure:
{
  "analysisDepth": "business-brief",
  "extractedInsights": "Detailed analysis of the business domain and strategic context extracted from design",
  "designAnalysis": "Specific analysis of visual design patterns, user interface elements, and interaction design", 
  "userFlows": ["List of user workflows identified from design"],
  "accessibilityInsights": ["Accessibility considerations based on design elements"],
  "businessBrief": {
    "id": "BB-DESIGN-REV-001",
    "title": "Extracted Business Brief Title",
    "description": "Business context extracted from design analysis",
    "businessObjective": "Primary business goals identified from design functionality",
    "quantifiableBusinessOutcomes": ["Specific measurable outcomes based on design capabilities"]
  },
  "initiatives": [
    {
      "id": "INIT-REV-001",
      "title": "Initiative Title",
      "description": "Initiative description",
      "category": "user-experience",
      "priority": "high",
      "rationale": "Business rationale",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
      "businessValue": "Business value description",
      "workflowLevel": "initiative"
    }
  ],
  "features": [
    {
      "id": "FEAT-REV-001", 
      "title": "Feature Title",
      "description": "Feature description",
      "category": "frontend",
      "priority": "high",
      "rationale": "Feature rationale", 
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
      "businessValue": "Business value description",
      "workflowLevel": "feature"
    }
  ],
  "epics": [
    {
      "id": "EPIC-REV-001",
      "title": "Epic Title", 
      "description": "Epic description",
      "category": "user-interface",
      "priority": "high",
      "rationale": "Epic rationale",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"], 
      "businessValue": "Business value description",
      "workflowLevel": "epic"
    }
  ],
  "stories": [
    {
      "id": "STORY-REV-001",
      "title": "As a [user], I want [goal] so that [benefit]",
      "description": "Story description",
      "category": "user-interface", 
      "priority": "high",
      "rationale": "Story rationale",
      "acceptanceCriteria": ["Given [context], When [action], Then [outcome]"],
      "businessValue": "Business value description",
      "workflowLevel": "story"
    }
  ]
}

**CRITICAL**: Return ONLY this JSON structure with actual analyzed content from the design. No additional text, explanations, or formatting.

IMPORTANT: Base all extractions on ACTUAL visual design elements and interface patterns, not generic UI assumptions.`;
}

function buildDesignAnalysisPrompt(
  inputType: string,
  figmaUrl: string | undefined,
  designData: string,
  imageData: string | undefined,
  imageType: string | undefined,
  fileData: { filename: string; content: string }[] | undefined,
  analysisLevel: string,
  extractUserFlows: boolean,
  includeAccessibility: boolean
): string {
  const sourceContext = inputType === 'figma' 
    ? `Figma Design URL: ${figmaUrl}`
    : inputType === 'image' 
    ? `Design Image Analysis`
    : 'Multiple Design Files Analysis';

  const analysisScope = [
    `Analysis Level: ${analysisLevel}`,
    extractUserFlows ? "Extract user flows and interaction patterns" : "Focus on static design elements",
    includeAccessibility ? "Include accessibility analysis based on visual design" : "Focus only on functional requirements"
  ].join(". ");

  const fileBreakdown = fileData?.length 
    ? `\n\nDESIGN FILES:\n${fileData.map(file => `=== ${file.filename} ===\nFile Type: Image/Design File\nContent: Base64 encoded design image\n`).join('\n')}`
    : '';

  const imagePrompt = imageData ? 
    `I have provided a design image that I want you to analyze and reverse engineer into business requirements. Please examine this visual design carefully and extract work items based on the interface elements, user flows, and business functionality you can identify.` : 
    `Please analyze the provided design information and extract work items at the ${analysisLevel} level.`;

  return `${imagePrompt}

SOURCE: ${sourceContext}
ANALYSIS SCOPE: ${analysisScope}

${fileBreakdown}

DESIGN INFORMATION:
${designData}

VISUAL ANALYSIS INSTRUCTIONS:
1. Identify the primary business domain from visual branding and content
2. Extract user roles and permissions from interface access patterns
3. Map interface components to functional requirements (forms → data entry, buttons → actions)
4. Identify user workflows from navigation and interaction patterns
5. Extract business rules from form validation and UI constraints
6. Identify integration points from external service indicators
7. Analyze accessibility features and responsive design patterns
8. Generate work items based on actual interface functionality

Focus on extracting meaningful business requirements that reflect the actual design implementation and user experience, not generic interface patterns.

**CRITICAL OUTPUT REQUIREMENT**: 
Respond with ONLY valid JSON following the exact structure provided in the system prompt. Do not include any explanatory text, markdown formatting, or code blocks. Your entire response should be parseable as JSON.`;
}

async function analyzeDesignWithLLM(
  systemPrompt: string,
  userPrompt: string,
  analysisLevel: string,
  hasImage: boolean,
  useRealLLM: boolean,
  imageData?: string,
  imageType?: string,
  reverseEngineeringSettings?: any
): Promise<any> {
  try {
    console.log('🤖 Calling LLM for design analysis...');
    console.log(`🎯 Analysis mode: ${useRealLLM ? 'REAL LLM' : 'MOCK'} (user selected)`);
    
    if (useRealLLM) {
      console.log('🔥 Using REAL LLM for design reverse engineering');
      return await callRealLLMDesignAnalysis(systemPrompt, userPrompt, analysisLevel, hasImage, imageData, imageType, reverseEngineeringSettings);
    } else {
      console.log('🎭 Using MOCK analysis logic');
      return await getMockDesignAnalysis(analysisLevel, hasImage);
    }

  } catch (error) {
    console.error('❌ Error in LLM design analysis:', error);
    console.log('🎭 Falling back to mock analysis due to error');
    // Always fall back to mock if real LLM fails
    const fallbackAnalysis = await getMockDesignAnalysis(analysisLevel, hasImage);
    // Add metadata to show this was a fallback
    return {
      ...fallbackAnalysis,
      analysisMode: 'mock-fallback',
      requestedMode: useRealLLM ? 'real-llm' : 'mock',
      fallbackReason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function callRealLLMDesignAnalysis(
  systemPrompt: string,
  userPrompt: string,
  analysisLevel: string,
  hasImage: boolean,
  imageData?: string,
  imageType?: string,
  reverseEngineeringSettings?: any,
  maxRetries: number = 3
): Promise<any> {
  console.log('🤖 Starting design analysis with retry mechanism...');
  
  // Get configured providers from settings
  let providers;
  try {
    providers = getReverseEngineeringProviders('design', reverseEngineeringSettings);
    console.log('🔧 Using configured reverse engineering providers for design:', providers.map(p => `${p.name} (${p.model})`).join(', '));
  } catch (error) {
    console.warn('⚠️ Failed to load reverse engineering settings, using defaults:', error);
    providers = getDefaultReverseEngineeringProviders();
  }

  for (const providerConfig of providers) {
    console.log(`🔄 Trying ${providerConfig.name} for design analysis...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 ${providerConfig.name} attempt ${attempt}/${maxRetries}`);
        
        // Call the MCP Bridge Server for actual LLM processing
        const response = await fetch(`${process.env.MCP_BRIDGE_URL || 'http://localhost:8000'}/reverse-engineer-design`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            analysisLevel,
            hasImage,
            imageData,
            imageType,
            llm_provider: providerConfig.provider,
            model: providerConfig.model
          }),
        });

        if (!response.ok) {
          throw new Error(`MCP Bridge server responded with ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Success with ${providerConfig.name} on attempt ${attempt}`);
          return {
            ...result.data,
            provider: providerConfig.name,
            attempt: attempt,
            usedFallback: providerConfig.name !== 'OpenAI'
          };
        } else {
          throw new Error(result.error || `${providerConfig.name} API returned error`);
        }
        
      } catch (error) {
        console.error(`❌ ${providerConfig.name} attempt ${attempt} failed:`, error);
        
        // If this is the last attempt for this provider, continue to next provider
        if (attempt === maxRetries) {
          console.log(`🔄 ${providerConfig.name} failed after ${maxRetries} attempts, trying next provider...`);
          break;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // If all providers failed, throw error to fall back to mock
  throw new Error('All LLM providers failed for design analysis');
}

async function getMockDesignAnalysis(analysisLevel: string, hasImage: boolean): Promise<any> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const baseInsights = `Visual design analysis reveals a modern, user-centric interface with clear information hierarchy, intuitive navigation patterns, and professional visual design. The interface demonstrates strong UX principles with accessible design patterns and responsive layout considerations.`;
  
  const designAnalysis = `The design showcases contemporary UI patterns with clean typography, consistent spacing, and purposeful color usage. Key interface elements include streamlined navigation, prominent calls-to-action, well-organized content sections, and user-friendly form designs. The visual hierarchy guides users through optimal task completion flows.`;
  
  const mockData: any = {
    analysisDepth: analysisLevel,
    extractedInsights: `${baseInsights} Analysis includes ${hasImage ? 'detailed visual examination' : 'design pattern review'}.`,
    designAnalysis,
    userFlows: [
      'User onboarding and account setup',
      'Primary navigation and content discovery', 
      'Task completion and form submission',
      'Settings and profile management'
    ],
    accessibilityInsights: [
      'High contrast ratios for text readability',
      'Clear focus indicators for keyboard navigation',
      'Sufficient touch target sizes for mobile users',
      'Semantic structure for screen reader compatibility'
    ],
    stories: [
      {
        id: 'STORY-DESIGN-REV-001',
        title: 'As a user, I want a clear navigation system',
        description: 'Intuitive navigation interface extracted from design analysis',
        category: 'navigation',
        priority: 'high',
        acceptanceCriteria: ['Navigation is clearly visible', 'Menu items are logically organized', 'Mobile navigation works properly'],
        businessValue: 'Enables users to easily find and access different sections of the application',
        workflowLevel: 'story',
        storyPoints: 3,
        labels: ['ui', 'navigation']
      },
      {
        id: 'STORY-DESIGN-REV-002', 
        title: 'As a user, I want responsive design across devices',
        description: 'Mobile-responsive interface capabilities identified in design',
        category: 'responsive-design',
        priority: 'high',
        acceptanceCriteria: ['Layout adapts to mobile screens', 'Touch targets are appropriately sized', 'Content remains readable'],
        businessValue: 'Ensures optimal user experience across all device types',
        workflowLevel: 'story',
        storyPoints: 5,
        labels: ['responsive', 'mobile']
      }
    ]
  };

  // Add higher-level items based on analysis level
  if (['epic', 'feature', 'initiative', 'business-brief'].includes(analysisLevel)) {
    mockData.epics = [
      {
        id: 'EPIC-DESIGN-REV-001',
        title: 'User Interface Implementation Epic',
        description: 'Complete user interface development based on design specifications and user experience requirements',
        category: 'ui-development',
        priority: 'high',
        acceptanceCriteria: ['All design elements implemented accurately', 'User flows work as intended', 'Responsive design functions properly'],
        businessValue: 'Delivers comprehensive user interface that matches design vision and user needs',
        workflowLevel: 'epic',
        estimatedEffort: 'Large',
        sprintEstimate: 6
      }
    ];
  }

  if (['feature', 'initiative', 'business-brief'].includes(analysisLevel)) {
    mockData.features = [
      {
        id: 'FEAT-DESIGN-REV-001',
        title: 'Interactive User Interface Feature',
        description: 'User interface components and interaction patterns based on design analysis',
        category: 'user-interface',
        priority: 'high',
        acceptanceCriteria: ['Modern, clean interface design', 'Intuitive user interactions', 'Consistent design system'],
        businessValue: 'Provides users with modern, engaging interface that drives user satisfaction',
        workflowLevel: 'feature',
        estimatedEffort: 'Medium',
        targetRelease: 'v1.0'
      }
    ];
  }

  if (['initiative', 'business-brief'].includes(analysisLevel)) {
    mockData.initiatives = [
      {
        id: 'INIT-DESIGN-REV-001',
        title: 'User Experience Enhancement Initiative',
        description: 'Comprehensive user experience improvement based on modern design principles and user-centered approach',
        category: 'user-experience',
        priority: 'high',
        acceptanceCriteria: ['Improved user satisfaction scores', 'Reduced task completion time', 'Higher user engagement'],
        businessValue: 'Establishes superior user experience that differentiates the product and drives user retention',
        workflowLevel: 'initiative',
        estimatedEffort: 'Extra Large',
        strategicAlignment: 'User experience excellence'
      }
    ];
  }

  if (analysisLevel === 'business-brief') {
    mockData.businessBrief = {
      id: 'BB-DESIGN-REV-001',
      title: 'UI/UX Design Business Brief',
      description: 'Comprehensive business context extracted from visual design analysis and user experience requirements',
      businessObjective: 'Deliver exceptional user experience through modern, intuitive interface design that drives user engagement and business outcomes',
      quantifiableBusinessOutcomes: [
        'Increase user engagement by 40%',
        'Improve task completion rates by 25%', 
        'Reduce user onboarding time by 50%',
        'Achieve 95% user satisfaction score'
      ]
    };
  }

  console.log('✅ LLM design analysis completed successfully');
  return mockData;
} 