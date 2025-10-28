import { useState } from 'react';
import { ChevronLeft, Check, Tag, MapPin, User, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import type { Slide, TaggedUser } from '@/types/post';
import { AVAILABLE_TAGS, MAX_TAGS, MAX_TAGGED_USERS, MAX_LOCATION_LENGTH } from '@/types/post';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PublishPageProps {
  slides: Slide[];
  tags: string[];
  isAIGenerated: boolean;
  visibility: 'public' | 'followers';
  location: string;
  taggedUsers: TaggedUser[];
  onTagsChange: (tags: string[]) => void;
  onAIGeneratedChange: (value: boolean) => void;
  onVisibilityChange: (value: 'public' | 'followers') => void;
  onLocationChange: (location: string) => void;
  onTaggedUsersChange: (users: TaggedUser[]) => void;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export const PublishPage = ({
  slides,
  tags,
  isAIGenerated,
  visibility,
  location,
  taggedUsers,
  onTagsChange,
  onAIGeneratedChange,
  onVisibilityChange,
  onLocationChange,
  onTaggedUsersChange,
  onBack,
  onPublish,
  isPublishing,
}: PublishPageProps) => {
  const { toast } = useToast();
  const [tagSelectOpen, setTagSelectOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<TaggedUser[]>([]);

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

  const handleSearchUsers = async (query: string) => {
    setUserSearchQuery(query);
    if (query.trim().length < 2) {
      setUserSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setUserSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
    }
  };

  const handleAddTaggedUser = (user: TaggedUser) => {
    if (taggedUsers.length >= MAX_TAGGED_USERS) {
      toast({
        title: 'Tag limit reached',
        description: `Maximum ${MAX_TAGGED_USERS} people can be tagged`,
        variant: 'destructive',
      });
      return;
    }

    if (taggedUsers.find((u) => u.id === user.id)) {
      toast({
        title: 'Already tagged',
        description: `@${user.username} is already tagged`,
        variant: 'destructive',
      });
      return;
    }

    onTaggedUsersChange([...taggedUsers, user]);
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleRemoveTaggedUser = (userId: string) => {
    onTaggedUsersChange(taggedUsers.filter((u) => u.id !== userId));
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

    // Check for missing alt text (Instagram 2025 standard)
    const slidesWithoutAltText = slides.filter((s) => !s.altText.trim());
    if (slidesWithoutAltText.length > 0) {
      toast({
        title: 'Alt text required',
        description: `Please add alt text to all ${slidesWithoutAltText.length} slide(s) for accessibility`,
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

          {/* Location Section - Instagram 2025 Feature */}
          <section className="space-y-3">
            <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (optional)
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Add location..."
              value={location}
              onChange={(e) => onLocationChange(e.target.value.slice(0, MAX_LOCATION_LENGTH))}
              maxLength={MAX_LOCATION_LENGTH}
              className="w-full"
            />
            <p className="text-xs text-text-tertiary">
              {location.length}/{MAX_LOCATION_LENGTH} characters
            </p>
          </section>

          {/* Tag People Section - Instagram 2025 Feature */}
          <section className="space-y-3">
            <Label htmlFor="tag-people" className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Tag People (optional)
            </Label>
            
            {/* Tagged Users Display */}
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {taggedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-2"
                  >
                    <span>@{user.username}</span>
                    <button
                      onClick={() => handleRemoveTaggedUser(user.id)}
                      className="hover:text-error"
                      aria-label={`Remove @${user.username}`}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* User Search Input */}
            {taggedUsers.length < MAX_TAGGED_USERS && (
              <div className="relative">
                <Input
                  id="tag-people"
                  type="text"
                  placeholder="Search username..."
                  value={userSearchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="w-full"
                />
                
                {/* Search Results Dropdown */}
                {userSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border-light rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {userSearchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddTaggedUser(user)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-bg-secondary transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-text-tertiary" />
                          )}
                        </div>
                        <span className="font-medium">@{user.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {taggedUsers.length >= MAX_TAGGED_USERS && (
              <p className="text-sm text-text-tertiary">
                Max {MAX_TAGGED_USERS} people can be tagged
              </p>
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
