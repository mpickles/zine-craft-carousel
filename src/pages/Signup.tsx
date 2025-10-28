import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password strength
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        setLoading(false);
        return;
      }
      if (!/[A-Z]/.test(password)) {
        toast.error("Password must contain at least 1 uppercase letter");
        setLoading(false);
        return;
      }
      if (!/[0-9]/.test(password)) {
        toast.error("Password must contain at least 1 number");
        setLoading(false);
        return;
      }

      // Validate age (13+ COPPA compliance)
      if (!birthdate) {
        toast.error("Birthdate is required");
        setLoading(false);
        return;
      }
      const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
      if (age < 13) {
        toast.error("You must be at least 13 years old to create an account");
        setLoading(false);
        return;
      }

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
        .maybeSingle();

      if (existingUser) {
        toast.error("Username is already taken");
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/feed`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username.toLowerCase(),
            birthdate: birthdate,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created! Check your email to verify, then log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary mb-4 inline-block">
            Zine
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join the community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <p className="text-xs text-muted-foreground">
                You must be 13 or older (COPPA compliance)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Min 8 characters, 1 uppercase, 1 number
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
