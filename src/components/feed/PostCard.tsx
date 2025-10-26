import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostImage {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  order_index: number;
  template: string;
}

interface Post {
  id: string;
  caption: string | null;
  created_at: string;
  is_ai_generated: boolean;
  user_id: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  post_images: PostImage[];
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = post.post_images.sort((a, b) => a.order_index - b.order_index);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`/profile/${post.profiles.username}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback>
              {post.profiles.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link
            to={`/profile/${post.profiles.username}`}
            className="font-semibold text-sm hover:underline"
          >
            {post.profiles.display_name || post.profiles.username}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative aspect-square bg-muted">
        <img
          src={images[currentSlide]?.image_url}
          alt={images[currentSlide]?.caption || "Post image"}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? "bg-foreground w-6"
                      : "bg-foreground/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-4">
        <Button variant="ghost" size="icon">
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="text-sm">
            <Link
              to={`/profile/${post.profiles.username}`}
              className="font-semibold hover:underline mr-2"
            >
              {post.profiles.username}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {/* AI Badge */}
      {post.is_ai_generated && (
        <div className="px-4 pb-4">
          <span className="text-xs text-muted-foreground">AI Generated</span>
        </div>
      )}
    </Card>
  );
};
