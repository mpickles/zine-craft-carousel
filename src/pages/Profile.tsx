import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Settings, Grid, FolderOpen } from "lucide-react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { FollowButton } from "@/components/profile/FollowButton";

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
  followers: number;
  following: number;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0, followers: 0, following: 0 });
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

      // Fetch stats
      const [postsCount, followersCount, followingCount, followStatus] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profileData.id),
        supabase
          .from("follows")
          .select("follower_id", { count: "exact", head: true })
          .eq("following_id", profileData.id),
        supabase
          .from("follows")
          .select("following_id", { count: "exact", head: true })
          .eq("follower_id", profileData.id),
        user
          ? supabase
              .from("follows")
              .select("follower_id")
              .eq("follower_id", user.id)
              .eq("following_id", profileData.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      setStats({
        posts: postsCount.count || 0,
        followers: followersCount.count || 0,
        following: followingCount.count || 0,
      });

      setIsFollowing(!!followStatus.data);
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
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(profile.display_name || profile.username)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {profile.display_name || profile.username}
                    </h2>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <FollowButton
                      profileId={profile.id}
                      isFollowing={isFollowing}
                      onFollowChange={(following) => {
                        setIsFollowing(following);
                        setStats((prev) => ({
                          ...prev,
                          followers: following ? prev.followers + 1 : prev.followers - 1,
                        }));
                      }}
                    />
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-4">
                  <div className="text-center">
                    <div className="font-bold text-xl">{stats.posts}</div>
                    <div className="text-sm text-muted-foreground">posts</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-primary">
                    <div className="font-bold text-xl">{stats.followers}</div>
                    <div className="text-sm text-muted-foreground">followers</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-primary">
                    <div className="font-bold text-xl">{stats.following}</div>
                    <div className="text-sm text-muted-foreground">following</div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-8">
              <button className="pb-3 border-b-2 border-primary text-primary font-medium flex items-center gap-2">
                <Grid className="w-4 h-4" />
                Posts
              </button>
              <button className="pb-3 text-muted-foreground hover:text-foreground flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Collections
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.posts === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                {isOwnProfile && (
                  <Button onClick={() => navigate("/create")}>Create your first post</Button>
                )}
              </div>
            ) : (
              // Placeholder for future posts
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                Posts grid coming soon...
              </div>
            )}
          </div>
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
