"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Building2,
  Target,
  Lightbulb,
  RefreshCw,
  Trash2,
  Eye,
  Edit3,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BusinessBrief {
  id: string;
  title: string;
  description?: string;
  businessObjective?: string;
  businessBriefId: string;
  status: string;
  priority: string;
  submittedBy?: string;
  businessOwner?: string;
  leadBusinessUnit?: string;
  primaryStrategicTheme?: string;
  submittedAt?: Date;
  completionPercentage?: number;
  workflowStage?: string;
}

interface IdeasTableProps {
  businessBriefs: BusinessBrief[];
  generatingInitiatives: Record<string, boolean>;
  onView: (brief: BusinessBrief) => void;
  onEdit: (brief: BusinessBrief) => void;
  onDelete: (brief: BusinessBrief) => void;
  onStatusChange: (id: string, status: string) => void;
  onGenerateInitiatives: (id: string) => void;
}

export function IdeasTable({
  businessBriefs,
  generatingInitiatives,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onGenerateInitiatives
}: IdeasTableProps) {
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuBrief, setContextMenuBrief] = useState<BusinessBrief | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} className="text-green-600" />;
      case 'in_review': return <Clock size={14} className="text-blue-600" />;
      case 'rejected': return <AlertCircle size={14} className="text-red-600" />;
      default: return <FileText size={14} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      submitted: 'bg-blue-100 text-blue-700 border-blue-300',
      in_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300'
    };
    return `px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600 border-gray-300',
      medium: 'bg-blue-100 text-blue-600 border-blue-300',
      high: 'bg-orange-100 text-orange-600 border-orange-300',
      critical: 'bg-red-100 text-red-600 border-red-300'
    };
    return `px-2 py-1 text-xs rounded-full border ${styles[priority as keyof typeof styles] || styles.medium}`;
  };

  const formatDateForDisplay = (date?: Date) => {
    if (!date) return 'Not specified';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleContextMenu = (e: React.MouseEvent, brief: BusinessBrief) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuBrief(brief);
  };

  const handleDoubleClick = (brief: BusinessBrief) => {
    onEdit(brief);
  };

  const renderActionButtons = (brief: BusinessBrief) => {
    return (
      <div className="flex items-center gap-2">
        {/* Primary Action - Always show Generate Initiatives button */}
        <Button 
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onGenerateInitiatives(brief.id);
          }}
          disabled={brief.status !== 'approved' || generatingInitiatives[brief.id]}
          className={`h-7 px-2 text-xs flex items-center gap-1 min-w-32 ${
            brief.status === 'approved' 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={brief.status !== 'approved' ? "Brief must be approved to generate initiatives" : 
                 generatingInitiatives[brief.id] ? "Generating..." : "Generate Initiatives"}
        >
          {generatingInitiatives[brief.id] ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Lightbulb size={12} />
              <span>Generate Initiatives</span>
            </>
          )}
        </Button>

        {/* Three Dots Menu for Other Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(brief)}>
              <Eye size={12} className="mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(brief)}>
              <Edit3 size={12} className="mr-2" />
              Edit Brief
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(brief)} 
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={12} className="mr-2" />
              Delete Brief
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText size={18} className="text-blue-600" />
            Business Briefs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 sticky top-0 z-10">
            <div className="flex-1 min-w-0">Brief</div>
            <div className="w-18 text-center">Priority</div>
            <div className="w-18 text-center">Status</div>
            <div className="w-20 text-center">Owner</div>
            <div className="w-20 text-center">Progress</div>
            <div className="w-48 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="max-h-[600px] overflow-y-auto">
            {businessBriefs.map((brief) => (
              <div
                key={brief.id}
                className="group flex items-center px-3 py-2 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                onContextMenu={(e) => handleContextMenu(e, brief)}
                onDoubleClick={() => handleDoubleClick(brief)}
                onClick={() => onView(brief)}
                title="Double-click to edit"
              >
                {/* Brief Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(brief.status)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {brief.title}
                        </span>
                        {generatingInitiatives[brief.id] && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 animate-pulse">
                            <RefreshCw size={8} className="animate-spin mr-1" />
                            Gen...
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs font-mono px-1 py-0">
                          {brief.businessBriefId}
                        </Badge>
                        {brief.leadBusinessUnit && (
                          <>
                            <Building2 size={9} />
                            <span className="truncate max-w-24 text-xs">{brief.leadBusinessUnit}</span>
                          </>
                        )}
                        {brief.primaryStrategicTheme && (
                          <>
                            <Target size={9} />
                            <span className="truncate max-w-24 text-xs">{brief.primaryStrategicTheme}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="w-18 flex justify-center">
                  <span className={getPriorityBadge(brief.priority)}>
                    {brief.priority}
                  </span>
                </div>

                {/* Status with Inline Edit */}
                <div className="w-18 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={brief.status}
                    onValueChange={(value) => onStatusChange(brief.id, value)}
                  >
                    <SelectTrigger className="h-6 w-16 text-xs border border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
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

                {/* Owner */}
                <div className="w-20 text-xs text-gray-600 text-center truncate">
                  {brief.businessOwner || brief.submittedBy || 'Unassigned'}
                </div>

                {/* Progress */}
                <div className="w-20 flex justify-center items-center">
                  {brief.completionPercentage ? (
                    <div className="flex items-center gap-1 w-full max-w-14">
                      <Progress value={brief.completionPercentage} className="h-1 flex-1" />
                      <span className="text-xs text-gray-500 min-w-fit">
                        {brief.completionPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>

                {/* Actions */}
                <div className="w-48 flex justify-center">
                  {renderActionButtons(brief)}
                </div>
              </div>
            ))}

            {businessBriefs.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No business briefs found</h3>
                <p className="text-gray-600">Get started by creating your first business brief</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context Menu Portal */}
      {contextMenuPosition && contextMenuBrief && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
          style={{ 
            left: contextMenuPosition.x, 
            top: contextMenuPosition.y,
            transform: 'translate(-50%, -10px)'
          }}
          onMouseLeave={() => {
            setContextMenuPosition(null);
            setContextMenuBrief(null);
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onView(contextMenuBrief);
              setContextMenuPosition(null);
              setContextMenuBrief(null);
            }}
          >
            <Eye size={12} />
            View Details
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              onEdit(contextMenuBrief);
              setContextMenuPosition(null);
              setContextMenuBrief(null);
            }}
          >
            <Edit3 size={12} />
            Edit Brief
          </button>
          {contextMenuBrief.status === 'approved' && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                onGenerateInitiatives(contextMenuBrief.id);
                setContextMenuPosition(null);
                setContextMenuBrief(null);
              }}
              disabled={generatingInitiatives[contextMenuBrief.id]}
            >
              <Lightbulb size={12} />
              Generate Initiatives
            </button>
          )}
          <hr className="my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={() => {
              onDelete(contextMenuBrief);
              setContextMenuPosition(null);
              setContextMenuBrief(null);
            }}
          >
            <Trash2 size={12} />
            Delete Brief
          </button>
        </div>
      )}
    </>
  );
}
