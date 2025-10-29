import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileBlock } from "@/hooks/useProfileBlocks";
import { BlockRenderer } from "./customize/blocks/BlockRenderer";
import { Skeleton } from "@/components/ui/skeleton";

interface FrontPageProps {
  userId: string;
}

export const FrontPage = ({ userId }: FrontPageProps) => {
  const [blocks, setBlocks] = useState<ProfileBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlocks();
  }, [userId]);

  const loadBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from("profile_blocks")
        .select("*")
        .eq("user_id", userId)
        .order("block_order", { ascending: true });

      if (error) throw error;
      setBlocks(data as ProfileBlock[]);
    } catch (error) {
      console.error("Error loading blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No content yet. Customize your front page to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.id}>
          <BlockRenderer
            block={block}
            userId={userId}
            isEditMode={false}
          />
        </div>
      ))}
    </div>
  );
};
