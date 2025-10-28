import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { X, ChevronLeft, ChevronRight, Share2, MoreVertical } from "lucide-react";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/post/LikeButton";
import { SaveButton } from "@/components/collections/SaveButton";
import { CommentInput } from "@/components/post/CommentInput";
import { CommentList } from "@/components/post/CommentList";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface PostViewerModalProps {
  postId: string;
  onClose: () => void;
  context: "feed" | "profile" | "explore";
  userId?: string; // For profile context
  onNavigate?: (postId: string) => void; // Callback when navigating to adjacent post
  adjacentPostIds?: {
    prev: string | null;
    next: string | null;
  };
}

export const PostViewerModal = ({
  postId,
  onClose,
  context,
  userId,
  onNavigate,
  adjacentPostIds,
}: PostViewerModalProps) => {
  const { data: post, isLoading, error } = usePost(postId);
  const { comments, isLoading: commentsLoading, postComment, updateComment, deleteComment } = useComments(postId);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingAdjacent, setIsLoadingAdjacent] = useState(false);

  const sortedImages = post?.post_images?.sort((a, b) => a.order_index - b.order_index) || [];
  const totalSlides = sortedImages.length;

  // Track view after 3 seconds
  useEffect(() => {
    if (!postId) return;
    
    const timer = setTimeout(async () => {
      try {
        const { data: currentPost } = await supabase
          .from('posts')
          .select('view_count')
          .eq('id', postId)
          .single();
        
        if (currentPost) {
          await supabase
            .from('posts')
            .update({ view_count: (currentPost.view_count || 0) + 1 })
            .eq('id', postId);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [postId]);

  // Preload adjacent slides
  useEffect(() => {
    if (currentSlide < totalSlides - 1) {
      const nextImage = new Image();
      nextImage.src = sortedImages[currentSlide + 1].image_url;
    }
    if (currentSlide > 0) {
      const prevImage = new Image();
      prevImage.src = sortedImages[currentSlide - 1].image_url;
    }
  }, [currentSlide, sortedImages, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        if (e.shiftKey && adjacentPostIds?.prev && onNavigate) {
          onNavigate(adjacentPostIds.prev);
        } else if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (e.shiftKey && adjacentPostIds?.next && onNavigate) {
          onNavigate(adjacentPostIds.next);
        } else if (currentSlide < totalSlides - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, totalSlides, onClose, adjacentPostIds, onNavigate]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (adjacentPostIds?.next && onNavigate) {
        onNavigate(adjacentPostIds.next);
      }
    },
    onSwipedRight: () => {
      if (currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      } else if (adjacentPostIds?.prev && onNavigate) {
        onNavigate(adjacentPostIds.prev);
      }
    },
    onSwipedDown: (e) => {
      // Only close on swipe down from top area
      if (e.initial[1] < 100) {
        onClose();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post?.profiles.username}`,
        text: post?.caption || "Check out this post!",
        url: `${window.location.origin}/p/${postId}`,
      });
    } catch (error) {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${postId}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </motion.div>
    );
  }

  if (error || !post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="bg-background rounded-lg p-8 max-w-md mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This post may have been deleted or is private.
          </p>
          <Button onClick={onClose}>Go Back</Button>
        </div>
      </motion.div>
    );
  }

  const currentImage = sortedImages[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-safe md:p-section"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Post viewer"
    >
      <div className="w-full h-full max-w-modal mx-auto flex flex-col bg-black rounded-none md:rounded-component overflow-hidden">
        {/* Header with breathing room */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close post viewer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <Link
            to={`/profile/${post.profiles.username}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.profiles.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.profiles.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold text-sm">
              @{post.profiles.username}
            </span>
          </Link>

          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Main Content Area with proper spacing */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Image Carousel with padding */}
          <div className="relative flex-1 flex items-center justify-center bg-black p-safe" {...swipeHandlers}>
            {/* Navigation Arrows (Desktop) */}
            {currentSlide > 0 && (
              <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {currentSlide < totalSlides - 1 && (
              <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Post Navigation (when at boundaries) */}
            {currentSlide === 0 && adjacentPostIds?.prev && onNavigate && (
              <button
                onClick={() => onNavigate(adjacentPostIds.prev!)}
                className="hidden md:flex absolute left-4 bottom-4 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Post
              </button>
            )}

            {currentSlide === totalSlides - 1 && adjacentPostIds?.next && onNavigate && (
              <button
                onClick={() => onNavigate(adjacentPostIds.next!)}
                className="hidden md:flex absolute right-4 bottom-4 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors items-center gap-2"
              >
                Next Post
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-full p-4"
              >
                <img
                  src={currentImage?.image_url}
                  alt={currentImage?.caption || `Slide ${currentSlide + 1}`}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators (Dots) */}
            {totalSlides > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 px-3 py-2 rounded-full">
                {sortedImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? "bg-white w-6" : "bg-white/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full">
              {currentSlide + 1} / {totalSlides}
            </div>
          </div>

          {/* Per-Slide Caption */}
          <AnimatePresence mode="wait">
            {currentImage?.caption && (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-3 bg-black/50 backdrop-blur-sm border-t border-white/10 max-h-[150px] overflow-y-auto"
              >
                <p className="text-white text-sm leading-relaxed">
                  {currentImage.caption}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Bar */}
          <div className="flex items-center gap-4 px-4 py-3 bg-black/50 backdrop-blur-md border-t border-white/10">
            <div className="flex items-center gap-3">
              <LikeButton postId={post.id} variant="minimal" />
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
              >
                <span className="text-2xl">💬</span>
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <SaveButton postId={post.id} size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:text-white/80"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Post Info */}
          <div className="px-4 py-3 bg-black/50 backdrop-blur-md border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to={`/profile/${post.profiles.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.profiles.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {post.profiles.display_name || post.profiles.username}
                    </p>
                    <p className="text-white/60 text-xs">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Comments Section (Collapsible) */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-black/50 backdrop-blur-md border-t border-white/10 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-white font-semibold text-sm">
                    Comments ({comments.length}) ▲
                  </h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto px-4 py-2">
                  <CommentList
                    comments={comments}
                    onUpdate={(commentId: string, content: string) => updateComment({ commentId, content })}
                    onDelete={(commentId: string) => deleteComment(commentId)}
                  />
                </div>
                <div className="px-4 py-3 border-t border-white/10">
                  <CommentInput onSubmit={postComment} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
