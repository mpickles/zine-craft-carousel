# Instagram-Style Post Viewer Modal - Implementation Documentation

## Overview
Complete implementation of an Instagram-style post viewer modal with context-aware navigation, swipe gestures, keyboard controls, and URL management for Zine social platform.

---

## Architecture

### Core Components

#### 1. **PostViewerModal** (`src/components/post/PostViewerModal.tsx`)
Full-screen modal overlay for viewing posts with carousel navigation.

**Props:**
- `postId`: Current post ID
- `onClose`: Callback when modal closes
- `context`: "feed" | "profile" | "explore" - determines navigation behavior
- `userId?`: User ID (for profile context)
- `onNavigate?`: Callback when navigating to adjacent post
- `adjacentPostIds?`: { prev: string | null, next: string | null }

**Features:**
- ✅ Full-screen modal with backdrop blur
- ✅ Image carousel with slide-by-slide navigation
- ✅ Per-slide captions with smooth transitions (300ms fade)
- ✅ Keyboard navigation (arrows, ESC, Shift+Arrow for posts)
- ✅ Touch gestures (swipe left/right for slides, down to close)
- ✅ Preloading of adjacent slides
- ✅ View tracking (after 3 seconds)
- ✅ Collapsible comments section
- ✅ Share and save actions
- ✅ Responsive desktop/mobile layouts

#### 2. **usePostNavigation** (`src/hooks/usePostNavigation.ts`)
Custom hook for fetching adjacent post IDs based on context.

**Props:**
- `context`: "feed" | "profile" | "explore"
- `userId?`: User ID (for profile context)
- `currentPostId`: Current post being viewed

**Returns:**
- `adjacentPostIds`: { prev: string | null, next: string | null }
- `isLoading`: Loading state

**Context Behaviors:**
- **Profile**: Navigate through user's posts ordered by `created_at`
- **Feed**: Navigate through followed users' posts
- **Explore**: Navigate through all public posts

---

## Layout Structure

### Desktop Layout (max 1200px wide, centered)

```
╔══════════════════════════════════════════════╗
║ [X Close]    @username    [⋮ Menu]           ║ ← Header (64px)
╠══════════════════════════════════════════════╣
║                                              ║
║    ← [Current Slide Image] →                 ║ ← Carousel (flex-1)
║                                              ║
║    ●●●○○○ (3 of 6)                           ║ ← Slide dots
║                                              ║
║ Caption for this specific slide...           ║ ← Per-slide caption
║                                              ║
╠══════════════════════════════════════════════╣
║ [❤ Save] [↗ Share] [💬 24]                  ║ ← Actions bar
║                                              ║
║ @username · 2h ago                           ║ ← Post info
╠══════════════════════════════════════════════╣
║ Comments (24) ▲ [collapsible]                ║ ← Comments section
╚══════════════════════════════════════════════╝
```

### Mobile Layout (full-screen)
- Same structure, 100% width/height
- Touch-optimized spacing (44x44px minimum)
- Swipe gestures enabled

---

## Navigation Behaviors

### Slide Navigation (Within Post)
| Action | Desktop | Mobile |
|--------|---------|--------|
| Next slide | Click right arrow / Right arrow key | Swipe left |
| Previous slide | Click left arrow / Left arrow key | Swipe right |
| Jump to slide | Click dot indicator | Tap dot indicator |

### Post Navigation (Between Posts)
| Condition | Action | Result |
|-----------|--------|--------|
| At last slide + swipe left | Next post loads | `adjacentPostIds.next` |
| At first slide + swipe right | Previous post loads | `adjacentPostIds.prev` |
| Shift + Right arrow | Next post loads | `adjacentPostIds.next` |
| Shift + Left arrow | Previous post loads | `adjacentPostIds.prev` |

**Visual Indicators:**
- At first slide with previous post → Show "Previous Post" button (bottom-left)
- At last slide with next post → Show "Next Post" button (bottom-right)
- Buttons only visible on desktop

---

## URL Management

### URL Patterns
```
/feed?post={postId}          → Feed context
/profile/{username}?post={postId}  → Profile context
/explore?post={postId}       → Explore context
/p/{postId}                  → Direct link (opens in feed context)
```

### Shallow Routing
Uses `useSearchParams` from React Router with `{ replace: false }` to:
- Update URL without page reload
- Enable shareable links
- Support browser back button (closes modal)
- Preserve scroll position on underlying page

**Example:**
```typescript
const handleOpenModal = (postId: string) => {
  setActivePostId(postId);
  setSearchParams({ post: postId }, { replace: false });
};
```

