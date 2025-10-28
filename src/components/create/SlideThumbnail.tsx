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
      className="relative flex-shrink-0 group"
      {...attributes}
      {...listeners}
    >
      <button
        onClick={onClick}
        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
          isActive 
            ? 'border-brand-accent shadow-lg ring-2 ring-brand-accent/20' 
            : 'border-border-light hover:border-brand-accent/50 hover:shadow-md'
        }`}
        aria-label={`Select and edit slide ${slide.order + 1}`}
      >
        <img
          src={slide.imageUrl}
          alt={`Slide ${slide.order + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Active indicator overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-brand-accent/10" />
        )}
        
        {/* Status Badges */}
        <div className="absolute top-1 right-1 flex flex-col gap-1">
          {/* Caption Check */}
          {hasCaption && (
            <div className="bg-success rounded-full p-0.5 shadow-sm">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Slide number */}
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {slide.order + 1}
        </div>
        
        {/* Click hint overlay on hover */}
        <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isActive ? 'hidden' : ''}`}>
          <span className="text-white text-xs font-medium">Edit</span>
        </div>
      </button>

      {/* Remove button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
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
