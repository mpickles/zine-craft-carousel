import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, ExternalLink } from "lucide-react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { FollowButton } from "@/components/profile/FollowButton";
import { PostsGrid } from "@/components/profile/PostsGrid";
import { CollectionsGrid } from "@/components/profile/CollectionsGrid";
import { FrontPage } from "@/components/profile/FrontPage";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
}

interface Stats {
  posts: number;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0 });
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.id === profile?.id;

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) {
        toast.error("Profile not found");
        navigate("/feed");
        return;
      }

      setProfile(profileData);

      // Fetch post count
      const { count: postsCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profileData.id);

      setStats({
        posts: postsCount || 0,
      });

      // Check follow status if viewing another profile
      if (user && user.id !== profileData.id) {
        const { data: followStatus } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", profileData.id)
          .maybeSingle();

        setIsFollowing(!!followStatus);
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <Card className="p-4 sm:p-6 lg:p-8 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
              {/* Avatar - Responsive size */}
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 lg:h-48 lg:w-48 border-4 border-primary/20 mx-auto sm:mx-0">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl bg-primary text-primary-foreground">
                  {getInitials(profile.display_name || profile.username)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                      {profile.display_name || profile.username}
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground">@{profile.username}</p>
                  </div>
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <FollowButton
                      profileId={profile.id}
                      isFollowing={isFollowing}
                      onFollowChange={setIsFollowing}
                    />
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 sm:gap-6 justify-center sm:justify-start">
                  <div>
                    <span className="font-bold text-lg sm:text-xl">{stats.posts}</span>
                    <span className="text-sm sm:text-base text-muted-foreground ml-2">posts</span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Links (placeholder - will be implemented when we add links to DB) */}
                <div className="flex flex-wrap gap-2">
                  {/* Example link */}
                  {/* <Button variant="outline" size="sm" asChild>
                    <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Website
                    </a>
                  </Button> */}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs Navigation */}
          <Tabs defaultValue="front-page" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
              <TabsTrigger
                value="front-page"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm sm:text-base whitespace-nowrap px-3 sm:px-4"
              >
                Front Page
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm sm:text-base whitespace-nowrap px-3 sm:px-4"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm sm:text-base whitespace-nowrap px-3 sm:px-4"
              >
                Collections
              </TabsTrigger>
            </TabsList>

            {/* Front Page Tab */}
            <TabsContent value="front-page" className="mt-4 sm:mt-6">
              <FrontPage
                userId={profile.id}
                bio={profile.bio || undefined}
              />
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-4 sm:mt-6">
              <PostsGrid
                userId={profile.id}
                isOwnProfile={isOwnProfile}
                onCreateClick={() => navigate("/create")}
              />
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections" className="mt-4 sm:mt-6">
              <CollectionsGrid
                userId={profile.id}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={profile}
          onProfileUpdate={(updated) => {
            setProfile(updated);
            toast.success("Profile updated!");
          }}
        />
      )}
    </div>
  );
};

export default Profile;
