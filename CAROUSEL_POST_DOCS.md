# Carousel Post Creation Flow - Documentation

## Overview
This document describes the two-page carousel post composer for Zine, which allows users to create multi-slide posts with image editing capabilities, captions, and custom settings.

---

## Architecture

### File Structure
```
src/
├── types/
│   └── post.ts                    # Type definitions for Slide, PostDraft, ImageEdits
├── pages/
│   └── CreatePost.tsx             # Main orchestrator component
├── components/create/
│   ├── CarouselBuilder.tsx        # Page 1: Slide management & preview
│   ├── PublishPage.tsx            # Page 2: Metadata & publish
│   ├── ImageEditModal.tsx         # Full-screen image editor
│   ├── CaptionModal.tsx           # Caption & alt text editor
│   └── SlideThumbnail.tsx         # Individual thumbnail with drag support
```

---

## Types & Constants

### `Slide` Interface
```typescript
interface Slide {
  id: string;                    // Unique identifier
  imageFile: File;               // Original file object
  imageUrl: string;              // Local preview URL (blob)
  uploadedUrl?: string;          // Supabase storage URL after upload
  caption: string;               // Slide-specific caption (max 2,200 chars)
  altText: string;               // Accessibility description (required)
  order: number;                 // Position in carousel (0-indexed)
  edits: ImageEdits;            // Applied transformations
}
```

### `ImageEdits` Interface
```typescript
interface ImageEdits {
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
    aspect: number | null;      // Aspect ratio (1, 4/5, 16/9, null=free)
  } | null;
  rotation: number;             // Degrees: 0, 90, 180, 270
  flipHorizontal: boolean;      // Mirror transformation
  filter: 'original' | 'bw' | 'vintage' | 'vibrant';
  adjustments: {
    brightness: number;         // 0-200 (default: 100)
    contrast: number;           // 0-200 (default: 100)
    saturation: number;         // 0-200 (default: 100)
  };
}
```

### Constants
- **MAX_SLIDES**: 12 slides per post
- **MAX_FILE_SIZE**: 10MB per image
- **MAX_CAPTION_LENGTH**: 2,200 characters
- **MAX_TAGS**: 3 tags per post
- **ALLOWED_IMAGE_TYPES**: ['image/jpeg', 'image/png', 'image/webp']

---

## Page 1: Carousel Builder

### Component: `CarouselBuilder.tsx`

#### Features
1. **Empty State**
   - Displayed when no slides exist
   - Large "Add Images" button to start

2. **Preview Area**
   - Shows current slide in large format (70% viewport height)
   - Displays slide counter: "Slide X of Y"
   - Background: `bg-bg-secondary`

3. **Action Buttons**
   - **Edit Image**: Opens `ImageEditModal`
   - **Add Caption**: Opens `CaptionModal`
   - Disabled when no slide is selected

4. **Bottom Tray**
   - Horizontal scrollable strip of thumbnails
   - Drag-to-reorder using `@dnd-kit/sortable`
   - **[+] Button**: Opens file picker for multiple images
   - Visual indicators:
     - Active slide: Blue border (`border-brand-accent`)
     - Has caption: Green checkmark badge
     - Slide number: Top-left overlay

5. **File Upload Validation**
   - Type check: JPEG, PNG, WebP only
   - Size check: Max 10MB per file
   - Count check: Max 12 slides total
   - Error toasts for invalid files

#### Props
```typescript
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
```

---

## Image Edit Modal

### Component: `ImageEditModal.tsx`

#### Features
Full-screen overlay with four tool tabs:

##### 1. 🖼️ Crop
- **Aspect Ratios**: [1:1] [4:5] [16:9] [Free]
- **Zoom Slider**: 1x - 3x
- Uses `react-easy-crop` library
- Shows grid overlay when active

##### 2. 🔄 Rotate
- **Rotate Left**: -90°
- **Rotate Right**: +90°
- **Flip Horizontal**: Mirror image
- Applied via CSS transforms

##### 3. ✨ Filters
Preset button selections:
- **Original**: No filter
- **B&W**: `grayscale(100%)`
- **Vintage**: `sepia(50%) contrast(110%)`
- **Vibrant**: `saturate(150%) contrast(110%)`

##### 4. ☀️ Adjust
Three range sliders (0-200, default 100):
- **Brightness**: CSS `brightness()`
- **Contrast**: CSS `contrast()`
- **Saturation**: CSS `saturate()`

#### Actions
- **[✕ Close]**: Discard changes
- **[✓ Done]**: Apply edits to slide

#### Props
```typescript
interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (edits: ImageEdits) => void;
  imageUrl: string;
  initialEdits: ImageEdits;
}
```

---

## Caption Modal

### Component: `CaptionModal.tsx`

