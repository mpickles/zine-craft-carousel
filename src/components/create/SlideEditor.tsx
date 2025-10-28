import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Slide } from "@/pages/CreatePost";

interface SlideEditorProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
}

export const SlideEditor = ({ slides, onSlidesChange }: SlideEditorProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = slides[currentSlideIndex];

  const updateSlide = (updates: Partial<Slide>) => {
    const updatedSlides = slides.map((slide, idx) =>
      idx === currentSlideIndex ? { ...slide, ...updates } : slide
    );
    onSlidesChange(updatedSlides);
  };

  const goToPrevious = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Slide Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPrevious}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          Slide {currentSlideIndex + 1} of {slides.length}
        </span>
        <Button variant="outline" size="icon" onClick={goToNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Slide Preview & Editor */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <Label className="mb-2 block">Preview</Label>
          <Card className="aspect-square overflow-hidden">
            <img
              src={currentSlide.preview}
              alt={`Slide ${currentSlideIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </Card>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={currentSlide.template}
              onValueChange={(value: any) => updateSlide({ template: value })}
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image-full">Image Full</SelectItem>
                <SelectItem value="image-note">Image + Note</SelectItem>
                <SelectItem value="quote">Quote Card</SelectItem>
                <SelectItem value="side-by-side">Side by Side</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how this slide is displayed
            </p>
          </div>

          {/* Alt Text for Accessibility */}
          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt text (accessibility)</Label>
            <Textarea
              id="alt-text"
              placeholder="Describe this image for screen readers..."
              value={currentSlide.altText || ""}
              onChange={(e) => updateSlide({ altText: e.target.value })}
              maxLength={200}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(currentSlide.altText || "").length}/200
            </p>
          </div>

          {/* Per-Slide Caption */}
          <div className="space-y-2">
            <Label htmlFor="slide-caption">Caption for this slide</Label>
            <Textarea
              id="slide-caption"
              placeholder="Add a caption for this specific slide..."
              value={currentSlide.caption}
              onChange={(e) => updateSlide({ caption: e.target.value })}
              maxLength={500}
              rows={6}
            />
            <p className="text-xs text-muted-foreground text-right">
              {currentSlide.caption.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Slide Dots */}
      <div className="flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentSlideIndex ? "bg-primary" : "bg-muted"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
