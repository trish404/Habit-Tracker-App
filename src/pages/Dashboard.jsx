import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { create } from "zustand";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

/*
  BloomTrack Dashboard — single-file scaffold
  - Tailwind-first layout
  - Zustand store with memoized selectors
  - Dummy data + helpers
  - KPI row, Today grid, Adherence sparkline, Spend bars, Right-rail cards
  You can split into files later. Keep this as /src/pages/Dashboard.jsx and route to it.
*/

/***********************\
|*  LIGHT DATA LAYER   *|
\***********************/

function todayISO(d = new Date()) {
  const z = new Date(d.getTime());
  z.setHours(0, 0, 0, 0);
  return z.toISOString().slice(0, 10);
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

const COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

// Dummy seeds
const seedHabits = [
  { id: "h1", name: "Run", type: "daily", color: COLORS[0] },
  { id: "h2", name: "Read", type: "daily", color: COLORS[1] },
  { id: "h3", name: "Meditate", type: "daily", color: COLORS[2] },
  { id: "h4", name: "Deep Work", type: "weekly", color: COLORS[3] },
  { id: "h5", name: "Clean Room", type: "weekly", color: COLORS[4] },
  { id: "h6", name: "Drink Water", type: "daily", color: COLORS[5] },
];

function genRangeLogs(days = 90) {
  const logs = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const dateISO = todayISO(d);
    seedHabits.forEach((h, idx) => {
      const due = h.type === "daily" || (h.type === "weekly" && d.getDay() === (idx % 3) * 2);
      if (!due) return;
      const done = Math.random() > 0.2; // ~80% success
      const completedAt = done ? new Date(d.getTime() + (6 + Math.random() * 12) * 60 * 60 * 1000).toISOString() : undefined;
      logs.push({ id: `${h.id}-${dateISO}`, habitId: h.id, dateISO, done, completedAt });
    });
  }
  return logs;
}

function genSpends(days = 60) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    if (Math.random() < 0.35) {
      const cnt = 1 + (Math.random() < 0.2 ? 1 : 0);
      for (let k = 0; k < cnt; k++) {
        out.push({ id: `s-${i}-${k}`,
          dateISO: todayISO(d),
          amount: Math.round(120 + Math.random() * 600),
          category: "eat_out",
          place: ["Cafe A", "Diner B", "Tacos C", "K-BBQ", "Noodles"][Math.floor(Math.random() * 5)],
        });
      }
    }
  }
  return out;
}

function genBooks() {
  return [
    { id: "b1", title: "The Creative Habit", author: "Twyla Tharp", totalPages: 280, coverUrl: "" },
  ];
}

function genBookLogs(days = 45) {
  const logs = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    if (Math.random() < 0.6) {
      logs.push({ id: `bl-${i}`, bookId: "b1", dateISO: todayISO(d), pagesRead: Math.floor(4 + Math.random() * 16) });
    }
  }
  return logs;
}

const useStore = create((set, get) => ({
  rangeDays: 30,
  habits: seedHabits,
  habitLogs: genRangeLogs(120),
  spends: genSpends(90),
  books: genBooks(),
  bookLogs: genBookLogs(60),
  settings: { monthlyBudgetEatOut: 6000 },
  setRangeDays: (n) => set({ rangeDays: n }),
  toggleDoneToday: (habitId) => {
    const dateISO = todayISO();
    const logs = get().habitLogs.slice();
    const idx = logs.findIndex((l) => l.habitId === habitId && l.dateISO === dateISO);
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], done: !logs[idx].done, completedAt: !logs[idx].done ? new Date().toISOString() : undefined };
    } else {
      logs.push({ id: `${habitId}-${dateISO}`, habitId, dateISO, done: true, completedAt: new Date().toISOString() });
    }
    set({ habitLogs: logs });
  },
}));

/***********************\
|*   SELECTOR HELPERS  *|
\***********************/

function useDateBuckets(daysBack) {
  const range = useMemo(() => {
    const arr = [];
    const t = new Date();
    for (let i = daysBack - 1; i >= 0; i--) arr.push(todayISO(addDays(t, -i)));
    return arr;
  }, [daysBack]);
  return range;
}

function useTodayStats() {
  const { habits, habitLogs } = useStore();
  const today = todayISO();
  let due = 0, completed = 0;
  habits.forEach((h, idx) => {
    const d = new Date();
    const isDue = h.type === "daily" || (h.type === "weekly" && d.getDay() === (idx % 3) * 2);
    if (isDue) {
      due += 1;
      const log = habitLogs.find((l) => l.habitId === h.id && l.dateISO === today);
      if (log?.done) completed += 1;
    }
  });
  return { completedDueToday: completed, totalDueToday: due, pct: due ? Math.round((completed / due) * 100) : 0 };
}

