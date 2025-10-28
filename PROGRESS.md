# Zine Social Media Platform - Progress Documentation

## 🎯 Project Overview
Building Zine - a creator-first social media platform with React + Vite + TypeScript + Supabase.

**Core Promise:** "Your work matters more than your follower count."

---

## ✅ Completed (Phase 1: Foundation)

**Status: FULLY WORKING ✅**
- Signup/Login functional with enhanced password requirements
- Database schema deployed with all tables and indexes
- All security policies active (RLS enabled on all tables)
- Email verification working
- Age verification (13+ COPPA compliance) implemented
- Accessibility support (alt text for images)

### 1. Database Schema (Supabase)
All tables created with Row Level Security (RLS) policies:

#### Core Tables:

**profiles** (User profiles):
- `id` (UUID, primary key, references auth.users)
- `username` (text, unique, 3-20 chars, lowercase, alphanumeric + underscores)
- `display_name` (text)
- `bio` (text, max 500 chars)
- `avatar_url` (text)
- `birthdate` (date, for 13+ age verification)
- `is_private` (boolean, profile privacy toggle)
- `email_verified_at` (timestamp)
- `account_created_at` (timestamp)
- `last_post_at` (timestamp)
- `created_at`, `updated_at` (timestamps)
- Note: Email stored in `auth.users` table for security

**posts** (User posts):
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `caption` (text, overall post caption)
- `is_private` (boolean, default false - public/followers-only)
- `is_ai_generated` (boolean, default false)
- `view_count` (integer, default 0)
- `created_at`, `updated_at` (timestamps)

**post_images** (Carousel slides):
- `id` (UUID, primary key)
- `post_id` (UUID, foreign key to posts)
- `order_index` (integer, 1-12 for slide sequencing)
- `image_url` (text, required)
- `thumbnail_url` (text, for performance)
- `template` (text: 'image-full', 'image-note', 'quote', 'side-by-side')
- `caption` (text, per-slide caption, max 500 chars)
- `alt_text` (text, for accessibility/screen readers)
- `created_at` (timestamp)

**collections** (User-curated post collections):
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `name` (text, required, max 100 chars)
- `description` (text, max 500 chars)
- `cover_image_url` (text)
- `is_public` (boolean, default true - public/private toggle)
- `created_at`, `updated_at` (timestamps)

**collection_items** (Posts saved to collections):
- `collection_id` (UUID, foreign key to collections)
- `post_id` (UUID, foreign key to posts)
- `added_at` (timestamp)
- Unique constraint on (collection_id, post_id)
- Junction table for many-to-many relationship

**follows** (User relationships):
- `follower_id` (UUID, foreign key to auth.users)
- `following_id` (UUID, foreign key to auth.users)
- `created_at` (timestamp)
- Primary key: (follower_id, following_id)
- Prevents self-follows (constraint)
- Bidirectional tracking

**saves** (Quick bookmarks):
- `user_id` (UUID, foreign key to auth.users)
- `post_id` (UUID, foreign key to posts)
- `created_at` (timestamp)
- Primary key: (user_id, post_id)
- Quick saves/bookmarks separate from organized collections

**likes** (Post engagement):
- `user_id` (UUID, foreign key to auth.users)
- `post_id` (UUID, foreign key to posts)
- `created_at` (timestamp)
- Primary key: (user_id, post_id)
- One like per user per post

**comments** (Post discussions):
- `id` (UUID, primary key)
- `post_id` (UUID, foreign key to posts)
- `user_id` (UUID, foreign key to auth.users)
- `content` (text, comment content)
- `created_at`, `updated_at` (timestamps)
- Edit/delete own comments

**notifications** (Activity tracking):
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `actor_id` (UUID, user who triggered notification)
- `post_id` (UUID, related post if applicable)
- `type` (text: follow, like, comment, save)
- `read` (boolean, default false)
- `created_at` (timestamp)