#### Features
1. **Alt Text Field** (Required)
   - Purpose: Accessibility (screen readers)
   - Max: 200 characters
   - Red border if empty
   - Cannot save without it

2. **Caption Field** (Optional)
   - Auto-resizing textarea
   - Min rows: 4, Max rows: 10
   - Max: 2,200 characters
   - Red character count if over limit
   - Save button disabled if over limit

3. **Help Text**
   - "💡 Tip: Keep it concise. Users can swipe to the next slide."

#### Props
```typescript
interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: string, altText: string) => void;
  initialCaption: string;
  initialAltText: string;
  slideNumber: number;
}
```

---

## Page 2: Publish Page

### Component: `PublishPage.tsx`

#### Sections

##### 1️⃣ Tags (Max 3)
- Dropdown select from curated tags
- Display as dismissible `Badge` pills
- Categories include: Design, Art, Photography, Tutorial, Process, etc.
- Shows "Max 3 tags" message when limit reached

##### 2️⃣ AI Content
- Checkbox: "This content is AI-generated"
- Help text explains when to check it

##### 3️⃣ Visibility
Radio button options:
- **Public**: Anyone can see
- **Followers Only**: Restricted to followers

##### 4️⃣ Preview
- Horizontal strip of all slide thumbnails (60x60px)
- Non-interactive preview
- Help text: "💡 Your first slide will appear in people's feeds"

#### Validation Rules (on Publish)
1. ✅ Must have ≥1 slide
2. ✅ First slide must have caption (required for feed display)
3. ✅ All slides must have alt text (accessibility)
4. ✅ Images must be successfully uploaded

#### Props
```typescript
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
```

---

## State Management

### Local State (React)
```typescript
const [currentPage, setCurrentPage] = useState<'builder' | 'publish'>('builder');
const [slides, setSlides] = useState<Slide[]>([]);
const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
const [tags, setTags] = useState<string[]>([]);
const [isAIGenerated, setIsAIGenerated] = useState(false);
const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
const [isPublishing, setIsPublishing] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [captionModalOpen, setCaptionModalOpen] = useState(false);
const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
```

### Draft Persistence (LocalStorage)
- **Key**: `zine_post_draft`
- **Auto-save**: Every 30 seconds
- **Auto-load**: On component mount
- **Cleared**: After successful publish or manual discard

```typescript
interface PostDraft {
  slides: Slide[];
  currentSlideIndex: number;
  tags: string[];
  isAIGenerated: boolean;
  visibility: 'public' | 'followers';
  lastSaved: number;
}
```

---

## Database Schema

### Table: `posts`
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- caption: text (first slide caption)
- is_private: boolean (followers only)
- is_ai_generated: boolean
- created_at: timestamp
```

### Table: `post_images`
```sql
- id: uuid (PK)
- post_id: uuid (FK)
- image_url: text (full resolution)
- thumbnail_url: text (optimized)
- caption: text (slide-specific)
- alt_text: text (accessibility)
- order_index: integer (carousel order)
- template: text (always 'image-full' for new flow)
- created_at: timestamp
```

---

## Supabase Storage

### Bucket: `posts`
- **Path**: `{user_id}/{timestamp}_{filename}`
- **Format**: Original JPEG/PNG/WebP
- **Access**: Public read, authenticated write

### Upload Process
1. User selects image(s) → Local preview (blob URL)
2. User clicks Publish → Upload to Supabase Storage
3. Get public URL → Save to `post_images.image_url`
4. Generate thumbnail URL (same for now, can optimize later)

---

## User Flows

### Happy Path: Create Post
1. User navigates to `/create`
2. Clicks "Add Images" → Selects 3 photos
3. Clicks thumbnail 1 → Preview displays
4. Clicks "Add Caption" → Enters caption & alt text → Saves
5. Clicks thumbnail 2 → "Edit Image" → Crops to 1:1 → Applies B&W filter → Done
6. Clicks "Next" → Goes to Publish page
7. Selects tags: "Photography", "Art"
8. Sets visibility: "Public"
9. Clicks "Publish" → Post created → Redirects to post view

### Error Handling: Missing Alt Text
1. User uploads 2 images
2. Adds caption to first slide only
3. Clicks "Next" → "Publish"
4. Validation fails → Toast: "Please add alt text to all slides for accessibility"
5. User clicks "Back" → Adds alt text → Publishes successfully

### Edge Case: Cancel with Draft
1. User uploads 5 images, adds captions
2. Clicks "Cancel" (✕ button)
3. Dialog appears: "Discard draft?"
4. Options:
   - "Continue Editing" → Returns to builder
   - "Discard Draft" → Clears localStorage → Returns to feed

---

## Drag & Drop Implementation

### Library: `@dnd-kit/core` + `@dnd-kit/sortable`

```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

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
  }
};
```

---

## Accessibility

### WCAG Compliance
- ✅ **Alt text required**: Enforced for all images
- ✅ **Keyboard navigation**: Tab through elements, Enter to activate
- ✅ **Focus trap**: Modals prevent focus escape
- ✅ **ESC key**: Closes modals
- ✅ **ARIA labels**: All buttons have descriptive labels
- ✅ **Touch targets**: Minimum 44x44px (mobile)

### Screen Reader Announcements
```typescript
<Button aria-label="Select slide 1">
<input aria-label="Add more slides" />
<img alt={slide.altText || `Slide ${slide.order + 1}`} />
```

---

## Mobile Responsiveness

### Breakpoints
- **< 640px**: Full-screen modals, vertical layout
- **≥ 640px**: Centered modals, horizontal layout

### Touch Support
- **Swipe to reorder**: Drag thumbnails
- **Pinch to zoom**: Image edit modal (planned)
- **Large touch targets**: 44x44px minimum

### CSS Classes
```css
/* Bottom tray scroll */
.overflow-x-auto pb-2

