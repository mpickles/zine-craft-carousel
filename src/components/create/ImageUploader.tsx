import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { Slide } from "@/pages/CreatePost";

interface ImageUploaderProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
}

const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ImageUploader = ({ slides, onSlidesChange }: ImageUploaderProps) => {
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

  const removeSlide = (id: string) => {
    const updatedSlides = slides
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx }));
    onSlidesChange(updatedSlides);
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
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
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

      {/* Image Previews */}
      {slides.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              draggable
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
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  Slide {index + 1}
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(slide.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {slides.length} / {MAX_IMAGES} images • Drag to reorder
        </p>
      )}
    </div>
  );
};