---

## Integrations

### Feed Page (`src/pages/Feed.tsx`)
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const postIdParam = searchParams.get("post");
const [activePostId, setActivePostId] = useState<string | null>(postIdParam);

<PostCard onOpenModal={handleOpenModal} />

<AnimatePresence>
  {activePostId && (
    <PostViewerModal
      postId={activePostId}
      context="feed"
      onNavigate={handleNavigatePost}
      adjacentPostIds={adjacentPostIds}
    />
  )}
</AnimatePresence>
```

### Profile Page (`src/pages/Profile.tsx`)
```typescript
<PostsGrid onOpenModal={handleOpenModal} />

<PostViewerModal
  context="profile"
  userId={profile.id}
  ...
/>
```

### Explore Page (`src/pages/Explore.tsx`)
```typescript
<PostCard onOpenModal={handleOpenModal} />

<PostViewerModal
  context="explore"
  ...
/>
```

---

## Gestures & Interactions

### Touch Gestures (Mobile)
| Gesture | Action |
|---------|--------|
| Swipe left | Next slide (or next post if at boundary) |
| Swipe right | Previous slide (or previous post if at boundary) |
| Swipe down from top | Close modal |
| Tap | Show/hide controls (future) |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| ESC | Close modal |
| → | Next slide |
| ← | Previous slide |
| Shift + → | Next post |
| Shift + ← | Previous post |
| Tab | Navigate interactive elements |

---

## Performance Optimizations

### 1. Image Preloading
```typescript
useEffect(() => {
  // Preload adjacent slides
  if (currentSlide < totalSlides - 1) {
    const nextImage = new Image();
    nextImage.src = sortedImages[currentSlide + 1].image_url;
  }
  if (currentSlide > 0) {
    const prevImage = new Image();
    prevImage.src = sortedImages[currentSlide - 1].image_url;
  }
}, [currentSlide, sortedImages]);
```

### 2. Adjacent Post Caching
- `usePostNavigation` hook fetches prev/next post IDs on modal open
- Cached in state to prevent re-fetching
- Instant navigation when user swipes to adjacent post

### 3. Optimistic UI
- Comments post immediately (optimistic)
- Like/save actions update UI before server response
- Error handling with rollback

---

## Database Queries

### Fetch Post with Slides
```typescript
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    user:users(*),
    slides(*),
    saves(count),
    collection_items(count)
  `)
  .eq('id', postId)
  .order('slide_order', { foreignTable: 'slides' })
  .single();
```

### Adjacent Posts (Profile Context)
```typescript
// Previous post
const { data: prevPost } = await supabase
  .from('posts')
  .select('id')
  .eq('user_id', userId)
  .lt('created_at', currentPost.created_at)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

// Next post
const { data: nextPost } = await supabase
  .from('posts')
  .select('id')
  .eq('user_id', userId)
  .gt('created_at', currentPost.created_at)
  .order('created_at', { ascending: true })
  .limit(1)
  .single();
```

### Adjacent Posts (Feed Context)
```typescript
// Get followed user IDs first
const { data: follows } = await supabase
  .from('follows')
  .select('following_id')
  .eq('follower_id', session.user.id);

// Then query posts
const { data: prevPost } = await supabase
  .from('posts')
  .select('id')
  .in('user_id', followedUserIds)
  .eq('is_private', false)
  .lt('created_at', currentPost.created_at)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

---

## Accessibility (WCAG 2.1 AA)

### ARIA Labels
```jsx
<div role="dialog" aria-modal="true" aria-label="Post viewer">
  <button aria-label="Close post viewer">×</button>
  <button aria-label="Previous slide">←</button>
  <button aria-label="Next slide">→</button>
  <button aria-label="Go to slide 3">●</button>
</div>
```

### Focus Management
- Modal traps focus (can't tab outside)
- ESC key closes modal
- Focus returns to trigger element on close (handled by React Router)

### Screen Reader Support
- Slide changes announced: "Slide 3 of 6"
- Post navigation announced: "Loading next post"
- All images have alt text (from `currentImage.caption`)

### Color Contrast
- Text on black background: 21:1 ratio (exceeds 4.5:1 requirement)
- Button hover states: Clear visual feedback
- Focus indicators: Visible outline on all interactive elements

---

## Error States

### Post Not Found
```jsx
<div className="bg-background rounded-lg p-8 text-center">
  <h2>Post Not Found</h2>
  <p>This post may have been deleted or is private.</p>
  <Button onClick={onClose}>Go Back</Button>
