import { useMemo, useState } from "react";
import { ChevronLeft, HelpCircle, Target, ChevronRight, X } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const THEME = {
  bg: "#0b0b0c",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  text: "#F5F5F6",
  subtle: "#B8B8BC",
  pink: "#f472b6",
  pinkDark: "#e11d48",
};

const ranges = ["Day", "Week", "Month", "Year"];

const makeWeek = () =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
    label: d,
    kg: 64.2 + [0.7, -1.2, 0.9, 0.6, -0.1, 0.5, -0.4][i],
  }));

const makeDay = () =>
  Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    kg: 64.5 + Math.sin(i / 3) * 0.15,
  }));

const makeMonth = () =>
  Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`.padStart(2, "0"),
    kg: 64 + Math.cos(i / 5) * 0.8,
  }));

const makeYear = () =>
  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => ({
    label: m,
    kg: 65 - i * 0.15 + (i % 3 === 0 ? 0.8 : -0.2),
  }));

function useSeries(range) {
  return useMemo(() => {
    switch (range) {
      case "Day": return makeDay();
      case "Week": return makeWeek();
      case "Month": return makeMonth();
      case "Year": return makeYear();
      default: return makeWeek();
    }
  }, [range]);
}

export default function Weight() {
  const [range, setRange] = useState("Week");
  const [goalKg, setGoalKg] = useState(75);

  // New: modals + inputs
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goalKg));

  const [showLogModal, setShowLogModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  // New: let user override the latest point on the chart
  const [overrideWeight, setOverrideWeight] = useState(null);

  const baseData = useSeries(range);

  const data = useMemo(() => {
    if (overrideWeight == null || baseData.length === 0) return baseData;
    const copy = baseData.slice();
    copy[copy.length - 1] = { ...copy[copy.length - 1], kg: overrideWeight };
    return copy;
  }, [baseData, overrideWeight]);

  const avg = useMemo(() => {
    const n = data.length || 1;
    const sum = data.reduce((a, b) => a + b.kg, 0);
    return sum / n;
  }, [data]);

  // ---- handlers ----
  function saveGoal() {
    const v = Number(goalInput);
    if (Number.isFinite(v) && v > 20 && v < 300) {
      setGoalKg(v);
      setShowGoalModal(false);
    }
  }

  function saveWeight() {
    const v = Number(weightInput);
    if (Number.isFinite(v) && v > 20 && v < 300) {
      setOverrideWeight(v);
      setShowLogModal(false);
      setWeightInput("");
    }
  }

  return (
    <div
      className="w-screen h-screen overflow-y-auto"
      style={{ background: THEME.bg }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between">
        <button
          className="h-9 w-9 rounded-xl flex items-center justify-center border"
          style={{ color: THEME.text, borderColor: THEME.cardBorder, background: THEME.card }}
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm" style={{ color: THEME.subtle }}>Track</div>
          <div className="text-3xl font-semibold" style={{ color: THEME.text }}>Weight</div>
        </div>
        <button
          className="h-9 w-9 rounded-xl flex items-center justify-center border"
          style={{ color: THEME.text, borderColor: THEME.cardBorder, background: THEME.card }}
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Range tabs */}
      <div className="px-5">
        <div
          className="inline-flex p-1 rounded-2xl border"
          style={{ borderColor: THEME.cardBorder, background: THEME.card }}
        >
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-4 py-2 text-sm rounded-xl transition"
              style={{
                color: r === range ? THEME.text : THEME.subtle,
                background: r === range ? "rgba(244,114,182,0.18)" : "transparent",
                border: `1px solid ${r === range ? THEME.pink : "transparent"}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 mt-5">
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: THEME.cardBorder, background: THEME.card }}>
          <div className="h-[280px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="1 8" opacity={0.25} />
                <XAxis dataKey="label" stroke={THEME.subtle} tickLine={false} axisLine={{ stroke: THEME.cardBorder }} tickMargin={8} />
                <YAxis domain={[62.5, 67.5]} allowDataOverflow stroke={THEME.subtle} tickLine={false} axisLine={{ stroke: THEME.cardBorder }} width={30} />
                <defs>
                  <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor={THEME.pink} stopOpacity={0.9} />
                    <stop offset="80%" stopColor={THEME.pink} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ stroke: THEME.pink, strokeWidth: 1, opacity: 0.3 }}
                  contentStyle={{
                    background: THEME.bg,
                    border: `1px solid ${THEME.cardBorder}`,
                    borderRadius: 12,
                    color: THEME.text,
                  }}
                  labelStyle={{ color: THEME.subtle }}
                  formatter={(v) => [`${Number(v).toFixed(1)} kg`, "Weight"]}
                />
                <Area type="monotone" dataKey="kg" stroke={THEME.pink} fill="url(#wfill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Average */}
      <div className="px-5 mt-4 text-center">
        <div className="text-4xl font-semibold" style={{ color: THEME.text }}>
          {avg.toFixed(1)} kg
        </div>
        <div className="text-sm mt-1" style={{ color: THEME.subtle }}>
          Average weight per {range.toLowerCase()}
        </div>
      </div>

      {/* CTA: enter current weight */}
      <div className="px-5 mt-6">
        <button
          onClick={() => setShowLogModal(true)}
          className="w-full py-3 rounded-2xl font-medium"
          style={{ background: THEME.pink, color: THEME.bg }}
        >
          Track My Weight
        </button>
      </div>

      {/* Goal row */}
      <div className="px-5 mt-4 pb-10">
        <div className="rounded-2xl border px-4 py-3 flex items-center justify-between"
             style={{ borderColor: THEME.cardBorder, background: THEME.card, color: THEME.text }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border flex items-center justify-center"
                 style={{ borderColor: THEME.cardBorder }}>
              <Target size={18} />
            </div>
            <div>
              <div className="text-sm" style={{ color: THEME.subtle }}>Goal</div>
              <div className="text-base">{goalKg} kg</div>
            </div>
          </div>
          <button
            onClick={() => { setGoalInput(String(goalKg)); setShowGoalModal(true); }}
            className="h-9 px-3 rounded-xl border flex items-center gap-2"
            style={{ borderColor: THEME.cardBorder, color: THEME.text, background: "rgba(255,255,255,0.06)" }}
          >
            Edit <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ---------- Modals ---------- */}
      {showGoalModal && (
        <Modal onClose={() => setShowGoalModal(false)} title="Edit goal">
          <div className="space-y-3">
            <label className="text-sm" style={{ color: THEME.subtle }}>Goal (kg)</label>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full rounded-xl px-3 py-2 outline-none"
              style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              min="20" max="300" step="0.1"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-3 py-2 rounded-xl"
                style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                Cancel
              </button>
              <button
                onClick={saveGoal}
                className="px-3 py-2 rounded-xl font-medium"
                style={{ background: THEME.pink, color: THEME.bg }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showLogModal && (
        <Modal onClose={() => setShowLogModal(false)} title="Log today’s weight">
          <div className="space-y-3">
            <label className="text-sm" style={{ color: THEME.subtle }}>Current weight (kg)</label>
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full rounded-xl px-3 py-2 outline-none"
              style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              min="20" max="300" step="0.1"
              placeholder="e.g., 64.3"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-3 py-2 rounded-xl"
                style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
              >
                Cancel
              </button>
              <button
                onClick={saveWeight}
                className="px-3 py-2 rounded-xl font-medium"
                style={{ background: THEME.pink, color: THEME.bg }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* Simple modal */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="relative w-full sm:w-[420px] rounded-2xl p-4 m-3"
           style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-medium" style={{ color: "#F5F5F6" }}>{title}</div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
