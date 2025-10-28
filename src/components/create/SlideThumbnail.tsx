import { Check, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import type { Slide } from '@/types/post';

interface SlideThumbnailProps {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export const SlideThumbnail = ({ slide, isActive, onClick, onRemove }: SlideThumbnailProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasCaption = slide.caption.trim().length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex-shrink-0"
      {...attributes}
      {...listeners}
    >
      <button
        onClick={onClick}
        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
          isActive 
            ? 'border-brand-accent shadow-md' 
            : 'border-border-light hover:border-border-medium'
        }`}
        aria-label={`Select slide ${slide.order + 1}`}
      >
        <img
          src={slide.imageUrl}
          alt={slide.altText || `Slide ${slide.order + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Caption indicator */}
        {hasCaption && (
          <div className="absolute bottom-1 right-1 bg-success rounded-full p-0.5">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Slide number */}
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
          {slide.order + 1}
        </div>
      </button>

      {/* Remove button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove slide ${slide.order + 1}`}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};
