# Instagram 2025 Carousel Composer - Complete Documentation

## 🎯 Overview

This carousel composer follows **Instagram 2025 best practices** for accessibility, usability, and feature parity with modern social platforms.

## ✨ New Features Implemented

### 1. **Alt Text (REQUIRED)** ✅
- **Why**: Accessibility is mandatory (Instagram 2025 standard)
- **Requirement**: All slides MUST have alt text before publishing
- **Max Length**: 100 characters
- **UI**: Red "!" badge on thumbnails missing alt text
- **Validation**: Blocks publishing if any slide lacks alt text

### 2. **Apply Filter to All Slides** ✅
- **Location**: Image Edit Modal → Filter tab
- **Feature**: Checkbox to apply selected filter to entire carousel
- **Saves Time**: No need to edit each slide individually
- **Toast Confirmation**: "Filter applied to all X slides"

### 3. **Location Tagging** ✅
- **Type**: Optional text input
- **Max Length**: 100 characters
- **Saved To**: `posts.location` column
- **Future**: Can add Google Places API autocomplete

### 4. **Tag People (Max 5)** ✅
- **Search**: Autocomplete from profiles table
- **Max Users**: 5 per post (Instagram standard)
- **Display**: Avatar + @username badges
- **Database**: `post_tagged_users` table with RLS policies

### 5. **Aspect Ratio Consistency** ✅
- **Rule**: First slide's ratio = all slides' ratio
- **Supported**: 1:1 (square), 4:5 (portrait), 16:9 (landscape)
- **Enforcement**: Saved to `posts.aspect_ratio` and `post_images.aspect_ratio`
- **Future**: Add validation to enforce on upload

### 6. **Draft Auto-Save** ✅
- **Frequency**: Every 30 seconds
- **Saved**: Tags, AI flag, visibility, location, tagged users
- **NOT Saved**: Images (File objects can't serialize)
- **Storage**: localStorage with 7-day expiration

## 🗄️ Database Schema

### New Columns
```sql
-- posts table
ALTER TABLE posts 
ADD COLUMN location TEXT,
ADD COLUMN aspect_ratio TEXT CHECK (aspect_ratio IN ('1:1', '4:5', '16:9'));

-- post_images table
ALTER TABLE post_images 
ADD COLUMN aspect_ratio TEXT CHECK (aspect_ratio IN ('1:1', '4:5', '16:9'));
```

### New Table
```sql
CREATE TABLE post_tagged_users (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
```

## 📋 Validation Rules

Before publishing:
- ✅ Must have ≥1 slide
- ✅ First slide MUST have caption
- ✅ **ALL slides MUST have alt text** (NEW)
- ✅ All images uploaded successfully
- ✅ Location ≤ 100 chars (if provided)
- ✅ Tagged users ≤ 5 (if provided)

## 🎨 UI Components Updated

### CarouselBuilder.tsx
- Added filter "apply to all" functionality
- Updated thumbnail badges (green ✓ for complete, red ! for missing alt text)

### CaptionModal.tsx
- Alt text is now **required** (marked with red asterisk)
- Character counter shows error state if missing
- Help text updated to emphasize importance

### ImageEditModal.tsx
- Added "Apply to all slides" checkbox in Filter tab
- Shows slide count in checkbox label
- Passes `applyToAll` flag to save handler

### PublishPage.tsx
- Added Location input with character counter
- Added Tag People search with autocomplete
- Added validation for missing alt text
- Shows tagged users as removable badges

### SlideThumbnail.tsx
- Green checkmark: Has caption + alt text
- Red exclamation: Missing alt text
- Hover tooltip on warning badge

## 🔒 Security

All new features have proper RLS policies:
- Tagged users visible in public posts
- Only post creators can add/remove tags
- User search respects privacy settings

## 📱 Mobile Responsive

- All inputs have proper touch targets (≥44px)
- Scrollable user search results
- Badge removal works on touch devices
- Layout adapts to small screens

## 🚀 Future Enhancements

1. **Aspect Ratio Enforcement**: Validate on upload, offer crop/replace
2. **Google Places API**: Real location autocomplete
3. **Per-Slide Tagging**: Tag different people in different slides
4. **Resume Draft Modal**: Show preview on page load if draft exists
5. **Alt Text Suggestions**: Auto-generate from image analysis
