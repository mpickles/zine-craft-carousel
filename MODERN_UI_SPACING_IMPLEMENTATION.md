# Modern UI Spacing & Image Handling Implementation

## Overview
This document outlines the complete implementation of modern UI spacing, image fit modes, aspect ratios, and proper image handling across the Zine platform.

## Database Schema Changes

### Post Images Table Updates
```sql
ALTER TABLE post_images 
ADD COLUMN fit_mode TEXT DEFAULT 'cover' CHECK (fit_mode IN ('cover', 'contain')),
ADD COLUMN aspect_ratio TEXT DEFAULT '16:9' CHECK (aspect_ratio IN ('1:1', '4:5', '16:9', '21:9')),
ADD COLUMN crop_data JSONB DEFAULT NULL;
```

**New Columns:**
- `fit_mode`: How the image should be displayed
  - `cover`: Fill container, crop edges if needed (default)
  - `contain`: Show full image with letterboxing
- `aspect_ratio`: Target aspect ratio (`1:1`, `4:5`, `16:9`, `21:9`)
- `crop_data`: JSON object storing crop positioning
  ```json
  {
    "x": 0.25,      // 0-1 (percentage from left)
    "y": 0.15,      // 0-1 (percentage from top)
    "width": 0.8,   // 0-1 (percentage of container)
    "height": 0.8,  // 0-1 (percentage of container)
    "zoom": 1.2     // 1-3 (zoom level)
  }
  ```

## Design System - Spacing Tokens

### Tailwind Config (`tailwind.config.ts`)

```typescript
spacing: {
  'safe': '16px',        // Minimum edge spacing (mobile)
  'card': '24px',        // Between components
  'section': '32px',     // Section padding (desktop)
},
maxWidth: {
  'feed': '800px',       // Feed container
  'modal': '900px',      // Modal max width
  'container': '1200px', // Page container
},
borderRadius: {
  'component': '12px',   // Standard component radius
  'image': '8px',        // Image radius
}
```

### Usage Guidelines

**Mobile Spacing:**
- Screen edges: `px-safe` (16px)
- Between cards: `space-y-card` (24px)
- Card padding: `p-4` (16px)

**Desktop Spacing:**
- Screen edges: `md:px-section` (32px)
- Max-width containers: `max-w-feed` (800px) or `max-w-modal` (900px)
- Rounded corners: `rounded-component` (12px) for cards, `rounded-image` (8px) for images

## Type Definitions (`src/types/post.ts`)

### New Types

```typescript
export interface CropData {
  x: number;      // 0-1 (percentage)
  y: number;      // 0-1 (percentage)
  width: number;  // 0-1 (percentage)
  height: number; // 0-1 (percentage)
  zoom: number;   // 1-3
}

export interface ImageEdits {
  crop: { ... } | null;
  rotation: number;
  flipHorizontal: boolean;
  filter: 'original' | 'bw' | 'vintage' | 'vibrant';
  adjustments: { ... };
  fitMode: 'cover' | 'contain'; // NEW
}

export interface Slide {
  id: string;
  imageFile: File;
  imageUrl: string;
  uploadedUrl?: string;
  caption: string;
  altText?: string;
  order: number;
  edits: ImageEdits;
  aspectRatio: '1:1' | '4:5' | '16:9' | '21:9'; // Required
  fitMode: 'cover' | 'contain'; // Required
  cropData?: CropData; // Optional crop data
}
```

### Constants

```typescript
export const ASPECT_RATIOS = {
  square: '1:1' as const,      // 1.0
  portrait: '4:5' as const,    // 0.8
  landscape: '16:9' as const,  // 1.78
  wide: '21:9' as const,       // 2.33
};

export const ASPECT_RATIO_VALUES: Record<string, number> = {
  '1:1': 1.0,
  '4:5': 0.8,
  '16:9': 1.78,
  '21:9': 2.33,
};
```

## Image Optimization Utilities (`src/lib/imageOptimization.ts`)

### Functions

**`getOptimizedImageUrl(imageUrl, options)`**
- Generates optimized URLs using Supabase Storage transforms
- Options: width, height, quality, fit mode
- Returns transformed public URL

**`getCropPosition(cropData)`**
- Converts crop data to CSS `object-position`
- Returns: `"25% 15%"` format

**`getAspectRatioValue(aspectRatio)`**
- Converts string aspect ratio to numeric value
- Returns: `1.0`, `0.8`, `1.778`, or `2.333`

**`getImageFilterStyle(filter, adjustments)`**
- Generates CSS filter string from edits
- Combines preset filters with adjustments

## Image Fit Modes

### Cover Mode (Fill & Crop)
**Use Cases:**
- Portrait photos
- Product images
- Social media style posts
- Any image where edges aren't critical

**Behavior:**
- Fills entire container
- Crops excess edges
- No letterboxing
- User can reposition crop area

**CSS:**
```css
object-fit: cover;
object-position: 25% 15%; /* from cropData */
```

### Contain Mode (Show Full)
**Use Cases:**
- Infographics
- Screenshots
- Diagrams
- Full compositions where nothing should be cropped

**Behavior:**
- Shows entire image
- Adds letterboxing if needed (subtle gray)
- Maintains aspect ratio
- No cropping

**CSS:**
```css
object-fit: contain;
background-color: #f5f5f5; /* letterbox color */
```

## Component Updates

### Feed Post Cards (`src/components/feed/PostCard.tsx`)

**Changes:**
- Updated container padding: `p-4` with `mx-4` margins
- Rounded corners: `rounded-component` (12px)
- Image container: `rounded-image` with proper spacing
- Text spacing: `leading-relaxed` for better readability
- Card gap: `space-y-card` between cards

