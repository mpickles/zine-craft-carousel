import { useRef } from 'react';
import { X, ChevronRight, Edit, MessageSquare, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { SlideThumbnail } from './SlideThumbnail';
import { ImageEditModal } from './ImageEditModal';
import { CaptionModal } from './CaptionModal';
import type { Slide, ImageEdits } from '@/types/post';
import { MAX_SLIDES, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, DEFAULT_IMAGE_EDITS } from '@/types/post';
import { useToast } from '@/hooks/use-toast';

interface CarouselBuilderProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlidesChange: (slides: Slide[]) => void;
  onCurrentSlideChange: (index: number) => void;
  onNext: () => void;
  onCancel: () => void;
  editModalOpen: boolean;
  captionModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  setCaptionModalOpen: (open: boolean) => void;
}

export const CarouselBuilder = ({
  slides,
  currentSlideIndex,
  onSlidesChange,
  onCurrentSlideChange,
  onNext,
  onCancel,
  editModalOpen,
  captionModalOpen,
  setEditModalOpen,
  setCaptionModalOpen,
}: CarouselBuilderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentSlide = slides[currentSlideIndex];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);

      const reorderedSlides = arrayMove(slides, oldIndex, newIndex).map((slide, idx) => ({
        ...slide,
        order: idx,
      }));

      onSlidesChange(reorderedSlides);

      // Update current slide index if the active slide was current
      if (oldIndex === currentSlideIndex) {
        onCurrentSlideChange(newIndex);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (slides.length + files.length > MAX_SLIDES) {
      toast({
        title: 'Too many slides',
        description: `Max ${MAX_SLIDES} slides allowed`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles: Slide[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format`,
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        continue;
      }

      // Create preview URL
      const imageUrl = URL.createObjectURL(file);

      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageFile: file,
        imageUrl,
        caption: '',
        altText: '',
        order: slides.length + validFiles.length,
        edits: DEFAULT_IMAGE_EDITS,
      });
    }

    if (validFiles.length > 0) {
      onSlidesChange([...slides, ...validFiles]);
      toast({
        title: 'Images added',
        description: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added successfully`,
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveSlide = (slideId: string) => {
    const updatedSlides = slides
      .filter((s) => s.id !== slideId)
      .map((slide, idx) => ({ ...slide, order: idx }));

    onSlidesChange(updatedSlides);

    // Adjust current slide index
    if (currentSlideIndex >= updatedSlides.length) {
      onCurrentSlideChange(Math.max(0, updatedSlides.length - 1));
    }

    toast({
      title: 'Slide removed',
      description: 'Slide deleted successfully',
    });
  };

  const handleSaveEdits = (edits: ImageEdits) => {
    const updatedSlides = slides.map((slide, idx) =>
      idx === currentSlideIndex ? { ...slide, edits } : slide
    );
    onSlidesChange(updatedSlides);
  };

  const handleSaveCaption = (caption: string, altText: string) => {
    const updatedSlides = slides.map((slide, idx) =>
      idx === currentSlideIndex ? { ...slide, caption, altText } : slide
    );
    onSlidesChange(updatedSlides);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-light bg-bg-elevated shadow-sm">
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">New Post</h1>
        <Button 
          variant="default" 
          onClick={onNext} 
          disabled={slides.length === 0}
          aria-label="Next"
          className="min-w-[100px]"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {slides.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-32 h-32 rounded-full bg-bg-tertiary flex items-center justify-center mb-6">
              <Plus className="w-16 h-16 text-text-tertiary" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">
              Create Your First Slide
            </h2>
            <p className="text-text-secondary mb-6 max-w-md">
              Upload images to start creating your carousel post
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Images
            </Button>
          </div>
        ) : (
          <>
            {/* Preview Area - Fixed Aspect Ratio */}
            <div className="flex-1 flex items-center justify-center p-6 bg-bg-secondary overflow-hidden">
              <div className="w-full max-w-md">
                {/* Fixed 4:5 aspect ratio card */}
                <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                  <div className="absolute inset-0 bg-bg-primary rounded-xl overflow-hidden shadow-lg border border-border-light">
                    {currentSlide && (
                      <img
                        src={currentSlide.imageUrl}
                        alt={currentSlide.altText || `Slide ${currentSlideIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                
                {/* Slide Counter */}
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-text-secondary">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 py-4 px-6 border-t border-border-light bg-bg-elevated">
              <Button
                variant="outline"
                size="default"
                onClick={() => setEditModalOpen(true)}
                disabled={!currentSlide}
                className="min-w-[140px]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Image
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => setCaptionModalOpen(true)}
                disabled={!currentSlide}
                className="min-w-[140px]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Caption
              </Button>
            </div>

            {/* Bottom Tray - With Proper Padding */}
            <div className="border-t border-border-light bg-bg-elevated px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={slides.map((s) => s.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {slides.map((slide, idx) => (
                        <SlideThumbnail
                          key={slide.id}
                          slide={slide}
                          isActive={idx === currentSlideIndex}
                          onClick={() => onCurrentSlideChange(idx)}
                          onRemove={() => handleRemoveSlide(slide.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Add Button */}
                  {slides.length < MAX_SLIDES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-border-medium hover:border-brand-accent hover:bg-bg-secondary transition-all flex items-center justify-center group"
                      aria-label="Add more slides"
                    >
                      <Plus className="w-8 h-8 text-text-tertiary group-hover:text-brand-accent transition-colors" />
                    </button>
                  )}
                </div>
                
                {/* Helper Text */}
                <p className="text-xs text-text-tertiary text-center mt-2">
                  Click thumbnails to edit • Drag to reorder • Max {MAX_SLIDES} slides
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modals */}
      {currentSlide && (
        <>
          <ImageEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveEdits}
            imageUrl={currentSlide.imageUrl}
            initialEdits={currentSlide.edits}
          />
          <CaptionModal
            isOpen={captionModalOpen}
            onClose={() => setCaptionModalOpen(false)}
            onSave={handleSaveCaption}
            initialCaption={currentSlide.caption}
            initialAltText={currentSlide.altText}
            slideNumber={currentSlideIndex + 1}
          />
        </>
      )}
    </div>
  );
};
