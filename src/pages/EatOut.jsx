import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Tag as TagIcon, Calendar, IndianRupee, Filter, Edit2, Save, X } from "lucide-react";
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
  bgFrom: "#0b0b0c",
  bgTo: "#0b0b0c",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  text: "#F5F5F6",
  subtle: "#A3A3A9",
  pink: "#FF4DA6",
  pinkSoft: "#FF7FBF",
  pill: "rgba(255, 77, 166, 0.14)",
  glow: "0 0 18px rgba(255, 77, 166, 0.4)",
};

const defaultTags = ["Food", "Coffee", "Transport", "Movies", "Treat", "Friends", "Date"];

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function monthKey(d) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatDateInput(d) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function Chip({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2"
      style={{ background: THEME.pill, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
    >
      {children}
    </button>
  );
}

function Card({ title, icon, children, actions }) {
  return (
    <div
      className="rounded-2xl p-4 shadow-xl"
      style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div className="font-semibold" style={{ color: THEME.text }}>{title}</div>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

function MonthPicker({ value, onChange, months }) {
  return (
    <div className="flex flex-wrap gap-2">
      {months.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-xl text-sm ${value === m ? "font-semibold" : ""}`}
          style={{
            background: value === m ? THEME.pink : THEME.card,
            color: value === m ? "#0b0b0c" : THEME.text,
            border: `1px solid ${THEME.cardBorder}`,
            boxShadow: value === m ? THEME.glow : "none",
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function ExpenseForm({ onAdd, Tags, onCreateTag }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [selected, setSelected] = useState([]);
  const [newTag, setNewTag] = useState("");

  function toggleTag(t) {
    setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function submit(e) {
    e.preventDefault();
    const amt = Number(amount);
    if (!title || !amt || !date) return;
    onAdd({ id: crypto.randomUUID(), title, amount: amt, date: new Date(date).toISOString(), tags: selected });
    setTitle("");
    setAmount("");
    setSelected([]);
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-5 gap-3">
      <div className="sm:col-span-2">
        <label className="text-xs" style={{ color: THEME.subtle }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pizza, Coffee, Cab..."
          className="w-full mt-1 rounded-xl px-3 py-2 outline-none"
          style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
        />
      </div>
      <div>
        <label className="text-xs" style={{ color: THEME.subtle }}>Amount</label>
        <div className="relative mt-1">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            min="0"
            className="w-full rounded-xl pl-8 pr-3 py-2 outline-none"
            style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          />
          <IndianRupee size={16} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: THEME.subtle }} />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs" style={{ color: THEME.subtle }}>Date</label>
        <div className="relative mt-1">
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="w-full rounded-xl pl-9 pr-3 py-2 outline-nonee"
            style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          />
          <Calendar size={16} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: THEME.subtle }} />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs" style={{ color: THEME.subtle }}>Tags</label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {Tags.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTag(t)}
              className={`px-3 py-1 rounded-full text-xs ${selected.includes(t) ? "font-semibold" : ""}`}
              style={{
                background: selected.includes(t) ? THEME.pink : THEME.pill,
                color: selected.includes(t) ? "#0b0b0c" : THEME.text,
                border: `1px solid ${THEME.cardBorder}`,
                boxShadow: selected.includes(t) ? THEME.glow : "none",
              }}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
              className="rounded-xl px-3 py-1 outline-none"
              style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            />
            <button
              type="button"
              onClick={() => {
                const t = newTag.trim();
                if (t) onCreateTag(t);
                setNewTag("");
              }}
              className="px-3 py-1 rounded-xl text-sm"
              style={{ background: THEME.pink, color: "#0b0b0c", boxShadow: THEME.glow }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div className="sm:col-span-5">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2 font-semibold"
          style={{ background: THEME.pink, color: "#0b0b0c", boxShadow: THEME.glow }}
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>
    </form>
  );
}

function TagManager({ tags, setTags }) {
  const [draft, setDraft] = useState(tags);
  const [editing, setEditing] = useState(false);

  function removeTag(t) {
    setDraft((prev) => prev.filter((x) => x !== t));
  }

  return (
    <div>
      {!editing && (
        <div className="flex items-center gap-2">
          <div className="text-sm" style={{ color: THEME.subtle }}>{draft.length} tags</div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 rounded-xl text-sm flex items-center gap-1"
            style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
          >
            <Edit2 size={14} /> Manage
          </button>
        </div>
      )}
      {editing && (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {draft.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs flex items-center gap-2" style={{ background: THEME.pill, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}>
                <TagIcon size={14} /> {t}
                <button onClick={() => removeTag(t)} className="rounded-full p-1" style={{ border: `1px solid ${THEME.cardBorder}` }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTags(draft);
                setEditing(false);
              }}
              className="px-3 py-1 rounded-xl text-sm flex items-center gap-1"
              style={{ background: THEME.pink, color: "#0b0b0c", boxShadow: THEME.glow }}
            >
              <Save size={14} /> Save
            </button>
            <button
              onClick={() => {
                setDraft(tags);
                setEditing(false);
              }}
              className="px-3 py-1 rounded-xl text-sm flex items-center gap-1"
              style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseTable({ items, onDelete, onEdit }) {
  const [editId, setEditId] = useState(null);
  const [row, setRow] = useState({ title: "", amount: 0, date: "", tags: [] });

  function beginEdit(it) {
    setEditId(it.id);
    setRow({ title: it.title, amount: it.amount, date: formatDateInput(it.date), tags: it.tags });
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${THEME.cardBorder}` }}>
      <table className="w-full text-sm" style={{ color: THEME.text }}>
        <thead style={{ background: THEME.bgFrom }}>
          <tr className="text-left">
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Tags</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center" style={{ color: THEME.subtle }}>No expenses yet</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id} className="border-t" style={{ borderColor: THEME.cardBorder }}>
              <td className="px-4 py-2 align-top" style={{ color: THEME.subtle }}>{formatDateInput(it.date)}</td>
              <td className="px-4 py-2 align-top">
                {editId === it.id ? (
                  <input
                    className="rounded-lg px-2 py-1 w-full outline-none"
                    style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
                    value={row.title}
                    onChange={(e) => setRow({ ...row, title: e.target.value })}
                  />
                ) : (
                  it.title
                )}
              </td>
              <td className="px-4 py-2 align-top">
                <div className="flex flex-wrap gap-2">
                  {editId === it.id ? (
                    row.tags.map((t, idx) => (
                      <span key={`${t}-${idx}`} className="px-2 py-1 rounded-full text-xs" style={{ background: THEME.pill, border: `1px solid ${THEME.cardBorder}` }}>{t}</span>
                    ))
                  ) : (
                    it.tags.map((t, idx) => (
                      <span key={`${t}-${idx}`} className="px-2 py-1 rounded-full text-xs" style={{ background: THEME.pill, border: `1px solid ${THEME.cardBorder}` }}>{t}</span>
                    ))
                  )}
                </div>
              </td>
              <td className="px-4 py-2 align-top">
                {editId === it.id ? (
                  <input
                    type="number"
                    className="rounded-lg px-2 py-1 w-28 outline-none"
                    style={{ background: THEME.bgFrom, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
                    value={row.amount}
                    onChange={(e) => setRow({ ...row, amount: Number(e.target.value) })}
                  />
                ) : (
                  rupee.format(it.amount)
                )}
              </td>
              <td className="px-4 py-2 align-top">
                {editId === it.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onEdit(it.id, { ...it, title: row.title, amount: row.amount, date: new Date(row.date).toISOString(), tags: row.tags });
                        setEditId(null);
                      }}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: THEME.pink, color: "#0b0b0c", boxShadow: THEME.glow }}
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => beginEdit(it)}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.cardBorder}` }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Totals({ items }) {
  const total = useMemo(() => items.reduce((s, x) => s + x.amount, 0), [items]);
  const byTag = useMemo(() => {
    const m = new Map();
    items.forEach((x) => x.tags.forEach((t) => m.set(t, (m.get(t) || 0) + x.amount)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-2xl p-4" style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}` }}>
        <div className="text-xs" style={{ color: THEME.subtle }}>Total this month</div>
        <div className="text-2xl font-semibold" style={{ color: THEME.text }}>{rupee.format(total)}</div>
      </div>
      {byTag.slice(0, 3).map(([tag, amt]) => (
        <div key={tag} className="rounded-2xl p-4" style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}` }}>
          <div className="text-xs" style={{ color: THEME.subtle }}>{tag}</div>
          <div className="text-xl font-semibold" style={{ color: THEME.text }}>{rupee.format(amt)}</div>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ items, monthKeyValue }) {
  const days = useMemo(() => {
    const [y, m] = monthKeyValue.split("-").map((n) => Number(n));
    const start = new Date(y, m - 1, 1);
    const end = endOfMonth(start);
    const points = [];
    let d = new Date(start);
    while (d <= end) {
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const sum = items.filter((x) => formatDateInput(x.date) === dayKey).reduce((s, x) => s + x.amount, 0);
      points.push({ day: d.getDate(), amount: sum });
      d.setDate(d.getDate() + 1);
    }
    return points;
  }, [items, monthKeyValue]);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={days} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="day" stroke={THEME.subtle} tickLine={false} axisLine={false} />
          <YAxis stroke={THEME.subtle} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
          <Tooltip
            contentStyle={{ background: THEME.bgFrom, border: `1px solid ${THEME.cardBorder}`, borderRadius: 12, color: THEME.text }}
            formatter={(v) => rupee.format(v)}
            labelFormatter={(l) => `Day ${l}`}
          />
          <Area type="monotone" dataKey="amount" stroke={THEME.pink} fill={THEME.pill} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function EatOutPage() {
  const [expenses, setExpenses] = useLocalStorage("eatout-v1", []);
  const [tags, setTags] = useLocalStorage("eatout-tags-v1", defaultTags);
  const [filterMonth, setFilterMonth] = useState(monthKey(new Date()));
  const monthsAvailable = useMemo(() => {
    const keys = new Set(expenses.map((e) => monthKey(e.date)));
    const arr = Array.from(keys);
    if (!arr.includes(filterMonth)) arr.push(filterMonth);
    arr.sort();
    return arr;
  }, [expenses, filterMonth]);

  const filtered = useMemo(() => expenses.filter((e) => monthKey(e.date) === filterMonth).sort((a, b) => new Date(b.date) - new Date(a.date)), [expenses, filterMonth]);

  function addExpense(e) {
    setExpenses((prev) => [e, ...prev]);
  }
  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  }
  function editExpense(id, next) {
    setExpenses((prev) => prev.map((x) => (x.id === id ? next : x)));
  }
  function createTag(t) {
    setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
  }

  const headerStyle = { color: THEME.text };

  return (
    <div className="min-h-[100dvh] w-screen overflow-x-hidden" style={{ background: `linear-gradient(180deg, ${THEME.bgFrom}, ${THEME.bgTo})` }}>
      <div className="w-full max-w-none px-6 md:px-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm" style={{ color: THEME.subtle }}>Tracker</div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={headerStyle}>Eat Out Expenses</h1>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs mb-2" style={{ color: THEME.subtle }}>Month</div>
            <MonthPicker value={filterMonth} onChange={setFilterMonth} months={monthsAvailable} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card title="Add expense" icon={<Plus size={18} style={{ color: THEME.pink }} />}>
            <ExpenseForm onAdd={addExpense} Tags={tags} onCreateTag={createTag} />
          </Card>
          <Card title="Tags" icon={<TagIcon size={18} style={{ color: THEME.pink }} />} actions={null}>
            <TagManager tags={tags} setTags={setTags} />
          </Card>
          <Card title="This month" icon={<Filter size={18} style={{ color: THEME.pink }} />}>
            <Totals items={filtered} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Expenses" icon={<IndianRupee size={18} style={{ color: THEME.pink }} />}>
              <ExpenseTable items={filtered} onDelete={deleteExpense} onEdit={editExpense} />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card title="Trend" icon={<Calendar size={18} style={{ color: THEME.pink }} />}>
              <TrendChart items={filtered} monthKeyValue={filterMonth} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
