import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Target,
  X,
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
  {
    id: "Subhanallahi wa bihamdihi, subhanallahil azim",
    name: "Subhanallahi wa bihamdihi, Subhanallahil azim",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ العَظِيمِ",
    count: 0,
    goal: 100,
  },
];

type IslamicDate = {
  title: string;
  hijri: string;
  gregorian: string;
  description: string;
};

const ISLAMIC_DATES_2026: IslamicDate[] = [
  {
    title: "Mawlid",
    hijri: "12 Rabi al-Awwal 1448 AH",
    gregorian: "25 August 2026 Tue",
    description:
      "Commonly observed as the birthday of the Prophet Muhammad (PBUH).",
  },
  {
    title: "Isra Miraj",
    hijri: "27 Rajab 1448 AH",
    gregorian: "5 January 2027 Tue",
    description: "The Night Journey and Ascension.",
  },
  {
    title: "Nisf Sha'ban",
    hijri: "15 sha'ban 1448 AH",
    gregorian: "23 January 2027 Sat",
    description: "The middle night of Sha'ban.",
  },
  {
    title: "Ramadan Begins",
    hijri: "1 Ramadan 1448 AH",
    gregorian: "8 February 2027 Mon",
    description: "The first of Ramadan.",
  },
  {
    title: "Laylat al-Qadr",
    hijri: "27 Ramadan 1448 AH",
    gregorian: "6 March 2027 Sat",
    description:
      "A commonly observed date for the Night of Decree in the last ten nights of Ramadan.",
  },
  {
    title: "Eid al-Fitr",
    hijri: "1 Shawwal 1448 AH",
    gregorian: "9 March 2027 Tue",
    description: "The festival marking the end of Ramadan.",
  },
  {
    title: "Start of Dhul-Hijjah",
    hijri: "1 Dhul Hijjah 1448 AH",
    gregorian: "7 May 2027 Fri",
    description:
      "The sacred month that includes Hajj, Arafah, Eid al-Adha, and the Days of Tashriq begins.",
  },
  {
    title: "Hajj begins",
    hijri: "8 Dhul-Hijjah 1448 AH",
    gregorian: "14 March 2027 Fri",
    description: "The major pilgrimage days begin in Makkah.",
  },
  {
    title: "Day of Arafah",
    hijri: "9 Dhul-Hijjah 1448 AH",
    gregorian: "15 May 2027 Sat",
    description:
      "The central day of Hajj, observed by many Muslims with fasting outside Hajj.",
  },
  {
    title: "Eid al-Adha",
    hijri: "10 Dhul-Hijjah 1448 AH",
    gregorian: "16 May 2027 Sun",
    description:
      "The Festival of Sacrifice, beginning on the tenth day of Dhul-Hijjah.",
  },
  {
    title: "Days of Tashriq",
    hijri: "11-13 Dhul-Hijjah 1448 AH",
    gregorian: "17 - 19 May 2027 Mon - Wed",
    description: "The three days following Eid al-Adha.",
  },
  {
    title: "Islamic New Year",
    hijri: "1 Muharram 1449 AH",
    gregorian: "16 June 2027Sun",
    description: "The first day of Muharram and the start of a new Hijri year.",
  },
  {
    title: "Tasu'a",
    hijri: "9 Muharram 1449 AH",
    gregorian: "14 June 2027 Mon",
    description:
      "The ninth day of Muharram, often paired with fasting on Ashura.",
  },
  {
    title: "Ashura",
    hijri: "10 Muharram 1449 AH",
    gregorian: "15 June 2027 Tue",
    description: "The tenth day of Muharram.",
  },
  {
    title: "Mawlid",
    hijri: "12 Rabi' al-Awwal 1449 AH",
    gregorian: "14 August 2027 Sat",
    description:
      "Commonly observed as the birth date of the Prophet Muhammad(PBUH).",
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarSearch, setCalendarSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [pulse, setPulse] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

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
  useEffect(() => {
    const savedTheme = localStorage.getItem("tasbeeh.theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    setTheme(prefersDark ? "dark" : "light");

    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("tasbeeh.theme", nextTheme);

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const filteredIslamicDates = ISLAMIC_DATES_2026.filter((date) => {
    const query = calendarSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      date.title.toLowerCase().includes(query) ||
      date.hijri.toLowerCase().includes(query) ||
      date.gregorian.toLowerCase().includes(query) ||
      date.description.toLowerCase().includes(query)
    );
  });

  if (calendarOpen) {
    return (
      <main className="min-h-screen bg-background px-5 py-6 text-foreground transition-colors duration-300">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <header className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setCalendarOpen(false)}
              aria-label="Back to counter"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent"
            >
              ←
            </button>

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                Calendar
              </p>

              <h1 className="text-2xl font-medium">Islamic Dates</h1>
            </div>
          </header>

          <div className="mb-5 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={calendarSearch}
              onChange={(e) => setCalendarSearch(e.target.value)}
              placeholder="Search Islamic dates..."
              className="h-12 rounded-2xl pl-11 pr-11"
            />

            {calendarSearch && (
              <button
                type="button"
                onClick={() => setCalendarSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Intro */}
          <div className="mb-6 rounded-2xl border border-border bg-accent/30 p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Important Islamic dates and observances for 2026.
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Gregorian dates are approximate and may vary according to local
              moon sighting.
            </p>
          </div>

          {/* Dates */}
          <section className="space-y-3">
            {filteredIslamicDates.map((date) => (
              <article
                key={`${date.title}-${date.hijri}`}
                className="rounded-2xl border border-border bg-background p-5 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg">☾</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">{date.title}</h2>

                    <p className="mt-1 text-sm text-primary">{date.hijri}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {date.gregorian}
                    </p>

                    <p className="mt-3 text-sm leading-5 text-muted-foreground">
                      {date.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Footer */}
          <footer className="py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Islamic dates may vary by local moon sighting.
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Made by{" "}
              <span className="font-medium text-foreground">
                Servant of Allah
              </span>
            </p>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-10 text-foreground select-none transition-colors duration-300">
      <header className="relative flex w-full max-w-md flex-col items-center gap-3">
        <button
          onClick={() => setCalendarOpen(true)}
          aria-label="Open Islamic calendar"
          className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-200 hover:bg-accent active:scale-95"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300 hover:bg-accent active:scale-95"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
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

      <footer className="w-full max-w-md pb-2 pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Made with <span className="text-primary">faith</span> by{" "}
          <span className="font-medium text-foreground">Servant of Allah</span>
        </p>
      </footer>
    </main>
  );
}