#### Performance Indexes:
- `profiles`: username
- `posts`: user_id, created_at DESC, view_count DESC, (user_id, created_at DESC)
- `post_images`: (post_id, order_index)
- `collections`: user_id
- `collection_items`: collection_id, post_id
- `follows`: follower_id, following_id
- `saves`: user_id, post_id

#### Security Tables:
- **reserved_usernames**: Prevents squatting on @admin, @zine, @help, @support, @moderator, @official, @team, @staff

#### Storage:
- **posts bucket**: Public storage for images
  - Anyone can view
  - Authenticated users can upload
  - Users can delete own images
  - Path structure: `/posts/{userId}/{postId}/{timestamp}-{index}.{ext}`

#### Database Functions:
- **handle_new_user()**: Auto-creates profile when user signs up
  - Stores username, email_verified_at, account_created_at, birthdate
  - Security definer function (runs with elevated privileges)
  - Triggered on INSERT to auth.users

#### Triggers:
- **on_auth_user_created**: Calls handle_new_user() after user signup

#### Indexes (Performance Optimization):
All tables have appropriate indexes for frequently queried columns:
- `profiles`: username (unique index)
- `posts`: user_id, created_at DESC, view_count DESC, (user_id, created_at DESC)
- `post_images`: (post_id, order_index)
- `collections`: user_id
- `collection_items`: collection_id, post_id
- `follows`: follower_id, following_id
- `likes`: user_id, post_id
- `saves`: user_id, post_id
- `comments`: post_id, user_id

#### Fixes Applied:
- ✅ Made `username` nullable (set after signup)
- ✅ Enabled RLS on `reserved_usernames` table
- ✅ Email verification configured in Supabase dashboard

---

### 2. Design System

#### Brand Colors:
- **Primary**: Deep Indigo `hsl(239, 66%, 51%)` - Serious, craft-focused
- **Accent**: Terracotta `hsl(14, 77%, 62%)` - Human, authentic
- **Background**: Clean white/gray palette
- **Text**: Deep charcoal for readability

#### Typography:
- **Font**: Inter (web-safe fallback to system fonts)
- **Hierarchy**: Clear heading scales (text-sm to text-6xl)
- **Weights**: 400-700 for proper emphasis

#### Components:
- All shadcn/ui components configured
- Custom color tokens in CSS variables
- Tailwind config extends with semantic colors
- Consistent border-radius and spacing

---

### 3. Authentication System

#### Supabase Auth Integration:
- **Email/password authentication**
- **Email verification required** before posting
- **Session management** with localStorage persistence
- **Auto token refresh** handled by Supabase client

#### Auth Context Provider:
- Centralized auth state management
- Provides `user`, `session`, `loading` states
- Real-time auth state updates with `onAuthStateChange`
- Proper initialization order (listener first, then check session)

#### Protected Routes:
- Route guard component
- Redirects to login if unauthenticated
- Loading states during auth checks

#### Forms:
- **Signup**: Username, email, password, birthdate validation
  - **Password requirements**: Min 8 chars, 1 uppercase, 1 number
  - **Age verification**: 13+ years (COPPA compliance)
  - Checks reserved usernames (admin, zine, help, support, moderator, official, team, staff)
  - Checks username availability
  - Client-side validation (pattern matching)
  - Creates profile automatically via trigger with birthdate
  - Email redirect URL configured
  - Birthdate stored in user metadata and profiles table

- **Login**: Email/password with error handling
  - Clear error messages
  - Loading states
  - Redirect to feed on success

---

### 4. Pages Built

#### Landing Page (`/`)
- **Hero section**: "Social media without the bullshit"
- **Features grid**: 4 key features with icons
  - Per-slide captions
  - Customizable profiles
  - Collections
  - No algorithm
- **CTA sections**: Sign up buttons
- **Header**: Logo + Login/Signup buttons
- **Footer**: Copyright

#### Login Page (`/login`)
- Clean card-based form
- Email + password fields
- Link to signup
- Error handling with toast notifications

