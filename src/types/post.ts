/**
 * Post Creation Types
 * Defines the structure for carousel post creation with image editing capabilities
 */

export interface CropData {
  x: number;      // 0-1 (percentage)
  y: number;      // 0-1 (percentage)
  width: number;  // 0-1 (percentage)
  height: number; // 0-1 (percentage)
  zoom: number;   // 1-3
}

export interface ImageEdits {
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
    aspect: number | null;
  } | null;
  rotation: number; // degrees: 0, 90, 180, 270
  flipHorizontal: boolean;
  filter: 'original' | 'bw' | 'vintage' | 'vibrant';
  adjustments: {
    brightness: number; // 0-200, default 100
    contrast: number; // 0-200, default 100
    saturation: number; // 0-200, default 100
  };
  fitMode: 'cover' | 'contain'; // How image fills container
}

export interface Slide {
  id: string;
  imageFile: File;
  imageUrl: string; // Local preview URL
  uploadedUrl?: string; // Supabase storage URL after upload
  caption: string;
  altText?: string; // Optional alt text
  order: number;
  edits: ImageEdits;
  aspectRatio: '1:1' | '4:5' | '16:9' | '21:9';
  fitMode: 'cover' | 'contain';
  cropData?: CropData;
}

export interface TaggedUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface PostDraft {
  // Note: Slides with File objects cannot be serialized to localStorage
  // Only metadata (tags, settings, location, tagged users) can be persisted
  tags: string[];
  isAIGenerated: boolean;
  visibility: 'public' | 'followers';
  location: string;
  taggedUsers: TaggedUser[];
  lastSaved: number;
}

export const DEFAULT_IMAGE_EDITS: ImageEdits = {
  crop: null,
  rotation: 0,
  flipHorizontal: false,
  filter: 'original',
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  fitMode: 'cover',
};

export const ASPECT_RATIOS = {
  square: '1:1' as const,
  portrait: '4:5' as const,
  landscape: '16:9' as const,
  wide: '21:9' as const,
};

export const ASPECT_RATIO_VALUES: Record<string, number> = {
  '1:1': 1.0,
  '4:5': 0.8,
  '16:9': 1.78,
  '21:9': 2.33,
};

export const AVAILABLE_TAGS = [
  'Design',
  'Art',
  'Photography',
  'Tutorial',
  'Process',
  'Illustration',
  'Typography',
  'Branding',
  'UI/UX',
  '3D',
  'Animation',
  'Web',
  'Product',
  'Fashion',
  'Architecture',
  'Digital Art',
  'Traditional Art',
  'Sketch',
  'Concept Art',
  'Character Design',
];

export const MAX_SLIDES = 12;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_CAPTION_LENGTH = 2200;
export const MAX_TAGS = 3;
export const MAX_TAGGED_USERS = 5; // Instagram standard
export const MAX_LOCATION_LENGTH = 100;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
