import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';

export interface GenerationPromptData {
  quantity: number;
  additionalContext: string;
}

interface GenerationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: GenerationPromptData) => void;
  parentType: 'Initiative' | 'Feature' | 'Epic' | 'BusinessBrief';
  targetType: 'Initiative' | 'Feature' | 'Epic' | 'Story';
  parentTitle?: string;
  isLoading?: boolean;
}

const getDefaultQuantity = (targetType: string): number => {
  switch (targetType) {
    case 'Initiative': return 3;
    case 'Feature': return 4;
    case 'Epic': return 3;
    case 'Story': return 5;
    default: return 3;
  }
};

const getMaxQuantity = (targetType: string): number => {
  switch (targetType) {
    case 'Initiative': return 8;
    case 'Feature': return 10;
    case 'Epic': return 8;
    case 'Story': return 12;
    default: return 8;
  }
};

export function GenerationPromptModal({
  isOpen,
  onClose,
  onContinue,
  parentType,
  targetType,
  parentTitle,
  isLoading = false
}: GenerationPromptModalProps) {
  const [quantity, setQuantity] = useState(getDefaultQuantity(targetType));
  const [additionalContext, setAdditionalContext] = useState('');
  
  const minQuantity = 1;
  const maxQuantity = getMaxQuantity(targetType);

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= minQuantity && num <= maxQuantity) {
      setQuantity(num);
    }
  };

  const handleContinue = () => {
    onContinue({
      quantity,
      additionalContext: additionalContext.trim()
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate {targetType}s
          </DialogTitle>
          <DialogDescription>
            {parentTitle && (
              <span className="block mb-2">
                From {parentType}: <strong>{parentTitle}</strong>
              </span>
            )}
            Configure your generation preferences before creating {targetType.toLowerCase()}s.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              How many {targetType.toLowerCase()}s would you like to generate?
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="quantity"
                type="number"
                min={minQuantity}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-20"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-500">
                (min: {minQuantity}, max: {maxQuantity})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">
              Additional Context <span className="text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="context"
              placeholder={`Any specific requirements, constraints, or guidance for generating ${targetType.toLowerCase()}s...`}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={6}
              className="resize-none min-h-32"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={isLoading}
            className="bg-black hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate {quantity} {targetType}{quantity !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
