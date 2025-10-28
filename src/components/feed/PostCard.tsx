import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Bookmark, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SaveButton } from "@/components/collections/SaveButton";

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

interface PostCardPropsExtended extends PostCardProps {
  onOpenModal?: (postId: string) => void;
}

export const PostCard = ({ post, onOpenModal }: PostCardPropsExtended) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = post.post_images.sort((a, b) => a.order_index - b.order_index);

  const handleCardClick = () => {
    if (onOpenModal) {
      onOpenModal(post.id);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: `Post by ${post.profiles.username}`,
        text: post.caption || "Check out this post!",
        url: `${window.location.origin}/post/${post.id}`,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const truncateText = (text: string, maxLines: number = 2) => {
    const words = text.split(" ");
    if (words.length > 20) {
      return words.slice(0, 20).join(" ") + "...more";
    }
    return text;
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link 
          to={`/profile/${post.profiles.username}`}
          onClick={(e) => e.stopPropagation()}
        >
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
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-sm hover:underline"
          >
            {post.profiles.display_name || post.profiles.username}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* First Slide Preview (400x400 thumbnail) */}
      <div className="relative aspect-square bg-muted">
        <OptimizedImage
          src={images[0]?.thumbnail_url || images[0]?.image_url}
          alt={images[0]?.caption || "Post image"}
          aspectRatio="square"
          className="w-full h-full object-cover"
        />
        
        {/* Slide Count Indicator */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            1/{images.length}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-4">
        <SaveButton postId={post.id} size="sm" />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>

      {/* Caption (truncated to 2 lines) */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="text-sm line-clamp-2">
            <Link
              to={`/profile/${post.profiles.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold hover:underline mr-2"
            >
              {post.profiles.username}
            </Link>
            <span className="text-muted-foreground">
              {truncateText(post.caption)}
            </span>
          </p>
        </div>
      )}

      {/* AI Badge */}
      {post.is_ai_generated && (
        <div className="px-4 pb-3">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            🤖 AI Generated
          </span>
        </div>
      )}
    </Card>
  );
};
