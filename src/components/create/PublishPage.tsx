import { useState } from 'react';
import { ChevronLeft, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Slide } from '@/types/post';
import { AVAILABLE_TAGS, MAX_TAGS } from '@/types/post';
import { useToast } from '@/hooks/use-toast';

interface PublishPageProps {
  slides: Slide[];
  tags: string[];
  isAIGenerated: boolean;
  visibility: 'public' | 'followers';
  onTagsChange: (tags: string[]) => void;
  onAIGeneratedChange: (value: boolean) => void;
  onVisibilityChange: (value: 'public' | 'followers') => void;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export const PublishPage = ({
  slides,
  tags,
  isAIGenerated,
  visibility,
  onTagsChange,
  onAIGeneratedChange,
  onVisibilityChange,
  onBack,
  onPublish,
  isPublishing,
}: PublishPageProps) => {
  const { toast } = useToast();
  const [tagSelectOpen, setTagSelectOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    if (tags.length >= MAX_TAGS) {
      toast({
        title: 'Tag limit reached',
        description: `Maximum ${MAX_TAGS} tags allowed`,
        variant: 'destructive',
      });
      return;
    }

    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setTagSelectOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handlePublishClick = () => {
    // Validation
    if (slides.length === 0) {
      toast({
        title: 'No slides',
        description: 'Add at least one slide to publish',
        variant: 'destructive',
      });
      return;
    }

    if (!slides[0].caption.trim()) {
      toast({
        title: 'Caption required',
        description: 'Please add a caption to your first slide - this is what people see in their feed',
        variant: 'destructive',
      });
      return;
    }

    onPublish();
  };

  const availableTags = AVAILABLE_TAGS.filter((tag) => !tags.includes(tag));

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-bg-elevated">
        <Button variant="ghost" onClick={onBack} aria-label="Back">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">Publish Post</h1>
        <Button
          variant="default"
          onClick={handlePublishClick}
          disabled={isPublishing || slides.length === 0}
          aria-label="Publish"
        >
          {isPublishing ? 'Publishing...' : (
            <>
              Publish <Check className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tags Section */}
          <section className="space-y-3">
            <Label className="text-base font-semibold">Tags (max {MAX_TAGS})</Label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-bg-tertiary"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>

            {/* Add Tag Button */}
            {tags.length < MAX_TAGS && (
              <Select open={tagSelectOpen} onOpenChange={setTagSelectOpen} onValueChange={handleAddTag}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Add Tag" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {tags.length >= MAX_TAGS && (
              <p className="text-sm text-text-tertiary">Max {MAX_TAGS} tags reached</p>
            )}
          </section>

          {/* AI Content Section */}
          <section className="space-y-3 p-4 bg-bg-secondary rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="ai-generated"
                checked={isAIGenerated}
                onCheckedChange={(checked) => onAIGeneratedChange(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="ai-generated" className="cursor-pointer font-medium">
                  This content is AI-generated
                </Label>
                <p className="text-sm text-text-tertiary">
                  Check this if any images were created with AI tools
                </p>
              </div>
            </div>
          </section>

          {/* Visibility Section */}
          <section className="space-y-3 p-4 bg-bg-secondary rounded-lg">
            <Label className="text-base font-semibold">Visibility</Label>
            <RadioGroup value={visibility} onValueChange={(value: any) => onVisibilityChange(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="visibility-public" />
                <Label htmlFor="visibility-public" className="font-normal cursor-pointer">
                  <span className="font-medium">Public</span> - Anyone can see this post
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="followers" id="visibility-followers" />
                <Label htmlFor="visibility-followers" className="font-normal cursor-pointer">
                  <span className="font-medium">Followers Only</span> - Only your followers can see this
                </Label>
              </div>
            </RadioGroup>
          </section>

          {/* Preview Section */}
          <section className="space-y-3">
            <Label className="text-base font-semibold">PREVIEW</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border-light"
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText || `Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 p-3 bg-bg-secondary rounded-lg">
              <span className="text-lg">💡</span>
              <p className="text-sm text-text-secondary">
                Your first slide will appear in people's feeds
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
