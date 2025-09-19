"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Building2, 
  Search, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  businessBriefId: string;
  portfolioId?: string | null;
  assignedTo?: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  function: string;
  color?: string;
}

interface PortfolioMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiatives: Initiative[];
  portfolios: Portfolio[];
  onSave: (mappings: Record<string, string>) => Promise<void>;
}

export function PortfolioMappingModal({
  isOpen,
  onClose,
  initiatives,
  portfolios,
  onSave
}: PortfolioMappingModalProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize mappings with current portfolio assignments
  useEffect(() => {
    const initialMappings: Record<string, string> = {};
    initiatives.forEach(initiative => {
      if (initiative.portfolioId) {
        initialMappings[initiative.id] = initiative.portfolioId;
      }
    });
    setMappings(initialMappings);
  }, [initiatives]);

  // Filter initiatives
  const filteredInitiatives = initiatives.filter(initiative => {
    const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedPortfolio === 'all') return matchesSearch;
    if (selectedPortfolio === 'unassigned') return matchesSearch && !mappings[initiative.id];
    return matchesSearch && mappings[initiative.id] === selectedPortfolio;
  });

  // Group initiatives by current portfolio assignment
  const groupedInitiatives = filteredInitiatives.reduce((groups, initiative) => {
    const portfolioId = mappings[initiative.id] || 'unassigned';
    if (!groups[portfolioId]) {
      groups[portfolioId] = [];
    }
    groups[portfolioId].push(initiative);
    return groups;
  }, {} as Record<string, Initiative[]>);

  const handleMappingChange = (initiativeId: string, portfolioId: string) => {
    setMappings(prev => ({
      ...prev,
      [initiativeId]: portfolioId === 'unassigned' ? '' : portfolioId
    }));
    setSaved(false);
  };

  const handleBulkAssign = (portfolioId: string) => {
    const updatedMappings = { ...mappings };
    filteredInitiatives.forEach(initiative => {
      updatedMappings[initiative.id] = portfolioId === 'unassigned' ? '' : portfolioId;
    });
    setMappings(updatedMappings);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(mappings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save portfolio mappings:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPortfolioName = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    return portfolio?.name || 'Unassigned';
  };

  const getAssignmentStats = () => {
    const assigned = Object.values(mappings).filter(Boolean).length;
    const unassigned = initiatives.length - assigned;
    return { assigned, unassigned, total: initiatives.length };
  };

  const stats = getAssignmentStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            Portfolio Assignment Mapping
            {saved && <CheckCircle className="w-5 h-5 text-green-600" />}
          </DialogTitle>
          <DialogDescription>
            Assign initiatives to portfolios. This will update the database with your assignments.
          </DialogDescription>
        </DialogHeader>

        {/* Stats and Controls */}
        <div className="space-y-4 mt-4">
          {/* Assignment Stats */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total: {stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Assigned: {stats.assigned}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm">Unassigned: {stats.unassigned}</span>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search initiatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter by Portfolio */}
            <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Initiatives</SelectItem>
                <SelectItem value="unassigned">Unassigned Only</SelectItem>
                {portfolios.map(portfolio => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            <Select onValueChange={handleBulkAssign}>
              <SelectTrigger>
                <SelectValue placeholder="Bulk assign visible..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Remove Portfolio</SelectItem>
                {portfolios.map(portfolio => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    Assign to {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Initiative List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedInitiatives).map(([portfolioId, groupInitiatives]) => (
            <Card key={portfolioId} className="border-l-4" style={{ borderLeftColor: portfolios.find(p => p.id === portfolioId)?.color || '#gray' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {getPortfolioName(portfolioId)}
                  <Badge variant="outline" className="text-xs">
                    {groupInitiatives.length} initiatives
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupInitiatives.map(initiative => (
                  <div key={initiative.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-yellow-600" />
                        <span className="font-medium text-sm truncate">{initiative.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {initiative.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {initiative.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {initiative.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Select 
                        value={mappings[initiative.id] || 'unassigned'} 
                        onValueChange={(value) => handleMappingChange(initiative.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select portfolio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-gray-500">No Portfolio</span>
                          </SelectItem>
                          {portfolios.map(portfolio => (
                            <SelectItem key={portfolio.id} value={portfolio.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: portfolio.color || '#gray' }}
                                />
                                {portfolio.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {filteredInitiatives.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No initiatives match your current filters</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {Object.keys(mappings).filter(id => mappings[id]).length} of {initiatives.length} initiatives assigned
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="min-w-24"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Assignments
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
