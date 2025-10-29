import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfileSection {
  id: string;
  user_id: string;
  section_order: number;
  section_type: string;
  background_color: string;
  background_image_url: string | null;
  padding_size: string;
  is_header: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileBlock {
  id: string;
  section_id: string;
  block_order: number;
  block_type: string;
  block_data: any;
  width: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileTheme {
  id: string;
  user_id: string;
  font_heading: string;
  font_body: string;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
}

export const useProfileCustomization = (userId: string) => {
  const queryClient = useQueryClient();

  // Fetch sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["profile-sections", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_sections")
        .select("*")
        .eq("user_id", userId)
        .order("section_order", { ascending: true });

      if (error) throw error;
      return data as ProfileSection[];
    },
    enabled: !!userId,
  });

  // Fetch blocks for all sections
  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["profile-blocks", userId],
    queryFn: async () => {
      if (!sections || sections.length === 0) return [];

      const { data, error } = await supabase
        .from("profile_blocks")
        .select("*")
        .in("section_id", sections.map((s) => s.id))
        .order("block_order", { ascending: true });

      if (error) throw error;
      return data as ProfileBlock[];
    },
    enabled: !!sections && sections.length > 0,
  });

  // Fetch theme
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ["profile-theme", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_themes")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as ProfileTheme;
    },
    enabled: !!userId,
  });

  // Add section
  const addSection = useMutation({
    mutationFn: async (sectionData: Partial<ProfileSection>) => {
      const maxOrder = sections?.length || 0;
      const { data, error } = await supabase
        .from("profile_sections")
        .insert({
          user_id: userId,
          section_order: maxOrder,
          ...sectionData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-sections", userId] });
      toast.success("Section added");
    },
  });

  // Update section
  const updateSection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProfileSection> & { id: string }) => {
      const { error } = await supabase
        .from("profile_sections")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-sections", userId] });
    },
  });

  // Delete section
  const deleteSection = useMutation({
    mutationFn: async (sectionId: string) => {
      const { error } = await supabase
        .from("profile_sections")
        .delete()
        .eq("id", sectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-sections", userId] });
      toast.success("Section deleted");
    },
  });

  // Add block
  const addBlock = useMutation({
    mutationFn: async (blockData: Partial<ProfileBlock>) => {
      const sectionBlocks = blocks?.filter((b) => b.section_id === blockData.section_id) || [];
      const maxOrder = sectionBlocks.length;
      
      const { data, error } = await supabase
        .from("profile_blocks")
        .insert([{
          block_order: maxOrder,
          section_id: blockData.section_id!,
          block_type: blockData.block_type!,
          block_data: blockData.block_data || {},
          width: blockData.width || 'full',
        }])
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

  // Update theme
  const updateTheme = useMutation({
    mutationFn: async (themeData: Partial<ProfileTheme>) => {
      const { error } = await supabase
        .from("profile_themes")
        .update(themeData)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-theme", userId] });
      toast.success("Theme updated");
    },
  });

  return {
    sections,
    blocks,
    theme,
    isLoading: sectionsLoading || blocksLoading || themeLoading,
    addSection,
    updateSection,
    deleteSection,
    addBlock,
    updateBlock,
    deleteBlock,
    updateTheme,
  };
};
