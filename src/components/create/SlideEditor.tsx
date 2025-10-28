import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Slide } from "@/pages/CreatePost";

interface SlideEditorProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlidesChange: (slides: Slide[]) => void;
  onSlideIndexChange: (index: number) => void;
}

export const SlideEditor = ({ 
  slides, 
  currentSlideIndex,
  onSlidesChange,
  onSlideIndexChange
}: SlideEditorProps) => {
  const currentSlide = slides[currentSlideIndex];

  const updateSlide = (updates: Partial<Slide>) => {
    const updatedSlides = slides.map((slide, idx) =>
      idx === currentSlideIndex ? { ...slide, ...updates } : slide
    );
    onSlidesChange(updatedSlides);
  };

  const goToPrevious = () => {
    onSlideIndexChange(currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1);
  };

  const goToNext = () => {
    onSlideIndexChange(currentSlideIndex < slides.length - 1 ? currentSlideIndex + 1 : 0);
  };

  return (
    <div className="space-y-6">
      {/* Slide Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <span className="text-sm font-medium">
          Editing Slide {currentSlideIndex + 1} of {slides.length}
        </span>
        <Button variant="outline" size="sm" onClick={goToNext}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Preview & Editor Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Live Preview */}
        <div className="space-y-2">
          <Label>Live Preview</Label>
          <Card className="aspect-square overflow-hidden bg-muted">
            <div className={`w-full h-full ${getTemplateStyles(currentSlide.template)}`}>
              <img
                src={currentSlide.preview}
                alt={currentSlide.altText || `Slide ${currentSlideIndex + 1}`}
                className={getImageStyles(currentSlide.template)}
              />
              {currentSlide.caption && (currentSlide.template === "image-note" || currentSlide.template === "side-by-side") && (
                <div className={getCaptionStyles(currentSlide.template)}>
                  <p className="text-sm">{currentSlide.caption}</p>
                </div>
              )}
            </div>
          </Card>
          <p className="text-xs text-muted-foreground">
            Template: {getTemplateName(currentSlide.template)}
          </p>
        </div>

        {/* Editor Controls */}
        <div className="space-y-4">
          {/* Template Selector */}
          <div className="space-y-3">
            <Label>Template</Label>
            <RadioGroup
              value={currentSlide.template}
              onValueChange={(value: any) => updateSlide({ template: value })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image-full" id="template-full" />
                <Label htmlFor="template-full" className="font-normal cursor-pointer">
                  Image-Full (full screen image)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image-note" id="template-note" />
                <Label htmlFor="template-note" className="font-normal cursor-pointer">
                  Image+Note (caption overlay)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quote" id="template-quote" />
                <Label htmlFor="template-quote" className="font-normal cursor-pointer">
                  Quote Card (text-focused)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="side-by-side" id="template-side" />
                <Label htmlFor="template-side" className="font-normal cursor-pointer">
                  Side-by-Side (split screen)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Alt Text - Required */}
          <div className="space-y-2">
            <Label htmlFor="alt-text" className="flex items-center gap-2">
              Alt text <span className="text-destructive">*</span>
              {!currentSlide.altText && (
                <span className="text-xs text-destructive">(required)</span>
              )}
            </Label>
            <Textarea
              id="alt-text"
              placeholder="Describe this image for screen readers..."
              value={currentSlide.altText || ""}
              onChange={(e) => updateSlide({ altText: e.target.value })}
              maxLength={200}
              rows={2}
              className={!currentSlide.altText ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(currentSlide.altText || "").length}/200
            </p>
          </div>

          {/* Caption for this Slide */}
          <div className="space-y-2">
            <Label htmlFor="slide-caption">Caption for this slide</Label>
            <Textarea
              id="slide-caption"
              placeholder="Add a caption for this specific slide..."
              value={currentSlide.caption}
              onChange={(e) => updateSlide({ caption: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {currentSlide.caption.length}/500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for template styling
function getTemplateStyles(template: string): string {
  switch (template) {
    case "image-full":
      return "relative";
    case "image-note":
      return "relative";
    case "quote":
      return "flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-primary/5";
    case "side-by-side":
      return "flex items-center";
    default:
      return "";
  }
}

function getImageStyles(template: string): string {
  switch (template) {
    case "image-full":
      return "w-full h-full object-cover";
    case "image-note":
      return "w-full h-full object-cover";
    case "quote":
      return "w-24 h-24 object-cover rounded-full mb-4";
    case "side-by-side":
      return "w-1/2 h-full object-cover";
    default:
      return "w-full h-full object-cover";
  }
}

function getCaptionStyles(template: string): string {
  switch (template) {
    case "image-note":
      return "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white";
    case "side-by-side":
      return "w-1/2 h-full flex items-center justify-center p-6 bg-card";
    default:
      return "";
  }
}

function getTemplateName(template: string): string {
  switch (template) {
    case "image-full":
      return "Image-Full";
    case "image-note":
      return "Image+Note";
    case "quote":
      return "Quote Card";
    case "side-by-side":
      return "Side-by-Side";
    default:
      return template;
  }
}
