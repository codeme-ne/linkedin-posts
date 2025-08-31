import type { Platform } from "@/config/platforms";
import { PLATFORM_LABEL, ALL_PLATFORMS } from "@/config/platforms";
import { Badge } from "@/components/ui/badge";

type Props = {
  value: Platform[];
  onChange: (p: Platform[]) => void;
};

export function PlatformSelector({ value, onChange }: Props) {
  const toggle = (p: Platform) => {
    const has = value.includes(p);
    onChange(has ? value.filter((v) => v !== p) : [...value, p]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_PLATFORMS.map((p) => {
        const active = value.includes(p);
        const isInstagram = p === "instagram";
        const isLinkedIn = p === "linkedin";
        const isX = p === "x";
        const activeClass = active
          ? isInstagram
            ? "bg-[#e706ab] text-white border-[#e706ab] hover:bg-[#e706ab]/90"
            : isLinkedIn
              ? "bg-[#0a66c2] text-white border-[#0a66c2] hover:bg-[#0a66c2]/90"
              : isX
                ? "bg-black text-white border-black hover:bg-black/90"
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          : "bg-background hover:bg-muted";
        return (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${activeClass}`}
            aria-pressed={active}
          >
            <Badge variant="outline" className="border-transparent text-inherit">
              {PLATFORM_LABEL[p]}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
