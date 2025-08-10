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
  getDaysInMonth,
} from "date-fns";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
const ym = (d) => format(d, "yyyy-MM");
const yyyy = (d) => format(d, "yyyy");
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

function hasAnyInRange(compSet, start, end) {
  const days = eachDayOfInterval({ start, end });
  for (const d of days) if (compSet.has(iso(d))) return true;
  return false;
}
function hasAnyInMonth(compSet, y, m) {
  const start = new Date(y, m, 1);
  const end = endOfMonth(start);
  return hasAnyInRange(compSet, start, end);
}
function hasAnyInYear(compSet, y) {
  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31);
  return hasAnyInRange(compSet, start, end);
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
function MonthGrid({ monthDate = new Date(), completions, onToggleDay, accent = THEME.pink, highlightIso }) {
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
          const isHighlight = highlightIso && iso(d) === highlightIso;
          return (
            <button
              key={d.toISOString()}
              onClick={() => onToggleDay(d)}
              className={classNames(
                "aspect-square rounded-md text-xs flex items-center justify-center",
                inMonth ? "opacity-100" : "opacity-40",
                isHighlight ? "ring-2 ring-offset-0" : ""
              )}
              style={{
                background: isDone ? `${accent}22` : THEME.card,
                border: `1px solid ${isDone ? accent : THEME.cardBorder}`,
                color: isDone ? THEME.text : THEME.sub,
              }}
              title={iso(d)}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- NEW: Weekly view as 4-blocks per month ---
function WeeklyByMonthGrid({ year, completions, onToggleWeekBlock, accent = THEME.pink, highlightYM }) {
  const compSet = new Set(completions);
  const months = Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));

  return (
    <div className="space-y-3">
      {months.map((mDate, idx) => {
        const daysIn = getDaysInMonth(mDate);
        const ranges = [
          { start: new Date(year, idx, 1), end: new Date(year, idx, Math.min(7, daysIn)) },
          { start: new Date(year, idx, 8), end: new Date(year, idx, Math.min(14, daysIn)) },
          { start: new Date(year, idx, 15), end: new Date(year, idx, Math.min(21, daysIn)) },
          { start: new Date(year, idx, 22), end: new Date(year, idx, daysIn) },
        ];
        const monthKey = ym(mDate);
        const monthHighlight = highlightYM && monthKey === highlightYM;

        return (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-20 text-sm" style={{ color: THEME.sub }}>
              {format(mDate, "MMM yyyy")}
            </div>
            <div className={classNames("grid grid-cols-4 gap-1 p-1 rounded-lg", monthHighlight ? "ring-2" : "")}
                 style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}` }}>
              {ranges.map((r, i) => {
                const any = hasAnyInRange(compSet, r.start, r.end);
                return (
                  <button
                    key={i}
                    onClick={() => onToggleWeekBlock(r.start)}
                    className="h-6 w-10 rounded-[5px]"
                    style={{
                      background: any ? accent : THEME.greyChip,
                      border: `1px solid ${THEME.cardBorder}`,
                    }}
                    title={`${ym(r.start)} • W${i + 1}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- NEW: Monthly view as 12 blocks per selected year ---
function MonthlyByYearGrid({ year, completions, onToggleMonth, accent = THEME.pink, highlightYM }) {
  const compSet = new Set(completions);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {Array.from({ length: 12 }).map((_, m) => {
        const any = hasAnyInMonth(compSet, year, m);
        const mDate = new Date(year, m, 1);
        const monthKey = ym(mDate);
        const highlight = highlightYM && monthKey === highlightYM;
        return (
          <button
            key={m}
            onClick={() => onToggleMonth(mDate)}
            className={classNames("h-14 rounded-xl flex items-center justify-center text-sm", highlight ? "ring-2" : "")}
            style={{ background: any ? `${accent}22` : THEME.card, border: `1px solid ${any ? accent : THEME.cardBorder}`, color: THEME.text }}
            title={monthKey}
          >
            {format(mDate, "MMM")}
          </button>
        );
      })}
    </div>
  );
}

// --- NEW: Fixed 2025–2040 yearly grid ---
function FixedYearGrid({ completions, onToggleYear, accent = THEME.pink, highlightYYYY }) {
  const compSet = new Set(completions);
  const years = Array.from({ length: 16 }).map((_, i) => 2025 + i);
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {years.map((y) => {
        const any = hasAnyInYear(compSet, y);
        const highlight = highlightYYYY && String(y) === highlightYYYY;
        return (
          <button
            key={y}
            onClick={() => onToggleYear(new Date(y, 0, 1))}
            className={classNames("h-12 rounded-xl flex items-center justify-center text-sm", highlight ? "ring-2" : "")}
            style={{ background: any ? `${accent}22` : THEME.card, border: `1px solid ${any ? accent : THEME.cardBorder}`, color: THEME.text }}
            title={String(y)}
          >
            {y}
          </button>
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
  const [yearForWeekly, setYearForWeekly] = useState(new Date().getFullYear());
  const [yearForMonthly, setYearForMonthly] = useState(new Date().getFullYear());
  const [findKey, setFindKey] = useState(""); // yyyy or yyyy-mm or yyyy-mm-dd

  const toggleDay = (d) => {
    const key = iso(d);
    const has = habit.completions.includes(key);
    const next = has ? habit.completions.filter((x) => x !== key) : [...habit.completions, key];
    setHabit({ ...habit, completions: next });
  };

  const handleToggleWeekBlock = (startDateOfBlock) => {
    toggleDay(startDateOfBlock); // store representative date for that week block
  };

  const handleToggleMonth = (monthDate) => {
    toggleDay(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  };

  const handleToggleYear = (jan1) => {
    toggleDay(new Date(jan1.getFullYear(), 0, 1));
  };

  // parse highlight hints
  const highlightYYYY = /^\d{4}$/.test(findKey) ? findKey : undefined;
  const highlightYM = /^\d{4}-\d{2}$/.test(findKey) ? findKey : undefined;
  const highlightIso = /^\d{4}-\d{2}-\d{2}$/.test(findKey) ? findKey : undefined;

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full sm:w-[560px] p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ background: THEME.bgTo, borderLeft: `1px solid ${THEME.cardBorder}` }}>
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

        {/* Side-panel "search" behaves differently: quick highlight finder */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
          <input
            value={findKey}
            onChange={(e) => setFindKey(e.target.value.trim())}
            placeholder="Find (yyyy / yyyy-mm / yyyy-mm-dd)"
            className="pl-8 h-9 w-full rounded-xl text-sm outline-none"
            style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          />
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
            <MonthGrid monthDate={month} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color} highlightIso={highlightIso} />
          </div>
        )}

        {tab === "weekly" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setYearForWeekly((y) => y - 1)}
                className="h-8 px-3 rounded-xl text-sm"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-medium" style={{ color: THEME.text }}>
                {yearForWeekly}
              </div>
              <button
                onClick={() => setYearForWeekly((y) => y + 1)}
                className="h-8 px-3 rounded-xl text-sm"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <WeeklyByMonthGrid
              year={yearForWeekly}
              completions={habit.completions}
              onToggleWeekBlock={handleToggleWeekBlock}
              accent={habit.color}
              highlightYM={highlightYM}
            />
          </div>
        )}

        {tab === "monthly" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setYearForMonthly((y) => y - 1)}
                className="h-8 px-3 rounded-xl text-sm"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="font-medium" style={{ color: THEME.text }}>
                {yearForMonthly}
              </div>
              <button
                onClick={() => setYearForMonthly((y) => y + 1)}
                className="h-8 px-3 rounded-xl text-sm"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <MonthlyByYearGrid
              year={yearForMonthly}
              completions={habit.completions}
              onToggleMonth={handleToggleMonth}
              accent={habit.color}
              highlightYM={highlightYM}
            />
          </div>
        )}

        {tab === "yearly" && (
          <div className="mt-4">
            <FixedYearGrid
              completions={habit.completions}
              onToggleYear={handleToggleYear}
              accent={habit.color}
              highlightYYYY={highlightYYYY}
            />
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

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${THEME.bgFrom}, ${THEME.bgTo})` }}>
      <div className="w-full h-full p-4 md:p-6 space-y-6">
        {/* Header (now includes Search) */}
        <div
          className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-4 backdrop-blur"
          style={{ background: "#0b0b0c", borderBottom: `1px solid ${THEME.cardBorder}` }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold" style={{ color: THEME.text }}>
                Your Habits 🩷
              </h1>
              <p className="text-xs md:text-sm" style={{ color: THEME.sub }}>
                Create, color, and track daily / weekly / monthly / yearly habits.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search habits"
                  className="pl-8 h-9 w-full rounded-xl text-sm outline-none"
                  style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
                />
              </div>
            <Link
                to="/dashboard"
                className="h-9 px-3 rounded-xl text-sm shrink-0 flex items-center justify-center"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
                >
                    Dashboard
            </Link>
              <button
                onClick={() => setOpenCreate(true)}
                className="h-9 px-3 rounded-xl text-sm shrink-0"
                style={{ background: THEME.greyChip, color: THEME.text, border: `1px solid ${THEME.cardBorder}`, boxShadow: THEME.glow }}
              >
                + Create Habit
              </button>
            </div>
          </div>
        </div>

        {/* View chips (search removed from here) */}
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
