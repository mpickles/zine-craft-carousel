import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CollectionPickerModal } from "./CollectionPickerModal";
import { useNavigate } from "react-router-dom";

interface SaveButtonProps {
  postId: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export const SaveButton = ({ postId, size = "default", showLabel = true }: SaveButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user) {
      checkSaveStatus();
    }
  }, [user, postId]);

  const checkSaveStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("saves")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    setIsSaved(!!data);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }

    setShowPicker(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        className={isSaved ? "text-primary" : ""}
      >
        <Bookmark className={`w-4 h-4 ${showLabel ? "mr-1" : ""} ${isSaved ? "fill-current" : ""}`} />
        {showLabel && "Save"}
      </Button>

      <CollectionPickerModal
        open={showPicker}
        onOpenChange={setShowPicker}
        postId={postId}
        onSaveStatusChange={setIsSaved}
      />
    </>
  );
};
