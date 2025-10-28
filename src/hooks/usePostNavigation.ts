import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UsePostNavigationProps {
  context: "feed" | "profile" | "explore";
  userId?: string;
  currentPostId: string;
}

interface AdjacentPostIds {
  prev: string | null;
  next: string | null;
}

export const usePostNavigation = ({ context, userId, currentPostId }: UsePostNavigationProps) => {
  const [adjacentPostIds, setAdjacentPostIds] = useState<AdjacentPostIds>({ prev: null, next: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdjacentPosts = async () => {
      if (!currentPostId) return;

      setIsLoading(true);

      try {
        // Get current post to find its created_at timestamp
        const { data: currentPost } = await supabase
          .from("posts")
          .select("created_at, user_id")
          .eq("id", currentPostId)
          .single();

        if (!currentPost) {
          setIsLoading(false);
          return;
        }

        if (context === "profile" && userId) {
          // Profile context: Navigate within user's posts
          const { data: prevPost } = await supabase
            .from("posts")
            .select("id")
            .eq("user_id", userId)
            .lt("created_at", currentPost.created_at)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: nextPost } = await supabase
            .from("posts")
            .select("id")
            .eq("user_id", userId)
            .gt("created_at", currentPost.created_at)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          setAdjacentPostIds({
            prev: prevPost?.id || null,
            next: nextPost?.id || null,
          });
        } else if (context === "feed") {
          // Feed context: Navigate through followed users' posts
          // First, get the list of users this user follows
          const { data: session } = await supabase.auth.getSession();
          if (!session.session?.user) {
            setAdjacentPostIds({ prev: null, next: null });
            setIsLoading(false);
            return;
          }

          const { data: follows } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", session.session.user.id);

          const followedUserIds = follows?.map((f) => f.following_id) || [];

          if (followedUserIds.length === 0) {
            setAdjacentPostIds({ prev: null, next: null });
            setIsLoading(false);
            return;
          }

          const { data: prevPost } = await supabase
            .from("posts")
            .select("id")
            .in("user_id", followedUserIds)
            .eq("is_private", false)
            .lt("created_at", currentPost.created_at)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: nextPost } = await supabase
            .from("posts")
            .select("id")
            .in("user_id", followedUserIds)
            .eq("is_private", false)
            .gt("created_at", currentPost.created_at)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          setAdjacentPostIds({
            prev: prevPost?.id || null,
            next: nextPost?.id || null,
          });
        } else if (context === "explore") {
          // Explore context: Navigate through all public posts
          const { data: prevPost } = await supabase
            .from("posts")
            .select("id")
            .eq("is_private", false)
            .lt("created_at", currentPost.created_at)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: nextPost } = await supabase
            .from("posts")
            .select("id")
            .eq("is_private", false)
            .gt("created_at", currentPost.created_at)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          setAdjacentPostIds({
            prev: prevPost?.id || null,
            next: nextPost?.id || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch adjacent posts:", error);
        setAdjacentPostIds({ prev: null, next: null });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdjacentPosts();
  }, [context, userId, currentPostId]);

  return { adjacentPostIds, isLoading };
};