function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function useSpendMTD() {
  const spends = useStore((s) => s.spends);
  const budget = useStore((s) => s.settings.monthlyBudgetEatOut);
  const now = new Date();
  const monthISO = now.toISOString().slice(0, 7);
  const mtd = spends.filter((s) => s.dateISO.startsWith(monthISO)).reduce((a, b) => a + b.amount, 0);
  const outings = spends.filter((s) => s.dateISO.startsWith(monthISO)).length;
  const avg = outings ? Math.round(mtd / outings) : 0;
  const paceWarn = mtd / (now.getDate() || 1) > (budget || 1) / daysInMonth(now);
  return { mtd, outings, avg, budget, paceWarn };
}

function useAdherence(days = 30) {
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.habitLogs);
  const range = useDateBuckets(days);
  const perDay = range.map((dateISO) => {
    let due = 0, done = 0;
    habits.forEach((h, idx) => {
      const d = new Date(dateISO);
      const isDue = h.type === "daily" || (h.type === "weekly" && d.getDay() === (idx % 3) * 2);
      if (isDue) {
        due += 1;
        const log = logs.find((l) => l.habitId === h.id && l.dateISO === dateISO);
        if (log?.done) done += 1;
      }
    });
    return { dateISO, due, done, pct: due ? Math.round((done / due) * 100) : 0 };
  });
  const adherence = perDay.reduce((a, b) => a + b.pct, 0) / (perDay.length || 1);
  return { perDay, adherence: Math.round(adherence) };
}

function useBookProgress() {
  const books = useStore((s) => s.books);
  const bookLogs = useStore((s) => s.bookLogs);
  const b = books[0];
  if (!b) return { progressPct: 0, pagesReadTotal: 0, pace7: 0, etaDays: 0, book: null };
  const pagesReadTotal = bookLogs.filter((l) => l.bookId === b.id).reduce((a, b) => a + b.pagesRead, 0);
  const progressPct = Math.min(100, Math.round((pagesReadTotal / b.totalPages) * 100));
  // last 7d pace
  const last7iso = todayISO(addDays(new Date(), -6));
  const last7 = bookLogs.filter((l) => l.bookId === b.id && l.dateISO >= last7iso).reduce((a, b) => a + b.pagesRead, 0);
  const pace7 = Math.round(last7 / 7);
  const remaining = Math.max(0, b.totalPages - pagesReadTotal);
  const etaDays = Math.ceil(remaining / Math.max(1, pace7));
  return { book: b, pagesReadTotal, progressPct, pace7, etaDays };
}

function useSpendSeries(days = 30) {
  const spends = useStore((s) => s.spends);
  const range = useDateBuckets(days);
  const map = new Map();
  range.forEach((d) => map.set(d, 0));
  spends.forEach((s) => { if (map.has(s.dateISO)) map.set(s.dateISO, map.get(s.dateISO) + s.amount); });
  return range.map((d) => ({ dateISO: d.slice(5), amount: map.get(d) }));
}

/***********************\
|*   UI PRIMITIVES     *|
\***********************/

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur border border-zinc-200/60 dark:border-zinc-800/60 p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function KPI({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

/***********************\
|*   WIDGETS           *|
\***********************/

function HeaderBar() {
  const rangeDays = useStore((s) => s.rangeDays);
  const setRangeDays = useStore((s) => s.setRangeDays);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold">Blush & Bloom</div>
        <div className="hidden sm:block text-sm text-zinc-500">Dashboard</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {[7, 30, 60, 90].map((n) => (
            <button
              key={n}
              onClick={() => setRangeDays(n)}
              className={`px-3 py-1.5 text-sm ${rangeDays === n ? "bg-zinc-900 text-white" : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"}`}
            >
              {n}d
            </button>
          ))}
        </div>
        <button className="px-3 py-1.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800">+ Habit</button>
        <button className="px-3 py-1.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800">+ Eat-out</button>
        <button className="px-3 py-1.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800">+ Pages</button>
      </div>
    </div>
  );
}

function KPIRow() {
  const { pct, completedDueToday, totalDueToday } = useTodayStats();
  const { mtd, budget, avg } = useSpendMTD();
  const { progressPct } = useBookProgress();
  const { adherence } = useAdherence(30);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Today completion" value={`${pct}%`} sub={`${completedDueToday}/${totalDueToday} due`} />
      <KPI label="30d adherence" value={`${adherence}%`} sub="avg completeness" />
      <KPI label="MTD eat-out" value={`₹${mtd.toLocaleString()}`} sub={budget ? `of ₹${budget}` : "no budget set"} />
      <KPI label="Reading progress" value={`${progressPct}%`} sub={`avg ₹/out: ${avg}`} />
    </div>
  );
}

