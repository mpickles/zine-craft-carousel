import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MAX_CAPTION_LENGTH } from '@/types/post';

interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: string) => void;
  initialCaption: string;
  slideNumber: number;
}

export const CaptionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCaption, 
  slideNumber 
}: CaptionModalProps) => {
  const [caption, setCaption] = useState(initialCaption);

  useEffect(() => {
    setCaption(initialCaption);
  }, [initialCaption, isOpen]);

  const handleSave = () => {
    onSave(caption);
    onClose();
  };

  const isOverLimit = caption.length > MAX_CAPTION_LENGTH;
  const canSave = !isOverLimit;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-bg-elevated rounded-xl shadow-lg w-full max-w-[500px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-text-primary">
            Caption (Slide {slideNumber})
          </h2>
          <Button 
            variant="default" 
            size="icon" 
            onClick={handleSave} 
            disabled={!canSave}
            aria-label="Save"
          >
            <Check className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <TextareaAutosize
              id="caption"
              placeholder="Write a caption for this slide..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              minRows={4}
              maxRows={10}
              className={`flex w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                isOverLimit ? 'border-error' : 'border-border-medium'
              }`}
            />
            <p className={`text-xs text-right ${isOverLimit ? 'text-error' : 'text-text-tertiary'}`}>
              {caption.length} / {MAX_CAPTION_LENGTH.toLocaleString()} characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
