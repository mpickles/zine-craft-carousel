/**
 * Post Creation Types
 * Defines the structure for carousel post creation with image editing capabilities
 */

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
}

export interface Slide {
  id: string;
  imageFile: File;
  imageUrl: string; // Local preview URL
  uploadedUrl?: string; // Supabase storage URL after upload
  caption: string;
  altText: string;
  order: number;
  edits: ImageEdits;
}

export interface PostDraft {
  slides: Slide[];
  currentSlideIndex: number;
  tags: string[];
  isAIGenerated: boolean;
  visibility: 'public' | 'followers';
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
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
