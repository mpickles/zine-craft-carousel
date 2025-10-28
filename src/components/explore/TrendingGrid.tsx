import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface Post {
  id: string;
  caption: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  post_images: {
    id: string;
    image_url: string;
    thumbnail_url: string | null;
  }[];
  view_count: number;
  saves_count?: number;
}

interface TrendingGridProps {
  posts: Post[];
  onOpenModal: (postId: string) => void;
}

export const TrendingGrid = ({ posts, onOpenModal }: TrendingGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {posts.map((post) => {
        const firstImage = post.post_images[0];
        const slideCount = post.post_images.length;
        const savesCount = post.saves_count || 0;

        return (
          <div
            key={post.id}
            onClick={() => onOpenModal(post.id)}
            className="relative cursor-pointer group overflow-hidden rounded-lg bg-bg-secondary border border-border-light hover:border-border-medium transition-all duration-150"
          >
            {/* Thumbnail */}
            <div className="aspect-square overflow-hidden">
              <OptimizedImage
                src={firstImage.thumbnail_url || firstImage.image_url}
                alt={post.caption || "Post image"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Slide count badge */}
            {slideCount > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded font-mono text-xs backdrop-blur-sm">
                {slideCount} slides
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <p className="font-mono text-sm font-medium">@{post.profiles.username}</p>
                <p className="text-xs mt-1 font-primary">❤️ {savesCount} saves</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