**Image Display:**
- Always **1:1 square thumbnail** for feed
- Always uses `object-fit: cover`
- 400×400px optimized size

### Post Viewer Modal (`src/components/post/PostViewerModal.tsx`)

**Changes:**
- Modal max-width: `max-w-modal` (900px)
- Padding: `p-safe` (16px mobile), `md:p-section` (32px desktop)
- Header spacing: `px-4 md:px-6 py-4`
- Rounded corners: `rounded-none md:rounded-component`
- Proper breathing room on all sides

**Image Display:**
- Respects slide's `fit_mode` setting
- Applies `crop_data` if in cover mode
- Shows letterboxing for contain mode
- Maintains original aspect ratio

### Image Edit Modal (`src/components/create/ImageEditModal.tsx`)

**New Features:**
- **Fit Mode Tab** (first tab)
  - Cover mode option with description
  - Contain mode option with description
  - Visual selection with hover states
- Updated to handle `fitMode` in edits
- Default tab changed to 'fit'

**Tab Order:**
1. 📐 Fit (NEW)
2. 🖼️ Crop
3. 🔄 Rotate
4. ✨ Filter
5. ☀️ Adjust

### Carousel Builder (`src/components/create/CarouselBuilder.tsx`)

**Changes:**
- New slides initialize with:
  - `aspectRatio: '16:9'` (default)
  - `fitMode: 'cover'` (default)
- Ensures all required Slide fields are present

## Feed Page Updates (`src/pages/Feed.tsx`)

**Changes:**
- Container: `px-safe md:px-card` for responsive padding
- Max width: `max-w-feed` (800px)
- Card spacing: `space-y-card` (24px gap)
- Header margin: `mb-card`
- Rounded corners: `rounded-component`

## Image Rendering Logic

### In Feed (Thumbnails)
```tsx
// Always square, always cover
<OptimizedImage
  src={getOptimizedUrl(image.image_url, {
    width: 400,
    height: 400,
    fit: 'cover'
  })}
  aspectRatio="square"
  className="w-full h-full object-cover"
/>
```

### In Post Viewer (Full Slide)
```tsx
// Use slide's fit mode and crop data
<img
  src={getOptimizedUrl(slide.image_url, {
    width: 1200,
    quality: 85
  })}
  style={{
    width: '100%',
    height: 'auto',
    objectFit: slide.fit_mode,
    objectPosition: getCropPosition(slide.crop_data),
    ...(slide.fit_mode === 'contain' && {
      backgroundColor: '#f5f5f5'
    })
  }}
/>
```

### In Composer Preview
```tsx
// Show real-time preview
<img
  src={slide.imageUrl}
  style={{
    objectFit: slide.fitMode,
    aspectRatio: slide.aspectRatio,
    objectPosition: getCropPosition(slide.cropData)
  }}
/>
```

## Best Practices

### Spacing
✅ **DO:**
- Use spacing tokens (`safe`, `card`, `section`)
- Apply 16px minimum padding on mobile
- Use 24px gaps between components
- Use 32px section padding on desktop
- Round corners consistently

❌ **DON'T:**
- Let content touch screen edges
- Use arbitrary pixel values
- Mix spacing systems
- Use different border radius values

### Image Handling
✅ **DO:**
- Use cover mode for photos/portraits
- Use contain mode for infographics/diagrams
- Provide aspect ratio options
- Allow user to reposition crops
- Optimize images with transforms

❌ **DON'T:**
- Force one fit mode for all images
- Crop critical content without user control
- Skip image optimization
- Use inconsistent aspect ratios in carousel

## Migration Notes

### Existing Data
- All existing posts will default to:
  - `fit_mode: 'cover'`
  - `aspect_ratio: '16:9'`
  - `crop_data: null`

### Backward Compatibility
- System handles null/missing values gracefully
- Old posts render correctly with defaults
- No data migration required

## Security Note

A pre-existing security warning exists:
- **Issue**: Leaked password protection is disabled
- **Impact**: Auth configuration, not related to image changes
- **Action**: User should enable in Supabase Auth settings
- **Link**: https://supabase.com/docs/guides/auth/password-security

## Testing Checklist

### Desktop
- [ ] Feed cards have 24px gaps
- [ ] Post viewer has 32px margins
- [ ] Content never touches screen edges
- [ ] All corners properly rounded
- [ ] Images respect fit mode
- [ ] Cover mode fills container
- [ ] Contain mode shows full image

### Mobile
- [ ] 16px minimum padding everywhere
- [ ] Cards responsive and readable
- [ ] Images scale properly
- [ ] Touch targets adequate (44x44px min)
- [ ] Swipe gestures work
- [ ] Modal full-screen on mobile

### Image Handling
- [ ] Cover mode crops appropriately
- [ ] Contain mode adds letterboxing
- [ ] Crop repositioning works
- [ ] Aspect ratios maintained
- [ ] Filters apply correctly
- [ ] Image optimization working

## Performance Considerations

1. **Image Optimization**: Uses Supabase transforms for on-the-fly resizing
2. **Lazy Loading**: OptimizedImage component handles lazy loading
3. **Preloading**: Adjacent slides/posts preloaded for smooth navigation
4. **Caching**: Browser caches optimized URLs
5. **Responsive**: Serves appropriate sizes for device

## Future Enhancements

1. **Custom Aspect Ratios**: Allow user-defined ratios
2. **Advanced Filters**: More filter presets
3. **Batch Editing**: Apply edits to multiple slides
4. **Image Templates**: Preset layouts for educational content
5. **Export Options**: Download optimized versions