#### Signup Page (`/signup`)
- Username + email + password fields
- Username validation (reserved/taken check)
- Pattern matching for username format
- Password requirements (min 8 chars)
- Link to login

#### Feed Page (`/feed`)
- Protected route (requires auth)
- Header with user email + logout
- Empty state: "Follow creators to see posts"
- Placeholder for future feed content

#### Not Found (`/404`)
- Default error page

---

### 5. Technical Infrastructure

#### File Structure:
```
/src
  /components
    /ui (shadcn components)
  /contexts
    /AuthContext.tsx
  /integrations
    /supabase
      /client.ts
      /types.ts
  /pages
    /Landing.tsx
    /Login.tsx
    /Signup.tsx
    /Feed.tsx
    /NotFound.tsx
  /App.tsx
  /main.tsx
  /index.css
```

#### Routing:
- React Router v6 configured
- Routes:
  - `/` - Landing (public)
  - `/login` - Login (public)
  - `/signup` - Signup (public)
  - `/feed` - Feed (protected)
  - `*` - 404 (public)

#### State Management:
- React Context for auth
- React Query for server state (configured, not yet used)
- Toast notifications (Sonner)

#### Environment:
- Supabase URL and keys configured in `.env`
- Client initialized in `client.ts`

---

## ✅ Completed (Phase 2: Post Creation)

**Status: FULLY WORKING ✅**

### Post Creation
- ✅ Create post page (`/create`)
- ✅ Image upload component (drag-drop, file picker)
- ✅ Multi-slide carousel builder (1-12 images)
- ✅ Per-slide caption editor (500 chars)
- ✅ **Alt text input for accessibility** (200 chars, screen reader support)
- ✅ Template selector per slide (Image Full, Image+Note, Quote, Side-by-Side)
- ✅ Draft auto-save to localStorage (every 30s)
- ✅ Publish flow (uploads to Supabase Storage)
- ✅ Image validation (10MB max, JPG/PNG/WebP)
- ✅ Slide reordering with drag handles
- ✅ Post settings (caption, AI flag, privacy)

### Feed Display
- ✅ Home feed with real posts from database
- ✅ Post card component with carousel
- ✅ Infinite scroll pagination
- ✅ Post metadata (avatar, username, timestamp)
- ✅ Slide navigation (arrows, dots)
- ✅ Empty state handling

---

## ✅ Completed (Phase 3: Post Viewer)

**Status: FULLY WORKING ✅**

### Post Viewer
- ✅ Individual post page (`/post/:postId`)
- ✅ Full-screen carousel display
- ✅ Per-slide caption rendering
- ✅ Post metadata (author, timestamp)
- ✅ Link from feed to post viewer
- ✅ 404 handling for non-existent posts

---

## ✅ Completed (Phase 4: Profiles)

**Status: FULLY WORKING ✅**

### Profile Pages
- ✅ Profile page (`/profile/:username`)
- ✅ Profile header with avatar, display name, username, bio
- ✅ User stats (posts count, followers, following)
- ✅ Follow/unfollow button for other users
- ✅ Edit Profile dialog (own profile only)
- ✅ Avatar upload to Supabase Storage
- ✅ Display name and bio editing (500 chars)
- ✅ Clickable avatar/username navigation from feed
- ✅ Tabs for Posts/Collections (posts grid placeholder)
- ✅ Empty state for users with no posts
- ✅ Loading skeleton states

---

## ✅ Completed (Phase 5: Social Features)

**Status: LIKES & COMMENTS WORKING ✅**

### Like System
- ✅ Like button component with optimistic UI
- ✅ Like/unlike toggle functionality
- ✅ Real-time like count display
- ✅ Liked state persisted to database
- ✅ Visual feedback (filled heart, red color)
- ✅ Integrated into PostCard and PostView
- ✅ Auth check (redirects to login)
- ✅ Custom hook for like management (`useLikes`)

