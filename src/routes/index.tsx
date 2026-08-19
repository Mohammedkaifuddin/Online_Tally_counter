import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  RotateCcw,
  Target,
} from "lucide-react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tasbeeh Counter — Digital Zikr Tracker" },
      {
        name: "description",
        content:
          "A minimal digital tasbeeh counter with independent counts and goals for each zikr, saved on your device.",
      },
      {
        property: "og:title",
        content: "Tasbeeh Counter — Digital Zikr Tracker",
      },
      {
        property: "og:description",
        content:
          "Track SubhanAllah, Alhamdulillah, Allahu Akbar and your own zikr with separate counts and goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Zikr = {
  id: string;
  name: string;
  arabic?: string;
  count: number;
  goal: number;
};

const DEFAULT_ZIKRS: Zikr[] = [
  {
    id: "subhanallah",
    name: "SubhanAllah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    count: 0,
    goal: 33,
  },
  {
    id: "alhamdulillah",
    name: "Alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    count: 0,
    goal: 33,
  },
  {
    id: "allahuakbar",
    name: "Allahu Akbar",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    count: 0,
    goal: 34,
  },
  {
    id: "astaghfirullah",
    name: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
    count: 0,
    goal: 100,
  },
  {
    id: "lailahaillallah",
    name: "La ilaha illallah",
    arabic: "لَا إِلٰهَ إِلَّا ٱللَّٰهُ",
    count: 0,
    goal: 100,
  },
];

const STORAGE_KEY = "tasbeeh.zikrs.v1";
const SELECTED_KEY = "tasbeeh.selected.v1";

function Index() {
  const [zikrs, setZikrs] = useState<Zikr[]>(DEFAULT_ZIKRS);
  const [selectedId, setSelectedId] = useState<string>("subhanallah");
  const [loaded, setLoaded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Zikr[];
        if (Array.isArray(parsed) && parsed.length) setZikrs(parsed);
      }
      const sel = localStorage.getItem(SELECTED_KEY);
      if (sel) setSelectedId(sel);
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(zikrs));
    localStorage.setItem(SELECTED_KEY, selectedId);
  }, [zikrs, selectedId, loaded]);

  const selected: Zikr = useMemo(
    () =>
      zikrs.find((z) => z.id === selectedId) ?? zikrs[0] ?? DEFAULT_ZIKRS[0]!,
    [zikrs, selectedId],
  );

  const update = (patch: Partial<Zikr>) =>
    setZikrs((prev) =>
      prev.map((z) => (z.id === selected.id ? { ...z, ...patch } : z)),
    );

  const increment = () => {
    update({ count: selected.count + 1 });
    setPulse(true);
    window.setTimeout(() => setPulse(false), 180);
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(12);
  };

  const progress =
    selected.goal > 0 ? Math.min(selected.count / selected.goal, 1) : 0;

  const addZikr = () => {
    const name = newName.trim();
    if (!name) return;
    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const arabic = newArabic.trim();
    const zikr: Zikr = {
      id,
      name,
      count: 0,
      goal: 33,
      ...(arabic ? { arabic } : {}),
    };
    setZikrs((prev) => [...prev, zikr]);
    setSelectedId(id);
    setNewName("");
    setNewArabic("");
    setAddOpen(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-10 text-foreground select-none">
      <header className="flex w-full max-w-md flex-col items-center gap-3">
        <p className="text-[11px] tracking-[0.35em] text-muted-foreground uppercase">
          Tasbeeh
        </p>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2 text-lg font-medium text-primary transition-colors hover:bg-accent active:bg-accent"
              aria-label="Select zikr"
            >
              {selected.name}
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-64 p-1">
            {zikrs.map((z) => (
              <button
                key={z.id}
                onClick={() => {
                  setSelectedId(z.id);
                  setPickerOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className="flex flex-col">
                  <span>{z.name}</span>
                  {z.arabic ? (
                    <span className="text-xs text-muted-foreground" dir="rtl">
                      {z.arabic}
                    </span>
                  ) : null}
                </span>
                {z.id === selected.id ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : null}
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => {
                setPickerOpen(false);
                setAddOpen(true);
              }}
              className="w-full rounded-md px-3 py-2.5 text-left text-sm text-primary transition-colors hover:bg-accent"
            >
              + Add Zikr
            </button>
          </PopoverContent>
        </Popover>

        {selected.arabic ? (
          <p className="text-2xl text-muted-foreground" dir="rtl">
            {selected.arabic}
          </p>
        ) : null}
      </header>

      <section className="flex flex-col items-center gap-8">
        <div
          className={`text-[6rem] leading-none font-light tabular-nums text-primary transition-transform duration-150 sm:text-[8rem] ${
            pulse ? "scale-105" : "scale-100"
          }`}
        >
          {selected.count}
        </div>

        <button
          onClick={increment}
          aria-label="Increase count"
          className="flex h-40 w-40 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-all duration-150 active:scale-95 active:bg-primary/20 sm:h-48 sm:w-48"
        >
          <Plus className="h-16 w-16" strokeWidth={1.25} />
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            aria-label="Decrease count"
            onClick={() => update({ count: Math.max(0, selected.count - 1) })}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            aria-label="Reset count"
            onClick={() => update({ count: 0 })}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full px-5"
            onClick={() => {
              setGoalValue(String(selected.goal));
              setGoalOpen(true);
            }}
          >
            <Target className="mr-2 h-4 w-4" />
            Set Goal
          </Button>
        </div>
      </section>

      <footer className="w-full max-w-xs">
        <div className="h-px w-full overflow-hidden bg-border">
          <div
            className="h-px bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground tabular-nums">
          Goal · {selected.count} / {selected.goal}
        </p>
      </footer>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Zikr</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zikr-name">Zikr name</Label>
              <Input
                id="zikr-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="SubhanAllah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zikr-arabic">Arabic text (optional)</Label>
              <Input
                id="zikr-arabic"
                dir="rtl"
                value={newArabic}
                onChange={(e) => setNewArabic(e.target.value)}
                placeholder="سُبْحَانَ ٱللَّٰهِ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addZikr} disabled={!newName.trim()}>
              Add Zikr
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Goal for {selected.name}</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const n = parseInt(goalValue, 10);
                if (!Number.isNaN(n) && n > 0) update({ goal: n });
                setGoalOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
