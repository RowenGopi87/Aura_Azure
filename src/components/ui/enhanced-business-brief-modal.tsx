"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAudit } from "@/hooks/use-audit";
import { 
  X, 
  Eye, 
  Edit3, 
  Save, 
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Building,
  Target,
  FileText,
  Brain,
  Sparkles,
  Download,
  ExternalLink
} from "lucide-react";

interface BusinessBrief {
  id: string;
  title: string;
  description: string;
  businessOwner?: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  workflowStage?: string;
  submittedAt?: string;
  createdAt: string;
  leadBusinessUnit?: string;
  primaryStrategicTheme?: string;
  businessObjective?: string;
  quantifiableBusinessOutcomes?: string;
  inScope?: string;
  outOfScope?: string;
  impactOfDoNothing?: string;
}

interface EnhancedBusinessBriefEditModalProps {
  brief: BusinessBrief | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBrief: BusinessBrief) => void;
  onDelete?: (briefId: string) => void;
  onExport?: (brief: BusinessBrief, target: string) => void;
  onAIEnhance?: (brief: BusinessBrief) => Promise<BusinessBrief>;
}

export function EnhancedBusinessBriefEditModal({ 
  brief, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  onExport,
  onAIEnhance
}: EnhancedBusinessBriefEditModalProps) {
  const [formData, setFormData] = useState<BusinessBrief | null>(null);
  const [originalData, setOriginalData] = useState<BusinessBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const {
    trackGeneration,
    trackEdit,
    trackSave,
    trackDelete,
    trackExport,
    trackAIEnhancement,
    trackView
  } = useAudit();

  useEffect(() => {
    if (brief && isOpen) {
      setFormData({ ...brief });
      setOriginalData({ ...brief });
      setHasUnsavedChanges(false);
      
      // Track view event
      trackView({
        featureCategory: 'brief',
        resourceType: 'business_brief',
        resourceId: brief.id,
        resourceTitle: brief.title,
        metadata: { action: 'open_edit_modal' }
      });
    }
  }, [brief, isOpen, trackView]);

  const handleInputChange = (field: keyof BusinessBrief, value: string | boolean) => {
    if (formData) {
      const updatedData = {
        ...formData,
        [field]: value
      };
      
      setFormData(updatedData);
      setHasUnsavedChanges(true);
      
      // Track edit in real-time (debounced)
      if (originalData) {
        const timeoutId = setTimeout(() => {
          trackEdit({
            featureCategory: 'brief',
            action: 'field_edit',
            resourceType: 'business_brief',
            resourceId: formData.id,
            resourceTitle: formData.title,
            beforeContent: { [field]: originalData[field] },
            afterContent: { [field]: value },
            fieldsChanged: [field]
          });
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleSave = async () => {
    if (!formData || !originalData) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/business-briefs/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Track comprehensive edit event
        await trackEdit({
          featureCategory: 'brief',
          action: 'save_changes',
          resourceType: 'business_brief',
          resourceId: formData.id,
          resourceTitle: formData.title,
          beforeContent: originalData,
          afterContent: formData
        });

        // Track save event
        await trackSave({
          featureCategory: 'brief',
          resourceType: 'business_brief',
          resourceId: formData.id,
          resourceTitle: formData.title,
          metadata: {
            saveTime: Date.now() - startTime,
            hasChanges: hasUnsavedChanges,
            fieldsModified: getChangedFields(originalData, formData)
          }
        });

        onSave(formData);
        onClose();
        setHasUnsavedChanges(false);
      } else {
        alert('Failed to update business brief');
      }
    } catch (error) {
      console.error('Error updating business brief:', error);
      alert('An error occurred while updating the business brief');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData || !onDelete) return;
    
    if (confirm(`Are you sure you want to delete "${formData.title}"?`)) {
      await trackDelete({
        featureCategory: 'brief',
        resourceType: 'business_brief',
        resourceId: formData.id,
        resourceTitle: formData.title,
        metadata: { deletedFrom: 'edit_modal' }
      });
      
      onDelete(formData.id);
      onClose();
    }
  };

  const handleExport = async (target: string) => {
    if (!formData || !onExport) return;
    
    await trackExport({
      featureCategory: 'brief',
      resourceType: 'business_brief',
      resourceId: formData.id,
      resourceTitle: formData.title,
      integrationTarget: target,
      metadata: { exportedFrom: 'edit_modal' }
    });
    
    onExport(formData, target);
  };

  const handleAIEnhance = async () => {
    if (!formData || !onAIEnhance) return;
    
    setAiEnhancing(true);
    const startTime = Date.now();
    
    try {
      const enhancedBrief = await onAIEnhance(formData);
      
      // Track AI enhancement
      await trackAIEnhancement({
        featureCategory: 'brief',
        resourceType: 'business_brief',
        resourceId: formData.id,
        resourceTitle: formData.title,
        beforeContent: formData,
        afterContent: enhancedBrief,
        aiModelUsed: 'gpt-4', // This should come from the actual model used
        startTime
      });
      
      setFormData(enhancedBrief);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('AI enhancement failed. Please try again.');
    } finally {
      setAiEnhancing(false);
    }
  };

  const getChangedFields = (original: BusinessBrief, updated: BusinessBrief): string[] => {
    const changes: string[] = [];
    Object.keys(updated).forEach(key => {
      if (JSON.stringify(original[key as keyof BusinessBrief]) !== JSON.stringify(updated[key as keyof BusinessBrief])) {
        changes.push(key);
      }
    });
    return changes;
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Business Brief</h2>
              <p className="text-sm text-gray-600">
                {hasUnsavedChanges && <span className="text-orange-600">• Unsaved changes</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* AI Enhancement Button */}
            {onAIEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIEnhance}
                disabled={aiEnhancing}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                {aiEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                AI Enhance
              </Button>
            )}
            
            {/* Export Options */}
            {onExport && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('jira')}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Jira
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            )}
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter brief title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the business brief"
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
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
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-600" />
                  <span>Business Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessOwner">Business Owner</Label>
                  <Input
                    id="businessOwner"
                    value={formData.businessOwner || ''}
                    onChange={(e) => handleInputChange('businessOwner', e.target.value)}
                    placeholder="Enter business owner"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="leadBusinessUnit">Lead Business Unit</Label>
                  <Input
                    id="leadBusinessUnit"
                    value={formData.leadBusinessUnit || ''}
                    onChange={(e) => handleInputChange('leadBusinessUnit', e.target.value)}
                    placeholder="Enter lead business unit"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessObjective">Business Objective</Label>
                  <Textarea
                    id="businessObjective"
                    value={formData.businessObjective || ''}
                    onChange={(e) => handleInputChange('businessObjective', e.target.value)}
                    placeholder="Describe the business objective"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={loading || !hasUnsavedChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
