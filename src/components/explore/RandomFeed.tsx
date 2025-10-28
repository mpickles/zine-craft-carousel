import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { SaveButton } from "@/components/collections/SaveButton";
import { formatDistanceToNow } from "date-fns";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  caption: string | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  post_images: {
    id: string;
    image_url: string;
    thumbnail_url: string | null;
  }[];
}

interface RandomFeedProps {
  posts: Post[];
  onOpenModal: (postId: string) => void;
}

export const RandomFeed = ({ posts, onOpenModal }: RandomFeedProps) => {
  const handleShare = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${postId}`);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => {
        const firstImage = post.post_images[0];
        const slideCount = post.post_images.length;
        const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

        return (
          <Card
            key={post.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-150"
            onClick={() => onOpenModal(post.id)}
          >
            {/* Creator info */}
            <Link
              to={`/profile/${post.profiles.username}`}
              className="flex items-center p-4 hover:bg-bg-secondary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.profiles.avatar_url || undefined} />
                <AvatarFallback className="bg-brand-accent text-white">
                  {post.profiles.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-mono font-medium text-sm text-text-primary">
                  @{post.profiles.username}
                </p>
                <p className="text-xs text-text-tertiary font-primary">{timeAgo}</p>
              </div>
            </Link>

            {/* Post image */}
            <div className="relative">
              <OptimizedImage
                src={firstImage.image_url}
                alt={post.caption || "Post image"}
                className="w-full h-auto"
              />
              {slideCount > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded font-mono text-xs backdrop-blur-sm">
                  {slideCount} slides
                </div>
              )}
            </div>

            {/* Post info */}
            <div className="p-4">
              {post.caption && (
                <p className="text-sm text-text-secondary line-clamp-2 font-primary mb-3">
                  {post.caption}
                </p>
              )}

              <div className="flex gap-3 items-center">
                <div onClick={(e) => e.stopPropagation()}>
                  <SaveButton postId={post.id} size="sm" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleShare(e, post.id)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
