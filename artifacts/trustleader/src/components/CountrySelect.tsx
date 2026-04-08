import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import countries from "@/data/countries.json";

const STORAGE_KEY = "trustleader.country";

/** Shown first when the search box is empty (fast initial paint). */
const POPULAR_CODES = new Set([
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "IN",
  "NL",
  "ES",
  "IT",
  "BR",
  "MX",
  "JP",
  "SG",
  "AE",
  "IE",
  "NZ",
  "SE",
  "CH",
  "AT",
]);

function defaultCode(): string {
  if (typeof navigator === "undefined") return "US";
  const parts = navigator.language.split("-");
  const region = parts.length > 1 ? parts[1].toUpperCase() : "";
  if (region && countries.some((c) => c.code === region)) return region;
  return "US";
}

export function CountrySelect({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && countries.some((c) => c.code === saved)) {
        setValue(saved);
      } else {
        setValue(defaultCode());
      }
    } catch {
      setValue("US");
    }
  }, []);

  useEffect(() => {
    if (!value) return;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selected = countries.find((c) => c.code === value);

  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const popular = countries
        .filter((c) => POPULAR_CODES.has(c.code))
        .sort((a, b) => a.name.localeCompare(b.name));
      const current = countries.find((c) => c.code === value);
      if (current && !popular.some((p) => p.code === current.code)) {
        return { mode: "popular" as const, items: [current, ...popular] };
      }
      return { mode: "popular" as const, items: popular };
    }
    const items = countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
    return { mode: "search" as const, items };
  }, [query, value]);

  return (
    <div className={cn("space-y-2 relative", className)}>
      <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{label}</p>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full max-w-xs justify-between border-border bg-white text-left text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-cream))] hover:text-[hsl(var(--brand-navy))]"
          >
            <span className="truncate text-sm font-medium">
              {selected ? selected.name : "Select country"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={16}
          className="w-[min(100vw-2rem,320px)] p-0 border border-border bg-white shadow-xl z-[100]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col p-2 gap-2 border-b border-border/80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country..."
                className="pl-9 h-10 bg-[hsl(var(--brand-cream))]/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[hsl(var(--brand-royal))]/40"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            {visibleList.mode === "popular" && !query.trim() ? (
              <p className="text-[11px] text-muted-foreground px-1">
                Popular first — type to search all countries
              </p>
            ) : null}
          </div>
          <ul
            className="max-h-[min(60vh,280px)] overflow-y-auto overscroll-contain py-1"
            role="listbox"
          >
            {visibleList.items.length === 0 ? (
              <li className="px-3 py-6 text-sm text-center text-muted-foreground">No country found.</li>
            ) : (
              visibleList.items.map((c) => {
                const isSel = value === c.code;
                return (
                  <li key={c.code} role="option" aria-selected={isSel}>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                        "text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-turquoise))]/12 focus-visible:outline-none focus-visible:bg-[hsl(var(--brand-turquoise))]/12",
                        isSel && "bg-[hsl(var(--brand-royal))]/10",
                      )}
                      onClick={() => {
                        setValue(c.code);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 text-[hsl(var(--brand-turquoise))]",
                          isSel ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                      <span className="truncate flex-1 min-w-0 font-normal">{c.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{c.code}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
