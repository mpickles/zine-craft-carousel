export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  sections: Array<{
    section_type: string;
    background_color: string;
    padding_size: string;
    blocks: Array<{
      block_type: string;
      block_data: any;
      width: string;
    }>;
  }>;
}

export const PROFILE_TEMPLATES: TemplateConfig[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple. Just your bio and latest work.",
    sections: [
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "latest-posts",
            block_data: { count: 6, layout: "grid", showCaptions: true },
            width: "full",
          },
        ],
      },
    ],
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Editorial style with featured collection and social links.",
    sections: [
      {
        section_type: "content",
        background_color: "#F5F5F5",
        padding_size: "large",
        blocks: [
          {
            block_type: "featured-collection",
            block_data: { collectionId: "", postCount: 9, showName: true, showDescription: true },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "latest-posts",
            block_data: { count: 6, layout: "grid", showCaptions: true },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#D4846A",
        padding_size: "medium",
        blocks: [
          {
            block_type: "links",
            block_data: { links: [] },
            width: "full",
          },
        ],
      },
    ],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase your work with a bold header image.",
    sections: [
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "latest-posts",
            block_data: { count: 9, layout: "grid", showCaptions: false },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#F9F9F9",
        padding_size: "large",
        blocks: [
          {
            block_type: "text",
            block_data: { content: "<h2>About my work</h2><p>Tell your story here...</p>", alignment: "left" },
            width: "full",
          },
          {
            block_type: "links",
            block_data: { links: [] },
            width: "full",
          },
        ],
      },
    ],
  },
  {
    id: "curator",
    name: "Curator",
    description: "Perfect for collectors. Multiple featured collections.",
    sections: [
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "featured-collection",
            block_data: { collectionId: "", postCount: 6, showName: true, showDescription: true },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "featured-collection",
            block_data: { collectionId: "", postCount: 6, showName: true, showDescription: true },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#F5F5F5",
        padding_size: "medium",
        blocks: [
          {
            block_type: "latest-posts",
            block_data: { count: 6, layout: "grid", showCaptions: true },
            width: "full",
          },
        ],
      },
    ],
  },
  {
    id: "link-hub",
    name: "Link Hub",
    description: "Like Linktree but prettier. Central hub for all your links.",
    sections: [
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "links",
            block_data: { links: [] },
            width: "full",
          },
        ],
      },
      {
        section_type: "content",
        background_color: "#FFFFFF",
        padding_size: "medium",
        blocks: [
          {
            block_type: "latest-posts",
            block_data: { count: 3, layout: "list", showCaptions: true },
            width: "full",
          },
        ],
      },
    ],
  },
];