</div>
```

### Network Error
- Show toast notification
- Retry button
- Modal stays open (preserves user's place)

### Failed View Tracking
- Silently log error (non-critical)
- Don't block user interaction

---

## Dependencies

### Required Packages
```json
{
  "framer-motion": "^11.x", // Smooth animations
  "react-swipeable": "^7.x", // Touch gestures
  "@radix-ui/react-dialog": "^1.x" // Accessible modal foundation
}
```

### Installation
```bash
npm install framer-motion react-swipeable @radix-ui/react-dialog
```

---

## Testing Checklist

### Desktop
- [x] Post opens in modal (no page reload)
- [x] Slide navigation with arrows/keyboard works
- [x] Post navigation with Shift+Arrow works
- [x] ESC closes modal
- [x] Click background closes modal
- [x] URL updates on post change
- [x] Browser back closes modal
- [x] Share button copies link
- [x] Comments load and post successfully

### Mobile
- [x] Tap post → Modal opens
- [x] Swipe left/right → Slides change
- [x] Swipe past last slide → Next post loads
- [x] Swipe down from top → Modal closes
- [x] Comments section expands/collapses
- [x] All touch targets ≥44x44px
- [x] Smooth animations (60fps)

### Accessibility
- [x] Keyboard navigation works throughout
- [x] Focus trap active in modal
- [x] ARIA labels present and correct
- [x] Screen reader announces changes
- [x] Color contrast meets WCAG AA

### Edge Cases
- [x] No adjacent posts (first/last in context)
- [x] Post with single slide (no carousel controls)
- [x] Post with no caption (empty space shown)
- [x] Network error during navigation
- [x] User not logged in (save/comment disabled)

---

## Future Enhancements (V2)

### Phase 2
- [ ] Tap to show/hide controls
- [ ] Pinch to zoom on images
- [ ] Video support in carousels
- [ ] Download image action
- [ ] Report post action
- [ ] Instagram-style "See Translation" for captions

### Phase 3
- [ ] Multiple image layouts (side-by-side, collage)
- [ ] Per-slide tagging (tag people in specific slides)
- [ ] Slide-specific filters
- [ ] Augmented reality filters
- [ ] Music/audio tracks for carousels

---

## Migration Notes

### Breaking Changes
- `PostCard` now accepts optional `onOpenModal` prop
- `PostsGrid` now accepts optional `onOpenModal` prop
- Feed, Explore, and Profile pages use URL query params (`?post=id`)
- Old route `/post/:postId` still works (renders PostView page) but modal is preferred

### Backwards Compatibility
- If `onOpenModal` not provided, `PostCard` falls back to navigation
- If `onOpenModal` not provided, `PostsGrid` falls back to navigation
- Direct links `/p/:postId` work (can add redirect to `/feed?post=id`)

---

## Troubleshooting

### Modal doesn't open
- Check if `activePostId` is set correctly
- Verify `AnimatePresence` wraps modal component
- Check browser console for errors

### Navigation arrows don't appear
- Ensure `adjacentPostIds` is populated
- Check `usePostNavigation` hook is called
- Verify context matches current page

### Swipe gestures not working
- Mobile only feature (desktop uses mouse)
- Check `react-swipeable` is installed
- Verify `preventScrollOnSwipe: true` is set

### URL not updating
- Check `setSearchParams` is called with `{ replace: false }`
- Verify `useSearchParams` hook is used
- Ensure React Router v6+ is installed

---

## Success Metrics

### Performance
- Modal opens in <200ms
- Slide transitions at 60fps
- Image preloading reduces perceived load time
- No layout shift during navigation

### User Experience
- 95% of users can navigate intuitively
- Average session time increases (users view more posts)
- Share rate increases with easy copy-link functionality
- Comments engagement increases with inline section

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard-only users can navigate fully
- Screen reader users receive clear announcements
- Color contrast ratios exceed requirements

---

## Summary

This implementation delivers a production-ready, Instagram-style post viewing experience with:
- ✅ Full-screen modal overlay (preserves context)
- ✅ Context-aware post navigation (feed/profile/explore)
- ✅ Smooth carousel with per-slide captions
- ✅ Keyboard + touch gesture support
- ✅ URL management for shareable links
- ✅ Performance optimizations (preloading, caching)
- ✅ Full accessibility (WCAG 2.1 AA)
- ✅ Responsive mobile + desktop layouts

The system is modular, well-documented, and ready for future enhancements.
