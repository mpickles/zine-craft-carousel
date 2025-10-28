import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [defaultPrivate, setDefaultPrivate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfileSettings();
    }
  }, [user]);

  const fetchProfileSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("is_private")
      .eq("id", user.id)
      .single();

    if (data) {
      setIsPrivate(data.is_private || false);
    }
  };

  const handlePrivacyToggle = async (value: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_private: value })
        .eq("id", user.id);

      if (error) throw error;

      setIsPrivate(value);
      toast.success(`Profile is now ${value ? "private" : "public"}`);
    } catch (error: any) {
      toast.error("Failed to update privacy settings");
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast.success("Confirmation email sent! Please check your inbox.");
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      toast.loading("Preparing your data export...", { id: "export" });

      // Fetch user data
      const [profileData, postsData, collectionsData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("posts").select("*, post_images(*)").eq("user_id", user.id),
        supabase.from("collections").select("*, collection_items(*)").eq("user_id", user.id),
      ]);

      const exportData = {
        profile: profileData.data,
        posts: postsData.data,
        collections: collectionsData.data,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!", { id: "export" });
    } catch (error: any) {
      toast.error("Failed to export data", { id: "export" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      toast.loading("Deleting account...", { id: "delete" });

      // Delete user data
      await Promise.all([
        supabase.from("profiles").delete().eq("id", user.id),
        supabase.from("posts").delete().eq("user_id", user.id),
        supabase.from("collections").delete().eq("user_id", user.id),
      ]);

      // Sign out
      await supabase.auth.signOut();

      toast.success("Account deleted", { id: "delete" });
      navigate("/");
    } catch (error: any) {
      toast.error("Failed to delete account", { id: "delete" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control who can see your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Private Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Only followers can see your posts
                  </p>
                </div>
                <Switch checked={isPrivate} onCheckedChange={handlePrivacyToggle} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Default Post Privacy</Label>
                  <p className="text-sm text-muted-foreground">
                    New posts default to private
                  </p>
                </div>
                <Switch
                  checked={defaultPrivate}
                  onCheckedChange={setDefaultPrivate}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Change Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="new@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button onClick={handleEmailChange} disabled={loading}>
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive a confirmation email at the new address
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={loading}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Data & Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Account Management</CardTitle>
              <CardDescription>Export your data or delete your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Download all your data in JSON format
                </p>
              </div>

              <div className="pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers including:
                        <ul className="list-disc list-inside mt-2">
                          <li>Your profile</li>
                          <li>All your posts and images</li>
                          <li>All your collections</li>
                          <li>All your follows and followers</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2">
                  Once deleted, your account cannot be recovered
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