### Comment System
- ✅ Comment input component with character limit (500 chars)
- ✅ Comment list with author info and timestamps
- ✅ Post/Edit/Delete own comments
- ✅ Real-time comment updates (Supabase Realtime)
- ✅ Edit indicator for modified comments
- ✅ Dropdown menu for comment actions
- ✅ Empty state for no comments
- ✅ Comment count display
- ✅ Toggle comments visibility
- ✅ Custom hook for comment management (`useComments`)
- ✅ Real-time subscription for INSERT/UPDATE/DELETE

---

## ✅ Completed (Phase 3: Discovery)

**Status: EXPLORE PAGE WORKING ✅**

### Explore Page
- ✅ Explore page (`/explore`) with three discovery modes
- ✅ **Trending tab**: Posts sorted by view count
- ✅ **New tab**: Posts sorted by creation date
- ✅ **Random tab**: Randomized post discovery
- ✅ Tab navigation with icons
- ✅ Grid layout with PostCard components
- ✅ Loading skeletons for better UX
- ✅ Empty states for each mode
- ✅ Custom hook for explore data (`useExplorePosts`)
- ✅ Navigation link in Navbar
- ✅ Public access (no auth required)

---

## 🚧 Not Yet Built

### Phase 6: Saves/Bookmarks
- [ ] Save/bookmark button on posts
- [ ] Saved posts page
- [ ] Quick save functionality (separate from collections)

### Phase 7: Collections (Remaining)
- [ ] Save to collection button
- [ ] Collection picker modal
- [ ] Create collection flow
- [ ] Collections page
- [ ] Collection detail page
- [ ] Featured collection widget

### Phase 8: Moderation
- [ ] Report button
- [ ] Admin dashboard
- [ ] Content removal flow
- [ ] Appeal system

### Phase 9: Polish
- [ ] Legal pages (privacy, terms, guidelines)
- [ ] Onboarding flow
- [ ] Open Graph meta tags
- [ ] Sentry error monitoring
- [ ] Plausible analytics
- [ ] Mobile responsive testing
- [ ] Performance optimization

---

## 🔒 Security Features Implemented

✅ **Row Level Security (RLS)**: All tables have policies
✅ **Email verification**: Enforced via Supabase Auth
✅ **Reserved usernames**: Prevents squatting on @admin, @zine, @help, @support, @moderator, @official, @team, @staff
✅ **Username validation**: Format and length constraints (3-20 chars, lowercase, alphanumeric + underscores)
✅ **Self-follow prevention**: Database constraint
✅ **Password requirements**: Min 8 chars, 1 uppercase, 1 number
✅ **Age verification**: 13+ years (COPPA compliance)
✅ **Auth token management**: Auto-refresh handled by Supabase
⚠️ **Leaked password protection**: Should be enabled in Supabase Auth settings (dashboard)

---

## 🚀 Ready for Phase 2

**Next Steps:**
1. Build create post page with image upload
2. Implement carousel composer UI
3. Create image processing edge function
4. Add draft auto-save
5. Build publish flow

**Estimated Time:** 2-3 days for full post creation system

---

## 📊 Success Metrics to Track (Future)

- [ ] User signups
- [ ] Email verification rate
- [ ] Posts created per user
- [ ] D7/D30 retention
- [ ] Profile customization rate
- [ ] Collections created
- [ ] Engagement (likes, comments, saves)

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Routing | React Router v6 |
| State | React Query + Context |
| Forms | Native React + validation |
| Notifications | Sonner (toast) |

---

## 📝 Notes

- Database schema matches MVP requirements exactly
- All RLS policies tested and working
- Auth flow complete with proper session handling
- Design system uses semantic color tokens (no hardcoded colors)
- Mobile-responsive from day one
- Performance optimized (lazy loading ready, indexes in place)

---

**Last Updated:** October 27, 2025
**Current Phase:** Phase 3 (Discovery - Explore) ✅
**Next Phase:** User Search & Notifications 🚧

---

## 🎯 Current Sprint: User Search

Next to build:
1. User search functionality
2. Search bar in navbar or dedicated search page
3. Then: Notification system for social interactions
