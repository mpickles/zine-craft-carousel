import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  variant?: "default" | "minimal";
  showCount?: boolean;
}

export const LikeButton = ({ postId, variant = "default", showCount = true }: LikeButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { likeCount, isLiked, toggleLike } = useLikes(postId);

  const handleLike = () => {
    if (!user) {
      toast.error("Please log in to like posts");
      navigate("/login");
      return;
    }
    toggleLike();
  };

  if (variant === "minimal") {
    return (
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center gap-2 transition-colors",
          isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Heart
          className={cn("w-5 h-5", isLiked && "fill-current")}
        />
        {showCount && <span className="text-sm font-medium">{likeCount}</span>}
      </button>
    );
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      className={cn(
        "gap-2",
        isLiked && "bg-red-500 hover:bg-red-600 border-red-500"
      )}
    >
      <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
};
