"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAudit } from "@/hooks/use-audit";
import { 
  Sparkles, 
  Loader2, 
  FileText,
  Target,
  Building,
  Zap,
  Save,
  Edit3,
  Trash2,
  Brain,
  Clock,
  CheckCircle
} from "lucide-react";

interface GenerationPrompt {
  businessIdea: string;
  targetAudience: string;
  businessUnit: string;
  strategicTheme: string;
  additionalContext: string;
  complexityLevel: 'simple' | 'moderate' | 'complex';
  focusArea: 'efficiency' | 'innovation' | 'compliance' | 'growth' | 'cost_reduction';
}

interface GeneratedBrief {
  id: string;
  title: string;
  description: string;
  businessOwner: string;
  leadBusinessUnit: string;
  primaryStrategicTheme: string;
  businessObjective: string;
  quantifiableBusinessOutcomes: string;
  inScope: string;
  outOfScope: string;
  impactOfDoNothing: string;
  happyPath: string;
  exceptions: string;
  impactedEndUsers: string;
  changeImpactExpected: string;
  impactToOtherDepartments: string;
  impactsExistingTechnology: boolean;
  technologySolutions: string;
  relevantBusinessOwners: string;
  otherTechnologyInfo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  workflowType: 'new_system' | 'enhancement';
  generatedAt: string;
  aiModel: string;
  generationTimeMs: number;
  promptUsed: string;
}

interface BusinessBriefGeneratorProps {
  onGenerated: (brief: GeneratedBrief) => void;
  onSaved: (brief: GeneratedBrief) => void;
  onDeleted: (briefId: string) => void;
}

