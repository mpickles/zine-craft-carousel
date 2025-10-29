import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfileBlock {
  id: string;
  user_id: string;
  block_order: number;
  block_type: string;
  block_data: any;
  grid_position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  created_at: string;
  updated_at: string;
}

export const useProfileBlocks = (userId: string) => {
  const queryClient = useQueryClient();

  // Fetch blocks
  const { data: blocks, isLoading } = useQuery({
    queryKey: ["profile-blocks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_blocks")
        .select("*")
        .eq("user_id", userId)
        .order("block_order", { ascending: true });

      if (error) throw error;
      return data as ProfileBlock[];
    },
    enabled: !!userId,
  });

  // Add block
  const addBlock = useMutation({
    mutationFn: async (blockData: Partial<ProfileBlock>) => {
      const maxOrder = blocks?.length || 0;
      const { data, error } = await supabase
        .from("profile_blocks")
        .insert({
          user_id: userId,
          block_order: maxOrder,
          block_type: blockData.block_type!,
          block_data: blockData.block_data || {},
          grid_position: blockData.grid_position || { x: 0, y: maxOrder * 4, w: 12, h: 4 },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-blocks", userId] });
      toast.success("Block added");
    },
  });

  // Update block
  const updateBlock = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProfileBlock> & { id: string }) => {
      const { error } = await supabase
        .from("profile_blocks")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-blocks", userId] });
    },
  });

  // Delete block
  const deleteBlock = useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from("profile_blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-blocks", userId] });
      toast.success("Block deleted");
    },
  });

  // Save all blocks (for drag and drop reordering)
  const saveBlocks = useMutation({
    mutationFn: async (updatedBlocks: ProfileBlock[]) => {
      const updates = updatedBlocks.map((block, index) => ({
        ...block,
        block_order: index,
      }));

      for (const block of updates) {
        await supabase
          .from("profile_blocks")
          .update({
            block_order: block.block_order,
            grid_position: block.grid_position,
          })
          .eq("id", block.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-blocks", userId] });
      toast.success("Profile saved!");
    },
  });

  return {
    blocks,
    isLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    saveBlocks,
  };
};
