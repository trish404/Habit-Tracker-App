// src/pages/Habits.jsx
import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  addWeeks,
  addYears,
  subMonths,
} from "date-fns";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

// --- Theme (mirrors Dashboard) ---
const THEME = {
  bgFrom: "#0b0b0c",
  bgTo: "#0b0b0c",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  text: "#F5F5F6",
  sub: "#B8B8BC",
  pink: "#f472b6",
  pinkDark: "#e11d48",
  greyChip: "rgba(233,233,234,0.08)",
  glow: "0 0 10px rgba(244,114,182,0.3)",
};

const iso = (d) => format(d, "yyyy-MM-dd");
const todayIso = iso(new Date());

const seedHabits = [
  { id: "1", name: "Morning Run", emoji: "🏃‍♀️", color: "#ff8fab", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
  { id: "2", name: "Read a Book", emoji: "📚", color: "#ffd166", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
  { id: "3", name: "Meal Prep", emoji: "🍱", color: "#bde0fe", frequency: "weekly", createdAt: new Date().toISOString(), completions: [] },
  { id: "4", name: "Budget Review", emoji: "💸", color: "#caffbf", frequency: "monthly", createdAt: new Date().toISOString(), completions: [] },
  { id: "5", name: "Health Check", emoji: "🩺", color: "#ffc6ff", frequency: "yearly", createdAt: new Date().toISOString(), completions: [] },
];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ---------- Cards ----------
function HabitCard({ habit, onToggle, onOpenDetail }) {
  const streak = useMemo(() => calcStreak(habit.completions), [habit.completions]);
  return (
    <div
      onClick={() => onOpenDetail(habit)}
      className="rounded-2xl p-4 cursor-pointer hover:brightness-110 transition"
      style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden style={{ color: habit.color }}>
            {habit.emoji}
          </span>
          <span className="font-medium" style={{ color: THEME.text }}>
            {habit.name}
          </span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full capitalize"
          style={{ background: THEME.greyChip, color: THEME.sub, border: `1px solid ${THEME.cardBorder}` }}
        >
          {habit.frequency}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm" style={{ color: THEME.sub }}>
          Streak:{" "}
          <span style={{ color: THEME.text }} className="font-medium">
            {streak}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(habit);
          }}
          className="h-8 px-3 rounded-xl text-sm"
          style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
        >
          Mark done
        </button>
      </div>
    </div>
  );
}

function calcStreak(completions) {
  if (!completions?.length) return 0;
  const set = new Set(completions);
  let d = new Date();
  let c = 0;
  while (set.has(iso(d))) {
    c++;
    d = new Date(d.setDate(d.getDate() - 1));
  }
  return c;
}

