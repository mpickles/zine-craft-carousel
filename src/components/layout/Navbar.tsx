import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { User, LogOut, Settings, Menu, Home, Compass, Plus } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url, display_name")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-border-light bg-[rgba(255,248,240,0.95)] sticky top-0 z-50 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo - ZINE Editorial Wordmark */}
        <h1
          className="text-2xl sm:text-3xl font-display font-bold text-brand-primary cursor-pointer tracking-tight uppercase transition-colors hover:text-brand-accent"
          onClick={() => navigate(user ? "/feed" : "/")}
        >
          ZINE
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/feed")}>
                Feed
              </Button>
              <Button variant="ghost" onClick={() => navigate("/explore")}>
                Explore
              </Button>
              <Button variant="default" onClick={() => navigate("/create")}>
                Create
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-brand-accent text-white">
                        {getInitials(profile?.display_name || profile?.username || user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-bg-elevated border-border-light z-50">
                  <DropdownMenuItem
                    onClick={() => {
                      if (profile?.username) {
                        navigate(`/profile/${profile.username}`);
                      } else {
                        toast.error("Please set your username first");
                        navigate("/settings");
                      }
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-error">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <ThemeToggle />
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
              <ThemeToggle />
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/create")}
              className="h-11 w-11"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-bg-elevated border-border-light">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {user ? (
                  <>
                    {/* Profile Card */}
                    <div className="flex items-center gap-3 p-3 mb-4 border-b border-border-light">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-brand-accent text-white">
                          {getInitials(profile?.display_name || profile?.username || user.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {profile?.display_name || profile?.username || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{profile?.username || "username"}
                        </p>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/feed")}
                    >
                      <Home className="mr-3 h-5 w-5" />
                      Feed
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/explore")}
                    >
                      <Compass className="mr-3 h-5 w-5" />
                      Explore
                    </Button>
                    <Button 
                      variant="default" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/create")}
                    >
                      <Plus className="mr-3 h-5 w-5" />
                      Create Post
                    </Button>
                    <div className="my-2 border-t" />
                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base" 
                      onClick={() => {
                        if (profile?.username) {
                          handleNavigation(`/profile/${profile.username}`);
                        } else {
                          toast.error("Please set your username first");
                          handleNavigation("/settings");
                        }
                      }}
                    >
                      <User className="mr-3 h-5 w-5" />
                      Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/settings")}
                    >
                      <Settings className="mr-3 h-5 w-5" />
                      Settings
                    </Button>
                    <div className="my-2 border-t border-border-light" />
                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base text-error" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/login")}
                    >
                      Log In
                    </Button>
                    <Button 
                      variant="default" 
                      className="justify-start h-12 text-base" 
                      onClick={() => handleNavigation("/signup")}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
