/**
 * Image Optimization Utilities
 * Handles image URL generation with Supabase transforms
 */

import { supabase } from '@/integrations/supabase/client';
import type { CropData } from '@/types/post';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'cover' | 'contain';
  crop?: CropData;
}

/**
 * Generate optimized image URL from Supabase Storage
 * Uses Supabase's built-in image transformation API
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 1200,
    height,
    quality = 85,
    fit = 'cover',
  } = options;

  // If it's not a Supabase storage URL, return as-is
  if (!imageUrl || !imageUrl.includes('supabase')) {
    return imageUrl;
  }

  try {
    // Extract bucket and path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) return imageUrl;

    const [bucketAndPath] = pathParts[1].split('/');
    const bucket = bucketAndPath;
    const filePath = pathParts[1].substring(bucket.length + 1);

    // Build transform object
    const transform: any = {
      width,
      resize: fit,
      quality,
    };

    if (height) {
      transform.height = height;
    }

    // Get transformed URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath, { transform });

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to optimize image:', error);
    return imageUrl;
  }
}

/**
 * Get CSS object-position from crop data
 * Converts crop percentages to CSS positioning
 */
export function getCropPosition(cropData?: CropData): string {
  if (!cropData) return '50% 50%';
  
  // Convert 0-1 to percentage for CSS
  const x = cropData.x * 100;
  const y = cropData.y * 100;
  
  return `${x}% ${y}%`;
}

/**
 * Calculate aspect ratio numeric value from string
 */
export function getAspectRatioValue(aspectRatio: string): number {
  const ratios: Record<string, number> = {
    '1:1': 1.0,
    '4:5': 0.8,
    '16:9': 1.778,
    '21:9': 2.333,
  };
  
  return ratios[aspectRatio] || 1.0;
}

/**
 * Apply image edits to get CSS filter string
 */
export function getImageFilterStyle(
  filter: 'original' | 'bw' | 'vintage' | 'vibrant',
  adjustments: { brightness: number; contrast: number; saturation: number }
): string {
  const filterMap: Record<string, string> = {
    original: '',
    bw: 'grayscale(100%)',
    vintage: 'sepia(50%) contrast(110%)',
    vibrant: 'saturate(150%) contrast(110%)',
  };

  const baseFilter = filterMap[filter] || '';
  const { brightness, contrast, saturation } = adjustments;
  const adjustmentFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  return `${baseFilter} ${adjustmentFilter}`.trim();
}