/* Modal adaptations */
@media (max-width: 640px) {
  .modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
```

---

## Error Handling

### Upload Errors
```typescript
try {
  await supabase.storage.from("posts").upload(filePath, file);
} catch (error) {
  toast({
    title: "Upload failed",
    description: "Try a smaller image or check your connection.",
    variant: "destructive",
  });
}
```

### Validation Errors
```typescript
if (!slides[0].caption.trim()) {
  toast({
    title: "Caption required",
    description: "Please add a caption to your first slide",
    variant: "destructive",
  });
  return;
}
```

### Network Errors
- Auto-save draft to localStorage
- Retry upload 3 times (planned)
- Log errors to Sentry (integrated)

---

## Performance Optimizations

### Image Handling
1. **Local preview**: Use `URL.createObjectURL()` for instant display
2. **Lazy loading**: Only load visible thumbnails
3. **CSS transforms**: Apply filters without re-encoding
4. **Blob cleanup**: Revoke object URLs on unmount

### Debouncing
- Auto-save: 30-second intervals (not on every keystroke)
- Search/filter: 300ms debounce (future enhancement)

---

## Future Enhancements

### Planned Features
1. **Image compression**: Client-side resize before upload
2. **Thumbnail generation**: Real 400x400px thumbnails
3. **Batch upload progress**: Individual file progress bars
4. **Video support**: MP4 slides with thumbnails
5. **Template system**: Revive templates from old flow
6. **Collaborative editing**: Multiple users, real-time sync
7. **AI caption generation**: Auto-generate alt text
8. **Scheduled publishing**: Set future publish time
9. **Draft versioning**: Restore previous drafts
10. **Analytics**: Track edit actions, drop-off rates

---

## Testing Checklist

### Unit Tests
- [ ] Slide reordering logic
- [ ] Image validation (type, size)
- [ ] Caption character limit
- [ ] Draft save/load/clear

### Integration Tests
- [ ] Upload flow (mock Supabase)
- [ ] Publish validation
- [ ] Modal interactions

### E2E Tests
- [ ] Full post creation flow
- [ ] Error recovery (network offline)
- [ ] Draft persistence across sessions
- [ ] Mobile touch interactions

---

## Troubleshooting

### Issue: Images not uploading
**Cause**: Storage bucket not public or RLS policy missing
**Fix**: Check Supabase Storage settings, ensure `posts` bucket exists with public read access

### Issue: Draft not loading
**Cause**: LocalStorage quota exceeded or corrupt data
**Fix**: Clear `zine_post_draft` key, check browser console for errors

### Issue: Thumbnails not reordering
**Cause**: Missing `@dnd-kit` sensors or invalid slide IDs
**Fix**: Ensure each slide has unique `id`, check DndContext setup

---

## Dependencies

### Core Libraries
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "react-easy-crop": "^5.x",
  "react-textarea-autosize": "^8.x"
}
```

### UI Components (shadcn/ui)
- Button, Card, Label, Checkbox, RadioGroup
- Dialog, Select, Badge, Slider
- Textarea (replaced with TextareaAutosize in modals)

---

## Changelog

### v2.0.0 - 2025-01-XX
- ✨ Complete redesign: Two-page carousel flow
- ✨ Image editing: Crop, rotate, filters, adjustments
- ✨ Drag-and-drop thumbnail reordering
- ✨ Per-slide captions and alt text
- ✨ Tag system (max 3 tags)
- ✨ AI content flag
- ✨ Visibility controls (public/followers)
- ✨ Draft auto-save to LocalStorage
- 🗑️ Removed old ImageUploader & SlideEditor components
- 🗑️ Removed templates (now always image-full)

---

## Credits

**Design inspired by**: Instagram carousel creator, Medium post editor
**Built with**: React, TypeScript, Tailwind CSS, Supabase
**Accessibility guidelines**: WCAG 2.1 Level AA
