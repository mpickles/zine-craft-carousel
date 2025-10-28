import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Bookmark, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { LikeButton } from "@/components/post/LikeButton";
import { CommentInput } from "@/components/post/CommentInput";
import { CommentList } from "@/components/post/CommentList";

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePost(postId!);
  const { comments, isLoading: commentsLoading, postComment, updateComment, deleteComment } = useComments(postId!);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This post doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate("/feed")}>Back to Feed</Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const images = post.post_images.sort((a, b) => a.order_index - b.order_index);
  
  const pageTitle = post.caption 
    ? `${post.caption.slice(0, 60)}${post.caption.length > 60 ? '...' : ''} - @${post.profiles.username} on Zine`
    : `Post by @${post.profiles.username} on Zine`;
  
  const pageDescription = post.caption || `Check out this post by @${post.profiles.username} on Zine`;
  const pageImage = images[0]?.image_url || "";
  const pageUrl = typeof window !== 'undefined' ? window.location.href : "";

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      nextSlide();
    }
    if (isRightSwipe && images.length > 1) {
      prevSlide();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {pageImage && <meta property="og:image" content={pageImage} />}
        <meta property="article:published_time" content={post.created_at} />
        <meta property="article:author" content={post.profiles.username} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {pageImage && <meta name="twitter:image" content={pageImage} />}
      </Helmet>
      
      <Navbar />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 sm:p-4">
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
            <div 
              className="relative aspect-square bg-muted"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <OptimizedImage
                src={images[currentSlide]?.image_url}
                alt={images[currentSlide]?.caption || "Post image"}
                aspectRatio="square"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-11 w-11"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-11 w-11"
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
                        className={`h-2 rounded-full transition-all touch-none ${
                          idx === currentSlide
                            ? "bg-foreground w-8"
                            : "bg-foreground/40 w-2"
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
              <LikeButton postId={post.id} variant="minimal" />
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>

            {/* Slide Caption */}
            {images[currentSlide]?.caption && (
              <div className="px-4 pb-2">
                <p className="text-sm text-muted-foreground italic">
                  Slide {currentSlide + 1}: {images[currentSlide].caption}
                </p>
              </div>
            )}

            {/* Post Caption */}
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

            {/* Comments Section */}
            {showComments && (
              <>
                <Separator />
                <div className="p-4 space-y-6">
                  <h3 className="font-semibold text-sm">
                    Comments ({comments.length})
                  </h3>

                  {/* Comment Input */}
                  <CommentInput onSubmit={postComment} />

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : (
                    <CommentList
                      comments={comments}
                      onUpdate={(commentId, content) => updateComment({ commentId, content })}
                      onDelete={deleteComment}
                    />
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PostView;