function TodayGrid() {
  const habits = useStore((s) => s.habits);
  const logs = useStore((s) => s.habitLogs);
  const toggle = useStore((s) => s.toggleDoneToday);
  const today = todayISO();

  return (
    <Card title="Today" className="col-span-2">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {habits.map((h, idx) => {
          const d = new Date();
          const isDue = h.type === "daily" || (h.type === "weekly" && d.getDay() === (idx % 3) * 2);
          const log = logs.find((l) => l.habitId === h.id && l.dateISO === today);
          const done = !!log?.done;
          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              className={`text-left rounded-2xl border p-4 transition active:scale-[.98] ${done ? "border-transparent bg-gradient-to-r from-zinc-900 to-zinc-800 text-white" : "border-zinc-200 dark:border-zinc-800"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{h.name}</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: h.color + "22", color: h.color }}>
                  {h.type.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 text-xs opacity-70">{isDue ? "Due today" : "Not due today"}</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function AdherenceSparkline() {
  const rangeDays = useStore((s) => s.rangeDays);
  const { perDay } = useAdherence(rangeDays);
  const data = perDay.map((d) => ({ x: d.dateISO.slice(5), y: d.pct }));
  return (
    <Card title={`Adherence (last ${rangeDays}d)`}>
      <div className="h-40 lg:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="x" hide />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={30} />
            <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `Day ${l}`} />
            <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function SpendBars() {
  const rangeDays = useStore((s) => s.rangeDays);
  const series = useSpendSeries(rangeDays);
  return (
    <Card title={`Eat-out spend (last ${rangeDays}d)`}>
      <div className="h-44 lg:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="dateISO" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" name="₹" fill="#10b981" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StreaksCard() {
  // Simple example: days since last relapse (randomized placeholder)
  const [lastBreak] = useState(() => addDays(new Date(), -Math.floor(3 + Math.random() * 40)));
  const current = Math.floor((new Date().getTime() - lastBreak.getTime()) / (1000 * 3600 * 24));
  const longest = Math.max(current + Math.floor(Math.random() * 10), current);
  const daysToBeat = Math.max(0, longest - current + 1);
  return (
    <Card title="Streaks (no smoking/drinking)">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-2xl font-semibold">{current}</div>
          <div className="text-xs text-zinc-500">Current</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{longest}</div>
          <div className="text-xs text-zinc-500">Longest</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{daysToBeat}</div>
          <div className="text-xs text-zinc-500">Days to beat</div>
        </div>
      </div>
    </Card>
  );
}

function EatOutCard() {
  const { mtd, outings, avg, budget, paceWarn } = useSpendMTD();
  return (
    <Card title="Eat-out (MTD)">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">₹{mtd.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{outings} outings • avg ₹{avg}</div>
        </div>
        {budget && (
          <div className={`px-3 py-1.5 rounded-xl text-xs ${paceWarn ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            {paceWarn ? "Over pace" : "On pace"}
          </div>
        )}
      </div>
    </Card>
  );
}

function BookCard() {
  const { book, progressPct, pace7, etaDays } = useBookProgress();
  if (!book) return null;
  return (
    <Card title="Reading">
      <div className="flex items-center gap-3">
        <div className="w-12 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1">
          <div className="font-medium">{book.title}</div>
          <div className="text-xs text-zinc-500 mb-1">{book.author}</div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{progressPct}% • pace {pace7} ppd • ETA {etaDays}d</div>
        </div>
      </div>
    </Card>
  );
}

function InsightsCard() {
  const { adherence } = useAdherence(7);
  const tips = [];
  if (adherence >= 80) tips.push("On track this week. Keep momentum!");
  if (adherence < 60) tips.push("Try batching habits earlier in the day.");
  tips.push("Eat-out spend trend available below.");
  return (
    <Card title="Insights">
      <ul className="text-sm space-y-1">
        {tips.map((t, i) => (
          <li key={i} className="list-disc ml-4 text-zinc-700 dark:text-zinc-300">{t}</li>
        ))}
      </ul>
    </Card>
  );
}

/***********************\
|*   PAGE COMPOSITION  *|
\***********************/

export default function Dashboard() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full h-full p-4 md:p-6 space-y-4 max-w-none">
      <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2
                        bg-gradient-to-b from-zinc-50/80 to-transparent
                        dark:from-zinc-950/60 backdrop-blur">
        <HeaderBar />
        </div>
        <KPIRow />

        <div className="grid grid-cols-12 gap-4 pr-4 xl:pr-6">
          {/* Main grid */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
            <TodayGrid />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdherenceSparkline />
              <SpendBars />
            </div>
          </div>
          {/* Right rail */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4">
            <StreaksCard />
            <EatOutCard />
            <BookCard />
            <InsightsCard />
          </div>
        </div>

        <footer className="pt-8 text-center text-xs text-zinc-500">
          Built with ❤ — scaffold. Hook up real data and tweak palettes/typography to match your brand.
        </footer>
      </div>
    </div>
  );
}
