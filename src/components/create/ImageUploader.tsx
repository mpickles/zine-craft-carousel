import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { Slide } from "@/pages/CreatePost";

interface ImageUploaderProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ImageUploader = ({ 
  slides, 
  onSlidesChange,
  currentSlideIndex,
  onSlideSelect
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    // Validate total count
    if (slides.length + fileArray.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate and process files
    const validFiles: Slide[] = [];

    for (const file of fileArray) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, and WebP images are allowed`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size must be less than 10MB`);
        continue;
      }

      // Create slide
      validFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        caption: "",
        altText: "",
        template: "image-full",
        order: slides.length + validFiles.length,
      });
    }

    if (validFiles.length > 0) {
      onSlidesChange([...slides, ...validFiles]);
      toast.success(`${validFiles.length} image${validFiles.length > 1 ? "s" : ""} added`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeSlide = (id: string, index: number) => {
    const updatedSlides = slides
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx }));
    onSlidesChange(updatedSlides);
    
    // Adjust current slide index if needed
    if (currentSlideIndex >= updatedSlides.length && updatedSlides.length > 0) {
      onSlideSelect(updatedSlides.length - 1);
    } else if (updatedSlides.length === 0) {
      onSlideSelect(0);
    }
  };

  const moveSlide = (fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);
    onSlidesChange(newSlides.map((s, idx) => ({ ...s, order: idx })));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {slides.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Drag and drop images here, or click to select
          </p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG, or WebP • Max 10MB per image • Up to {MAX_IMAGES} images
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Horizontal Thumbnail Strip */}
      {slides.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {slides.length} / {MAX_IMAGES} images
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={slides.length >= MAX_IMAGES}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  index === currentSlideIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                draggable
                onClick={() => onSlideSelect(index)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                  moveSlide(fromIndex, index);
                }}
              >
                <img
                  src={slide.preview}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                  <span className="text-white text-xs font-medium">
                    {index + 1}
                  </span>
                </div>
                {!slide.altText && (
                  <div className="absolute top-1 left-1 w-2 h-2 bg-destructive rounded-full" title="Missing alt text" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSlide(slide.id, index);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Click a thumbnail to edit • Drag to reorder • Red dot = missing alt text
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
};
