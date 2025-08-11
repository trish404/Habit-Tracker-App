import { useMemo, useState } from "react";
import { ChevronLeft, HelpCircle, Target, ChevronRight } from "lucide-react";
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
  subtle: "#A3A3A9",
  purple: "#7C3AED",
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
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((m, i) => ({
    label: m,
    kg: 65 - i * 0.15 + (i % 3 === 0 ? 0.8 : -0.2),
  }));

function useSeries(range) {
  return useMemo(() => {
    switch (range) {
      case "Day":
        return makeDay();
      case "Week":
        return makeWeek();
      case "Month":
        return makeMonth();
      case "Year":
        return makeYear();
      default:
        return makeWeek();
    }
  }, [range]);
}

export default function Weight() {
  const [range, setRange] = useState("Week");
  const [goalKg, setGoalKg] = useState(75);
  const data = useSeries(range);

  const avg = useMemo(() => {
    const n = data.length;
    const sum = data.reduce((a, b) => a + b.kg, 0);
    return sum / n;
  }, [data]);

  return (
    <div className="min-h-screen w-full" style={{ background: THEME.bg }}>
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between">
        <button
          className="h-9 w-9 rounded-xl flex items-center justify-center border"
          style={{
            color: THEME.text,
            borderColor: THEME.cardBorder,
            background: THEME.card,
          }}
          aria-label="Back"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-sm" style={{ color: THEME.subtle }}>
            Track
          </div>
          <div className="text-3xl font-semibold" style={{ color: THEME.text }}>
            Weight
          </div>
        </div>
        <button
          className="h-9 w-9 rounded-xl flex items-center justify-center border"
          style={{
            color: THEME.text,
            borderColor: THEME.cardBorder,
            background: THEME.card,
          }}
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>

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
                background: r === range ? "rgba(124,58,237,0.18)" : "transparent",
                border: `1px solid ${
                  r === range ? THEME.purple : "transparent"
                }`,
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: THEME.cardBorder, background: THEME.card }}
        >
          <div className="h-[280px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="1 8" opacity={0.25} />
                <XAxis
                  dataKey="label"
                  stroke={THEME.subtle}
                  tickLine={false}
                  axisLine={{ stroke: THEME.cardBorder }}
                  tickMargin={8}
                />
                <YAxis
                  domain={[62.5, 67.5]}
                  allowDataOverflow
                  stroke={THEME.subtle}
                  tickLine={false}
                  axisLine={{ stroke: THEME.cardBorder }}
                  width={30}
                />
                <defs>
                  <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="10%"
                      stopColor={THEME.purple}
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="80%"
                      stopColor={THEME.purple}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ stroke: THEME.purple, strokeWidth: 1, opacity: 0.3 }}
                  contentStyle={{
                    background: THEME.bg,
                    border: `1px solid ${THEME.cardBorder}`,
                    borderRadius: 12,
                    color: THEME.text,
                  }}
                  labelStyle={{ color: THEME.subtle }}
                  formatter={(v) => [`${Number(v).toFixed(1)} kg`, "Weight"]}
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke={THEME.purple}
                  fill="url(#wfill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 text-center">
        <div
          className="text-4xl font-semibold"
          style={{ color: THEME.text }}
        >{`${avg.toFixed(1)} kg`}</div>
        <div className="text-sm mt-1" style={{ color: THEME.subtle }}>
          Average weight per {range.toLowerCase()}
        </div>
      </div>

      <div className="px-5 mt-6">
        <button
          className="w-full py-3 rounded-2xl font-medium"
          style={{ background: THEME.purple, color: "white" }}
        >
          Track My Weight
        </button>
      </div>

      <div className="px-5 mt-4 pb-10">
        <div
          className="rounded-2xl border px-4 py-3 flex items-center justify-between"
          style={{
            borderColor: THEME.cardBorder,
            background: THEME.card,
            color: THEME.text,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl border flex items-center justify-center"
              style={{ borderColor: THEME.cardBorder }}
            >
              <Target size={18} />
            </div>
            <div>
              <div className="text-sm" style={{ color: THEME.subtle }}>
                Goal
              </div>
              <div className="text-base">{goalKg} kg</div>
            </div>
          </div>
          <button
            onClick={() => setGoalKg((g) => (g === 75 ? 70 : 75))}
            className="h-9 px-3 rounded-xl border flex items-center gap-2"
            style={{ borderColor: THEME.cardBorder, color: THEME.text }}
          >
            Edit <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
