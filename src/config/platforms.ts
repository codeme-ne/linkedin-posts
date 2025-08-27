export type Platform = "linkedin" | "x" | "instagram";

export const PLATFORM_LABEL: Record<Platform, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  instagram: "Instagram",
};

export const ALL_PLATFORMS: Platform[] = ["linkedin", "x", "instagram"];