// ---------- Calendars ----------
function MonthGrid({ monthDate = new Date(), completions, onToggleDay, accent = THEME.pink }) {
  const start = startOfWeek(startOfMonth(monthDate));
  const end = endOfWeek(endOfMonth(monthDate));
  const days = eachDayOfInterval({ start, end });
  const compSet = new Set(completions);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-xs mb-1" style={{ color: THEME.sub }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = d.getMonth() === monthDate.getMonth();
          const isDone = compSet.has(iso(d));
          return (
            <button
              key={d.toISOString()}
              onClick={() => onToggleDay(d)}
              className={classNames("aspect-square rounded-md text-xs flex items-center justify-center", inMonth ? "opacity-100" : "opacity-40")}
              style={{
                background: isDone ? `${accent}22` : THEME.card,
                border: `1px solid ${isDone ? accent : THEME.cardBorder}`,
                color: isDone ? THEME.text : THEME.sub,
              }}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyHeatmap({ weeks = 12, completions, onToggleDay, accent = THEME.pink }) {
  const today = new Date();
  const start = endOfWeek(addWeeks(today, -weeks + 1));
  const compSet = new Set(completions);

  return (
    <div className="flex gap-1 overflow-x-auto p-2 rounded-2xl" style={{ border: `1px solid ${THEME.cardBorder}`, background: THEME.card, boxShadow: THEME.glow }}>
      {Array.from({ length: weeks }).map((_, i) => {
        const wStart = addWeeks(start, i);
        const wDays = eachDayOfInterval({ start: wStart, end: endOfWeek(wStart) });
        return (
          <div key={i} className="grid grid-rows-7 gap-1">
            {wDays.map((d) => {
              const isDone = compSet.has(iso(d));
              return <button key={d.toISOString()} onClick={() => onToggleDay(d)} className="h-3 w-3 rounded-[3px]" style={{ background: isDone ? accent : THEME.greyChip, border: `1px solid ${THEME.cardBorder}` }} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function YearStrip({ years = 5, completions, onToggleDay, accent = THEME.pink }) {
  const today = new Date();
  const start = addYears(today, -(years - 1));
  const compSet = new Set(completions);

  return (
    <div className="space-y-3">
      {Array.from({ length: years }).map((_, i) => {
        const year = addYears(start, i);
        const months = Array.from({ length: 12 }).map((_, m) => new Date(year.getFullYear(), m, 1));
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 text-sm" style={{ color: THEME.sub }}>
              {format(year, "yyyy")}
            </div>
            <div className="flex gap-1">
              {months.map((mDate, idx) => {
                const monthKey = format(mDate, "yyyy-MM");
                const any = Array.from(compSet).some((d) => d.startsWith(monthKey));
                return <div key={idx} className="h-6 w-6 rounded-[4px]" style={{ background: any ? accent : THEME.greyChip, border: `1px solid ${THEME.cardBorder}` }} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Modal ----------
function CreateHabitModal({ open, setOpen, onCreate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState("#ff8fab");
  const [frequency, setFrequency] = useState("daily");

  const close = () => setOpen(false);
  const submit = () => {
    if (!name.trim()) return;
    const id = crypto?.randomUUID ? crypto.randomUUID() : `h-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    onCreate({ id, name, emoji, color, frequency, createdAt: new Date().toISOString(), completions: [] });
    close();
    setName("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={close} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl p-4 shadow-2xl"
        style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-lg" style={{ color: THEME.text }}>
            Create habit
          </div>
          <button
            onClick={close}
            className="h-8 px-3 rounded-xl text-sm"
            style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm" style={{ color: THEME.sub }}>
              Habit name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink water"
              className="h-9 w-full rounded-xl px-3 text-sm outline-none"
              style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: THEME.sub }}>
              Emoji
            </label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="😊"
              className="h-9 w-full rounded-xl px-3 text-sm outline-none"
              style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: THEME.sub }}>
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 p-1 rounded-md"
                style={{ background: THEME.greyChip, border: `1px solid ${THEME.cardBorder}` }}
              />
              <span className="text-xs" style={{ color: THEME.sub }}>
                Pick a custom color
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm" style={{ color: THEME.sub }}>
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="h-9 w-full rounded-xl px-3 text-sm outline-none"
              style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={close}
            className="h-9 px-3 rounded-xl text-sm"
            style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          >
            Cancel
          </button>
          <button className="h-9 px-3 rounded-xl text-sm" style={{ background: THEME.pink, color: "#0b0b0c" }} onClick={submit}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Detail Panel ----------
function HabitDetail({ habit, setHabit, onClose }) {
  const [month, setMonth] = useState(new Date());
  const [tab, setTab] = useState(habit.frequency);

  const toggleDay = (d) => {
    const key = iso(d);
    const has = habit.completions.includes(key);
    const next = has ? habit.completions.filter((x) => x !== key) : [...habit.completions, key];
    setHabit({ ...habit, completions: next });
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ background: THEME.bgTo, borderLeft: `1px solid ${THEME.cardBorder}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: habit.color }}>
              {habit.emoji}
            </span>
            <div>
              <div className="font-semibold text-lg" style={{ color: THEME.text }}>
                {habit.name}
              </div>
              <div className="text-xs capitalize" style={{ color: THEME.sub }}>
                {habit.frequency}
              </div>
            </div>
          </div>
          <button className="h-8 px-3 rounded-xl text-sm" onClick={onClose} style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-4 rounded-xl p-1 text-sm" style={{ border: `1px solid ${THEME.cardBorder}`, background: THEME.card }}>
          {[
            { k: "daily", label: "Daily" },
            { k: "weekly", label: "Weekly" },
            { k: "monthly", label: "Monthly" },
            { k: "yearly", label: "Yearly" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className="h-8 rounded-lg"
              style={tab === t.k ? { background: THEME.pink, color: "#0b0b0c" } : { background: THEME.greyChip, color: THEME.text }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "daily" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <button className="h-8 w-8 rounded-xl inline-flex items-center justify-center" style={{ background: THEME.greyChip, border: `1px solid ${THEME.cardBorder}` }} onClick={() => setMonth(subMonths(month, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-medium" style={{ color: THEME.text }}>
                {format(month, "MMMM yyyy")}
              </div>
              <button className="h-8 w-8 rounded-xl inline-flex items-center justify-center" style={{ background: THEME.greyChip, border: `1px solid ${THEME.cardBorder}` }} onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <MonthGrid monthDate={month} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color} />
          </div>
        )}

        {tab === "weekly" && (
          <div className="mt-4">
            <WeeklyHeatmap weeks={20} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color} />
          </div>
        )}

        {tab === "monthly" && (
          <div className="mt-4">
            <MonthGrid monthDate={new Date()} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color} />
            <div className="text-xs mt-2" style={{ color: THEME.sub }}>
              Click a day to toggle completion.
            </div>
          </div>
        )}

        {tab === "yearly" && (
          <div className="mt-4">
            <YearStrip years={5} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color} />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function HabitsPage() {
  const [habits, setHabits] = useState(seedHabits);
  const [query, setQuery] = useState("");
  const [activeFreq, setActiveFreq] = useState("daily");
  const [openCreate, setOpenCreate] = useState(false);
  const [detailHabit, setDetailHabit] = useState(null);

  const filtered = useMemo(
    () => habits.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()) && (activeFreq ? h.frequency === activeFreq : true)),
    [habits, query, activeFreq]
  );

  const onCreate = (h) => setHabits([h, ...habits]);

  const onToggle = (h) => {
    const has = h.completions.includes(todayIso);
    const next = has ? h.completions.filter((x) => x !== todayIso) : [...h.completions, todayIso];
    setHabits((prev) => prev.map((x) => (x.id === h.id ? { ...x, completions: next } : x)));
  };

  const openDetail = (h) => setDetailHabit(h);
  const closeDetail = () => setDetailHabit(null);
  const updateDetailHabit = (updated) => {
    setHabits((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setDetailHabit(updated);
  };

  // ---- full-bleed shell to match Dashboard ----
  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${THEME.bgFrom}, ${THEME.bgTo})` }}>
      <div className="w-full h-full p-4 md:p-6 space-y-6">
        {/* Header */}
        <div
          className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 backdrop-blur"
          style={{ background: "#0b0b0c", borderBottom: `1px solid ${THEME.cardBorder}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: THEME.text }}>
                Your Habits
              </h1>
              <p className="text-xs md:text-sm" style={{ color: THEME.sub }}>
                Create, color, and track daily / weekly / monthly / yearly habits.
              </p>
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="h-9 px-3 rounded-xl text-sm"
              style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
            >
              + Create Habit
            </button>
          </div>
        </div>

        {/* View chips + search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="inline-flex rounded-xl overflow-hidden" style={{ border: `1px solid ${THEME.cardBorder}` }}>
            {[
              { k: "daily", label: "Daily" },
              { k: "weekly", label: "Weekly" },
              { k: "monthly", label: "Monthly" },
              { k: "yearly", label: "Yearly" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveFreq(t.k)}
                className="px-3 py-1.5 text-sm"
                style={activeFreq === t.k ? { background: THEME.pink, color: "#0b0b0c" } : { background: THEME.greyChip, color: THEME.text }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search habits"
              className="pl-8 h-9 w-full rounded-xl text-sm outline-none"
              style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((h) => (
            <HabitCard key={h.id} habit={h} onToggle={onToggle} onOpenDetail={openDetail} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-sm text-center rounded-2xl p-6" style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, color: THEME.sub }}>
            No habits yet. Click <span className="font-medium" style={{ color: THEME.text }}>Create habit</span> to get started.
          </div>
        )}

        {/* Modals/Panels */}
        <CreateHabitModal open={openCreate} setOpen={setOpenCreate} onCreate={onCreate} />
        {detailHabit && <HabitDetail habit={detailHabit} setHabit={updateDetailHabit} onClose={closeDetail} />}
      </div>
    </div>
  );
}