export function BusinessBriefGenerator({ 
  onGenerated, 
  onSaved, 
  onDeleted 
}: BusinessBriefGeneratorProps) {
  const [prompt, setPrompt] = useState<GenerationPrompt>({
    businessIdea: '',
    targetAudience: '',
    businessUnit: '',
    strategicTheme: '',
    additionalContext: '',
    complexityLevel: 'moderate',
    focusArea: 'efficiency'
  });
  
  const [generatedBrief, setGeneratedBrief] = useState<GeneratedBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  const [originalGeneration, setOriginalGeneration] = useState<GeneratedBrief | null>(null);

  const {
    trackGeneration,
    trackEdit,
    trackSave,
    trackDelete,
    trackView
  } = useAudit();

  const handlePromptChange = (field: keyof GenerationPrompt, value: string) => {
    setPrompt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    if (!prompt.businessIdea.trim()) {
      alert('Please provide a business idea to generate the brief');
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();
    const promptText = buildPromptText(prompt);

    try {
      // Simulate AI generation (replace with actual API call)
      const response = await generateBusinessBrief(prompt);
      const generationTimeMs = Date.now() - startTime;
      
      const briefId = `brief_${Date.now()}`;
      const generatedBrief: GeneratedBrief = {
        ...response,
        id: briefId,
        generatedAt: new Date().toISOString(),
        aiModel: 'gpt-4', // This should come from the actual model used
        generationTimeMs,
        promptUsed: promptText
      };

      // Track generation event
      await trackGeneration({
        featureCategory: 'brief',
        action: 'generate_business_brief',
        resourceType: 'business_brief',
        resourceId: briefId,
        resourceTitle: generatedBrief.title,
        generationData: generatedBrief,
        promptData: {
          prompt: promptText,
          keywords: extractKeywords(promptText),
          additionalContext: {
            complexityLevel: prompt.complexityLevel,
            focusArea: prompt.focusArea,
            businessUnit: prompt.businessUnit
          }
        },
        aiModelUsed: 'gpt-4',
        startTime
      });

      setGeneratedBrief(generatedBrief);
      setOriginalGeneration({ ...generatedBrief });
      setHasBeenEdited(false);
      onGenerated(generatedBrief);

    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate business brief. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBriefChange = (field: keyof GeneratedBrief, value: string | boolean) => {
    if (generatedBrief) {
      const updatedBrief = {
        ...generatedBrief,
        [field]: value
      };
      
      setGeneratedBrief(updatedBrief);
      
      if (!hasBeenEdited) {
        setHasBeenEdited(true);
        
        // Track first edit
        if (originalGeneration) {
          trackEdit({
            featureCategory: 'brief',
            action: 'first_edit_after_generation',
            resourceType: 'business_brief',
            resourceId: generatedBrief.id,
            resourceTitle: generatedBrief.title,
            beforeContent: originalGeneration,
            afterContent: updatedBrief,
            fieldsChanged: [field]
          });
        }
      }
    }
  };

  const handleSave = async () => {
    if (!generatedBrief) return;

    setIsSaving(true);
    const startTime = Date.now();

    try {
      // Save to database (replace with actual API call)
      const response = await saveBusinessBrief(generatedBrief);
      
      if (response.success) {
        // Track save event with comprehensive metadata
        await trackSave({
          featureCategory: 'brief',
          resourceType: 'business_brief',
          resourceId: generatedBrief.id,
          resourceTitle: generatedBrief.title,
          metadata: {
            saveTime: Date.now() - startTime,
            wasEdited: hasBeenEdited,
            generationToSaveTime: Date.now() - new Date(generatedBrief.generatedAt).getTime(),
            originalGenerationTimeMs: generatedBrief.generationTimeMs,
            promptComplexity: prompt.complexityLevel,
            focusArea: prompt.focusArea,
            fieldsModified: hasBeenEdited && originalGeneration 
              ? getChangedFields(originalGeneration, generatedBrief) 
              : []
          }
        });

        onSaved(generatedBrief);
        alert('Business brief saved successfully!');
      } else {
        alert('Failed to save business brief');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save business brief. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!generatedBrief) return;

    if (confirm(`Are you sure you want to delete "${generatedBrief.title}"?`)) {
      // Track delete event
      await trackDelete({
        featureCategory: 'brief',
        resourceType: 'business_brief',
        resourceId: generatedBrief.id,
        resourceTitle: generatedBrief.title,
        metadata: {
          wasGenerated: true,
          wasEdited: hasBeenEdited,
          timeFromGeneration: Date.now() - new Date(generatedBrief.generatedAt).getTime(),
          deletedBefore: 'saving'
        }
      });

      onDeleted(generatedBrief.id);
      setGeneratedBrief(null);
      setOriginalGeneration(null);
      setHasBeenEdited(false);
    }
  };

  const buildPromptText = (prompt: GenerationPrompt): string => {
    return `Generate a comprehensive business brief for the following idea:

Business Idea: ${prompt.businessIdea}
Target Audience: ${prompt.targetAudience}
Business Unit: ${prompt.businessUnit}
Strategic Theme: ${prompt.strategicTheme}
Complexity Level: ${prompt.complexityLevel}
Focus Area: ${prompt.focusArea}
Additional Context: ${prompt.additionalContext}

Please provide a detailed business brief with all necessary sections including objectives, scope, impact analysis, and technology considerations.`;
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'would', 'could', 'should', 'please', 'generate'].includes(word));
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => frequency[word] = (frequency[word] || 0) + 1);
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 10);
  };

  const getChangedFields = (original: GeneratedBrief, updated: GeneratedBrief): string[] => {
    const changes: string[] = [];
    Object.keys(updated).forEach(key => {
      if (JSON.stringify(original[key as keyof GeneratedBrief]) !== JSON.stringify(updated[key as keyof GeneratedBrief])) {
        changes.push(key);
      }
    });
    return changes;
  };

  return (
    <div className="space-y-6">
      {/* Generation Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Business Brief Generator</span>
          </CardTitle>
          <CardDescription>
            Provide details about your business idea to generate a comprehensive brief
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="businessIdea">Business Idea *</Label>
              <Textarea
                id="businessIdea"
                value={prompt.businessIdea}
                onChange={(e) => handlePromptChange('businessIdea', e.target.value)}
                placeholder="Describe your business idea, problem to solve, or opportunity to pursue..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={prompt.targetAudience}
                onChange={(e) => handlePromptChange('targetAudience', e.target.value)}
                placeholder="Who will benefit from this solution?"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="businessUnit">Business Unit</Label>
              <Input
                id="businessUnit"
                value={prompt.businessUnit}
                onChange={(e) => handlePromptChange('businessUnit', e.target.value)}
                placeholder="Which business unit will own this?"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="strategicTheme">Strategic Theme</Label>
              <Input
                id="strategicTheme"
                value={prompt.strategicTheme}
                onChange={(e) => handlePromptChange('strategicTheme', e.target.value)}
                placeholder="How does this align with strategy?"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="complexityLevel">Complexity Level</Label>
              <Select
                value={prompt.complexityLevel}
                onValueChange={(value) => handlePromptChange('complexityLevel', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="focusArea">Focus Area</Label>
              <Select
                value={prompt.focusArea}
                onValueChange={(value) => handlePromptChange('focusArea', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="innovation">Innovation</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="cost_reduction">Cost Reduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="additionalContext">Additional Context</Label>
              <Textarea
                id="additionalContext"
                value={prompt.additionalContext}
                onChange={(e) => handlePromptChange('additionalContext', e.target.value)}
                placeholder="Any additional context, constraints, or requirements..."
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.businessIdea.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Business Brief
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Brief */}
      {generatedBrief && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Generated Business Brief</span>
                {hasBeenEdited && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Edited
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{generatedBrief.generationTimeMs}ms</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="border-green-200 text-green-700 hover:bg-green-100"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={generatedBrief.title}
                  onChange={(e) => handleBriefChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={generatedBrief.priority}
                  onValueChange={(value) => handleBriefChange('priority', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={generatedBrief.description}
                  onChange={(e) => handleBriefChange('description', e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="businessObjective">Business Objective</Label>
                <Textarea
                  id="businessObjective"
                  value={generatedBrief.businessObjective}
                  onChange={(e) => handleBriefChange('businessObjective', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mock functions - replace with actual API calls
async function generateBusinessBrief(prompt: GenerationPrompt): Promise<Partial<GeneratedBrief>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  return {
    title: `${prompt.businessIdea.slice(0, 50)}...`,
    description: `Generated business brief for: ${prompt.businessIdea}`,
    businessOwner: 'Generated Owner',
    leadBusinessUnit: prompt.businessUnit || 'Digital Transformation',
    primaryStrategicTheme: prompt.strategicTheme || 'Digital Innovation',
    businessObjective: `Implement ${prompt.businessIdea} to improve ${prompt.focusArea}`,
    quantifiableBusinessOutcomes: 'Expected 20% improvement in efficiency',
    inScope: 'Core functionality and basic features',
    outOfScope: 'Advanced features and integrations',
    impactOfDoNothing: 'Continued inefficiencies and missed opportunities',
    happyPath: 'Successful implementation and adoption',
    exceptions: 'Edge cases and error scenarios',
    impactedEndUsers: prompt.targetAudience || 'Internal users',
    changeImpactExpected: 'Moderate change management required',
    impactToOtherDepartments: 'Minimal impact to other departments',
    impactsExistingTechnology: false,
    technologySolutions: 'Cloud-based solution',
    relevantBusinessOwners: 'Business stakeholders',
    otherTechnologyInfo: 'Standard technology stack',
    priority: 'medium',
    workflowType: 'new_system'
  };
}

async function saveBusinessBrief(brief: GeneratedBrief): Promise<{ success: boolean }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}
