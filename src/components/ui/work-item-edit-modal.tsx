"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  Layers, 
  BookOpen, 
  FileText, 
  Calendar, 
  User, 
  Flag,
  Clock,
  FileBarChart,
  Building2
} from 'lucide-react';

interface WorkItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  category?: string;
  businessBriefId: string;
  portfolioId?: string;
  assignedTo?: string;
  acceptanceCriteria?: string[];
  businessValue?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Type-specific fields
  storyPoints?: number;
  sprintEstimate?: number;
  estimatedEffort?: string;
  labels?: string[];
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  function: string;
  color?: string;
}

interface BusinessBrief {
  id: string;
  title: string;
  businessBriefId: string;
}

interface WorkItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WorkItem | null;
  type: string;
  portfolios: Portfolio[];
  businessBriefs: BusinessBrief[];
  onSave: (item: WorkItem, type: string) => void;
}

const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export function WorkItemEditModal({
  isOpen,
  onClose,
  item,
  type,
  portfolios,
  businessBriefs,
  onSave
}: WorkItemEditModalProps) {
  const [formData, setFormData] = useState<Partial<WorkItem>>({});
  const [acceptanceCriteriaText, setAcceptanceCriteriaText] = useState('');
  const [labelsText, setLabelsText] = useState('');

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: item.status,
        category: item.category,
        businessBriefId: item.businessBriefId,
        portfolioId: item.portfolioId,
        assignedTo: item.assignedTo,
        businessValue: item.businessValue,
        storyPoints: item.storyPoints,
        sprintEstimate: item.sprintEstimate,
        estimatedEffort: item.estimatedEffort,
      });
      setAcceptanceCriteriaText(item.acceptanceCriteria?.join('\n') || '');
      setLabelsText(item.labels?.join(', ') || '');
    } else {
      setFormData({});
      setAcceptanceCriteriaText('');
      setLabelsText('');
    }
  }, [item]);

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    switch (type) {
      case 'initiative': return <Target {...iconProps} style={{color: '#D4A843'}} />;
      case 'feature': return <Layers {...iconProps} style={{color: '#5B8DB8'}} />;
      case 'epic': return <BookOpen {...iconProps} style={{color: '#8B7A9B'}} />;
      case 'story': return <FileText {...iconProps} style={{color: '#7FB37C'}} />;
      default: return <FileText {...iconProps} className="text-gray-600" />;
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      return;
    }

    const acceptanceCriteria = acceptanceCriteriaText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const labels = labelsText
      .split(',')
      .filter(label => label.trim())
      .map(label => label.trim());

    const updatedItem: WorkItem = {
      ...item!,
      ...formData,
      acceptanceCriteria,
      labels: type === 'story' ? labels : undefined,
      updatedAt: new Date(),
    } as WorkItem;

    onSave(updatedItem, type);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    // Handle portfolio special case - convert "unassigned" to empty string
    const processedValue = (field === 'portfolioId' && value === 'unassigned') ? '' : value;
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTypeIcon(type)}
            <span className="capitalize">Edit {type}</span>
            <Badge variant="outline" className="ml-auto">
              {item.id}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update the details for this {type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter title"
                  className="font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              {/* Business Value */}
              <div className="space-y-2">
                <Label htmlFor="businessValue">Business Value</Label>
                <Textarea
                  id="businessValue"
                  value={formData.businessValue || ''}
                  onChange={(e) => handleInputChange('businessValue', e.target.value)}
                  placeholder="Describe the business value"
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Properties */}
            <div className="space-y-4">
              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority || ''} 
                    onValueChange={(value: any) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <Flag size={14} className="mr-2" />
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${priority.color}`}>
                              {priority.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status || ''} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <Clock size={14} className="mr-2" />
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assigned To & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo || ''}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    placeholder="Enter assignee"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
              </div>

              {/* Portfolio & Business Brief Row */}
              <div className="grid grid-cols-1 gap-4">
                {type === 'initiative' && (
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Select 
                      value={formData.portfolioId || 'unassigned'} 
                      onValueChange={(value) => handleInputChange('portfolioId', value)}
                    >
                      <SelectTrigger>
                        <Building2 size={14} className="mr-2" />
                        <SelectValue placeholder="Select portfolio" />
                      </SelectTrigger>
                                          <SelectContent>
                      <SelectItem value="unassigned">No Portfolio</SelectItem>
                        {portfolios.map(portfolio => (
                          <SelectItem key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="businessBrief">Business Brief</Label>
                  <Select 
                    value={formData.businessBriefId || ''} 
                    onValueChange={(value) => handleInputChange('businessBriefId', value)}
                  >
                    <SelectTrigger>
                      <FileBarChart size={14} className="mr-2" />
                      <SelectValue placeholder="Select business brief" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessBriefs.map(brief => (
                        <SelectItem key={brief.id} value={brief.id}>
                          {brief.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type-specific fields */}
              {(type === 'story' || type === 'epic') && (
                <div className="grid grid-cols-2 gap-4">
                  {type === 'story' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="storyPoints">Story Points</Label>
                        <Select 
                          value={formData.storyPoints?.toString() || ''} 
                          onValueChange={(value) => handleInputChange('storyPoints', parseInt(value) || 0)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select points" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 5, 8, 13, 21].map(points => (
                              <SelectItem key={points} value={points.toString()}>
                                {points}pt
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="labels">Labels</Label>
                        <Input
                          id="labels"
                          value={labelsText}
                          onChange={(e) => setLabelsText(e.target.value)}
                          placeholder="frontend, api, database"
                        />
                      </div>
                    </>
                  )}

                  {type === 'epic' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sprintEstimate">Sprint Estimate</Label>
                        <Select 
                          value={formData.sprintEstimate?.toString() || ''} 
                          onValueChange={(value) => handleInputChange('sprintEstimate', parseInt(value) || 0)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sprints" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map(sprints => (
                              <SelectItem key={sprints} value={sprints.toString()}>
                                {sprints} sprint{sprints !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedEffort">Effort</Label>
                        <Select 
                          value={formData.estimatedEffort || ''} 
                          onValueChange={(value) => handleInputChange('estimatedEffort', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select effort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Small">Small</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Large">Large</SelectItem>
                            <SelectItem value="Extra Large">XL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Created/Updated info */}
              <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>Created: {item.createdAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>Updated: {item.updatedAt?.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Criteria Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
              <Textarea
                id="acceptanceCriteria"
                value={acceptanceCriteriaText}
                onChange={(e) => setAcceptanceCriteriaText(e.target.value)}
                placeholder="Enter acceptance criteria (one per line)"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter each criterion on a new line. They will be displayed as bullet points.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title || !formData.description}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
