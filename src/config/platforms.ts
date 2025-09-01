export type Platform = "linkedin" | "x" | "instagram" | "newsletter";

export const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  instagram: "Instagram",
  newsletter: "Newsletter",
};

export const ALL_PLATFORMS: Platform[] = ["linkedin", "x", "instagram", "newsletter"];
