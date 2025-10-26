import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    if (user) {
      checkUsername();
    }
  }, [user]);

  const checkUsername = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (data?.username) {
      setHasUsername(true);
      setUsername(data.username);
    }
  };

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate username format
      const usernameRegex = /^[a-z0-9_]{3,20}$/;
      if (!usernameRegex.test(username.toLowerCase())) {
        toast.error("Username must be 3-20 characters: lowercase letters, numbers, and underscores only");
        setLoading(false);
        return;
      }

      // Check reserved usernames
      const { data: reserved } = await supabase
        .from("reserved_usernames")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (reserved) {
        toast.error("This username is reserved");
        setLoading(false);
        return;
      }

      // Check if username is taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .neq("id", user!.id)
        .maybeSingle();

      if (existingUser) {
        toast.error("Username is already taken");
        setLoading(false);
        return;
      }

      // Update username
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.toLowerCase() })
        .eq("id", user!.id);

      if (error) throw error;

      toast.success("Username set successfully!");
      setHasUsername(true);
      navigate(`/profile/${username.toLowerCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Settings</h2>

          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>
                {hasUsername
                  ? "Your username is set. Username changes are not currently supported."
                  : "Set your username to create your profile."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetUsername} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    pattern="^[a-z0-9_]{3,20}$"
                    title="3-20 characters, lowercase letters, numbers, and underscores only"
                    disabled={hasUsername}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    3-20 characters, lowercase letters, numbers, and underscores only
                  </p>
                </div>
                {!hasUsername && (
                  <Button type="submit" disabled={loading}>
                    {loading ? "Setting..." : "Set Username"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
