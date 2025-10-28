import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MAX_CAPTION_LENGTH } from '@/types/post';

interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: string, altText: string) => void;
  initialCaption: string;
  initialAltText: string;
  slideNumber: number;
}

export const CaptionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCaption, 
  initialAltText,
  slideNumber 
}: CaptionModalProps) => {
  const [caption, setCaption] = useState(initialCaption);
  const [altText, setAltText] = useState(initialAltText);

  useEffect(() => {
    setCaption(initialCaption);
    setAltText(initialAltText);
  }, [initialCaption, initialAltText, isOpen]);

  const handleSave = () => {
    onSave(caption, altText);
    onClose();
  };

  const isOverLimit = caption.length > MAX_CAPTION_LENGTH;
  const canSave = !isOverLimit && altText.trim().length > 0;

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
          {/* Alt Text - Required */}
          <div className="space-y-2">
            <Label htmlFor="alt-text" className="flex items-center gap-2">
              Alt text <span className="text-error">*</span>
              {!altText.trim() && (
                <span className="text-xs text-error">(required for accessibility)</span>
              )}
            </Label>
            <TextareaAutosize
              id="alt-text"
              placeholder="Describe this image for screen readers..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              maxLength={200}
              minRows={2}
              maxRows={4}
              className={`flex w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                !altText.trim() ? 'border-error' : 'border-border-medium'
              }`}
            />
            <p className="text-xs text-text-tertiary text-right">
              {altText.length}/200
            </p>
          </div>

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

          {/* Help Text */}
          <div className="flex items-start gap-2 p-3 bg-bg-secondary rounded-lg">
            <span className="text-lg">💡</span>
            <p className="text-sm text-text-secondary">
              Tip: Keep it concise. Users can swipe to the next slide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
