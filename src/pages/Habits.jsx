import { useMemo, useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, addWeeks, addYears, subMonths } from "date-fns";
import { Plus, Filter, Calendar as CalendarIcon, Palette, Smile, Search, ChevronLeft, ChevronRight, X } from "lucide-react";

const iso = (d) => format(d, "yyyy-MM-dd");
const todayIso = iso(new Date());
const seedHabits = [
  { id: "1", name: "Morning Run", emoji: "🏃‍♀️", color: "#ff8fab", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
  { id: "2", name: "Read a Book", emoji: "📚", color: "#ffd166", frequency: "daily", createdAt: new Date().toISOString(), completions: [] },
  { id: "3", name: "Meal Prep", emoji: "🍱", color: "#bde0fe", frequency: "weekly", createdAt: new Date().toISOString(), completions: [] },
  { id: "4", name: "Budget Review", emoji: "💸", color: "#caffbf", frequency: "monthly", createdAt: new Date().toISOString(), completions: [] },
  { id: "5", name: "Health Check", emoji: "🩺", color: "#ffc6ff", frequency: "yearly", createdAt: new Date().toISOString(), completions: [] },
];

function classNames(...xs) { return xs.filter(Boolean).join(" "); }

function Toolbar({ onOpenCreate, query, setQuery, activeFreq, setActiveFreq }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ const onDoc=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false);}; document.addEventListener("mousedown", onDoc); return ()=>document.removeEventListener("mousedown", onDoc);},[]);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search habits" className="pl-8 h-9 w-full rounded-lg border bg-white/60 dark:bg-neutral-900 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-300" />
        </div>
        <div className="relative" ref={ref}>
          <button onClick={()=>setOpen(v=>!v)} className="h-9 px-3 rounded-lg border text-sm flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"><Filter className="h-4 w-4"/>View</button>
          {open && (
            <div className="absolute z-20 mt-2 w-48 rounded-lg border bg-white dark:bg-neutral-950 p-2 shadow-xl">
              <div className="text-xs mb-2 font-medium text-neutral-500">Group by</div>
              <div className="grid grid-cols-2 gap-2">
                {["daily","weekly","monthly","yearly"].map(f=> (
                  <button key={f} onClick={()=>{setActiveFreq(f); setOpen(false);}} className={classNames("h-8 rounded-md text-sm capitalize border", activeFreq===f?"bg-pink-500 text-white border-pink-500":"hover:bg-neutral-50 dark:hover:bg-neutral-900")}>{f}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenCreate} className="h-9 px-3 rounded-lg bg-pink-500 text-white text-sm flex items-center gap-2 hover:brightness-95 active:brightness-90"><Plus className="h-4 w-4"/>Create habit</button>
      </div>
    </div>
  );
}

function HabitCard({ habit, onToggle, onOpenDetail }) {
  const streak = useMemo(()=> calcStreak(habit.completions), [habit.completions]);
  return (
    <div style={{ borderColor: habit.color }} className="rounded-2xl border-2 p-4 hover:shadow-md transition-shadow cursor-pointer bg-white/80 dark:bg-neutral-950" onClick={()=>onOpenDetail(habit)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden style={{ color: habit.color }}>{habit.emoji}</span>
          <span className="font-medium">{habit.name}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ backgroundColor: habit.color + "22", color: habit.color }}>{habit.frequency}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-neutral-500">Streak: <span className="font-medium text-neutral-900 dark:text-neutral-100">{streak}</span></div>
        <button onClick={(e)=>{e.stopPropagation(); onToggle(habit);}} className="h-8 px-3 rounded-md border text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">Mark done</button>
      </div>
    </div>
  );
}

function calcStreak(completions) {
  if (!completions?.length) return 0;
  const set = new Set(completions);
  let d = new Date();
  let c = 0;
  while (set.has(iso(d))) { c++; d = new Date(d.setDate(d.getDate()-1)); }
  return c;
}

function MonthGrid({ monthDate=new Date(), completions, onToggleDay, accent="#ff8fab" }) {
  const start = startOfWeek(startOfMonth(monthDate));
  const end = endOfWeek(endOfMonth(monthDate));
  const days = eachDayOfInterval({ start, end });
  const compSet = new Set(completions);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium flex items-center gap-2"><CalendarIcon className="h-4 w-4"/>{format(monthDate, "MMMM yyyy")}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-neutral-500 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=> <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d)=>{
          const inMonth = d.getMonth()===monthDate.getMonth();
          const isDone = compSet.has(iso(d));
          return (
            <button key={d.toISOString()} onClick={()=>onToggleDay(d)} className={classNames("aspect-square rounded-md border text-xs flex items-center justify-center", inMonth?"opacity-100":"opacity-40")} style={{ background: isDone ? accent+"33" : undefined, borderColor: isDone?accent: "rgba(0,0,0,0.08)", color: isDone?accent: undefined }}>
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyHeatmap({ weeks=12, completions, onToggleDay, accent="#ff8fab" }) {
  const today = new Date();
  const start = endOfWeek(addWeeks(today, -weeks+1));
  const days = eachDayOfInterval({ start, end: today });
  const compSet = new Set(completions);
  return (
    <div className="flex gap-1 overflow-x-auto p-1 rounded-lg border">
      {Array.from({length: weeks}).map((_, i)=>{
        const wStart = addWeeks(start, i);
        const wDays = eachDayOfInterval({ start: wStart, end: endOfWeek(wStart) });
        return (
          <div key={i} className="grid grid-rows-7 gap-1">
            {wDays.map((d)=>{
              const isDone = compSet.has(iso(d));
              return (
                <button key={d.toISOString()} onClick={()=>onToggleDay(d)} className="h-3 w-3 rounded-sm border" style={{ background: isDone?accent:undefined, borderColor: isDone?accent: "rgba(0,0,0,0.08)" }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function YearStrip({ years=5, completions, onToggleDay, accent="#ff8fab" }) {
  const today = new Date();
  const start = addYears(today, -(years-1));
  const compSet = new Set(completions);
  return (
    <div className="space-y-3">
      {Array.from({length: years}).map((_, i)=>{
        const year = addYears(start, i);
        const months = Array.from({length:12}).map((_,m)=> new Date(year.getFullYear(), m, 1));
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-16 text-sm text-neutral-500">{format(year, "yyyy")}</div>
            <div className="flex gap-1">
              {months.map((mDate, idx)=>{
                const monthKey = format(mDate, "yyyy-MM");
                const any = Array.from(compSet).some(d => d.startsWith(monthKey));
                return <div key={idx} className="h-6 w-6 rounded-sm border" style={{ background: any?accent:undefined, borderColor: any?accent: "rgba(0,0,0,0.08)" }} />
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ColorSwatch({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} className="h-9 w-12 p-1 rounded-md border" />
      <div className="text-xs text-neutral-500">Pick a custom color</div>
    </div>
  );
}

function CreateHabitModal({ open, setOpen, onCreate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState("#ff8fab");
  const [frequency, setFrequency] = useState("daily");
  const close = ()=> setOpen(false);
  const submit = () => { if (!name.trim()) return; onCreate({ id: crypto.randomUUID(), name, emoji, color, frequency, createdAt: new Date().toISOString(), completions: [] }); close(); setName(""); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={close}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl border bg-white dark:bg-neutral-950 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-lg">Create habit</div>
          <button onClick={close} className="h-8 w-8 inline-flex items-center justify-center rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-900"><X className="h-4 w-4"/></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Habit name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Drink water" className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-pink-300"/>
          </div>
          <div className="space-y-1">
            <label className="text-sm inline-flex items-center gap-2"><Smile className="h-4 w-4"/>Emoji</label>
            <input value={emoji} onChange={(e)=>setEmoji(e.target.value)} placeholder="😊" className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-pink-300"/>
          </div>
          <div className="space-y-1">
            <label className="text-sm inline-flex items-center gap-2"><Palette className="h-4 w-4"/>Color</label>
            <ColorSwatch value={color} onChange={setColor} />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Frequency</label>
            <select value={frequency} onChange={(e)=>setFrequency(e.target.value)} className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-pink-300">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button onClick={close} className="h-9 px-3 rounded-lg border text-sm">Cancel</button>
          <button onClick={submit} className="h-9 px-3 rounded-lg bg-pink-500 text-white text-sm">Create</button>
        </div>
      </div>
    </div>
  );
}

function HabitDetail({ habit, setHabit, onClose }) {
  const [month, setMonth] = useState(new Date());
  const [tab, setTab] = useState(habit.frequency);
  const toggleDay = (d) => {
    const key = iso(d);
    const has = habit.completions.includes(key);
    const next = has ? habit.completions.filter(x=>x!==key) : [...habit.completions, key];
    setHabit({ ...habit, completions: next });
  };
  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white dark:bg-neutral-950 border-l p-4 overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: habit.color }}>{habit.emoji}</span>
            <div>
              <div className="font-semibold text-lg">{habit.name}</div>
              <div className="text-xs text-neutral-500 capitalize">{habit.frequency}</div>
            </div>
          </div>
          <button className="h-8 px-3 rounded-md border text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="grid grid-cols-4 rounded-lg border p-1 text-sm">
          {[
            {k:"daily", label:"Daily"},
            {k:"weekly", label:"Weekly"},
            {k:"monthly", label:"Monthly"},
            {k:"yearly", label:"Yearly"},
          ].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} className={classNames("h-8 rounded-md", tab===t.k?"bg-pink-500 text-white":"hover:bg-neutral-50 dark:hover:bg-neutral-900")}>{t.label}</button>
          ))}
        </div>
        {tab==="daily" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <button className="h-8 w-8 rounded-md border inline-flex items-center justify-center" onClick={()=>setMonth(subMonths(month,1))}><ChevronLeft className="h-4 w-4"/></button>
              <div className="font-medium">{format(month, "MMMM yyyy")}</div>
              <button className="h-8 w-8 rounded-md border inline-flex items-center justify-center" onClick={()=>setMonth(addMonths(month,1))}><ChevronRight className="h-4 w-4"/></button>
            </div>
            <MonthGrid monthDate={month} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color}/>
          </div>
        )}
        {tab==="weekly" && (
          <div className="mt-4">
            <WeeklyHeatmap weeks={20} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color}/>
          </div>
        )}
        {tab==="monthly" && (
          <div className="mt-4">
            <MonthGrid monthDate={new Date()} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color}/>
            <div className="text-xs text-neutral-500 mt-2">Click a day to toggle completion.</div>
          </div>
        )}
        {tab==="yearly" && (
          <div className="mt-4">
            <YearStrip years={5} completions={habit.completions} onToggleDay={toggleDay} accent={habit.color}/>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState(seedHabits);
  const [query, setQuery] = useState("");
  const [activeFreq, setActiveFreq] = useState("daily");
  const [openCreate, setOpenCreate] = useState(false);
  const [detailHabit, setDetailHabit] = useState(null);
  const filtered = useMemo(()=> habits.filter(h=> h.name.toLowerCase().includes(query.toLowerCase()) && (activeFreq? h.frequency===activeFreq : true)), [habits, query, activeFreq]);
  const onCreate = (h)=> setHabits([h, ...habits]);
  const onToggle = (h) => {
    const has = h.completions.includes(todayIso);
    const next = has ? h.completions.filter(x=>x!==todayIso) : [...h.completions, todayIso];
    setHabits(prev=> prev.map(x=> x.id===h.id ? { ...x, completions: next } : x));
  };
  const openDetail = (h) => setDetailHabit(h);
  const closeDetail = () => setDetailHabit(null);
  const updateDetailHabit = (updated) => { setHabits(prev=> prev.map(x=> x.id===updated.id ? updated : x)); setDetailHabit(updated); };
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Your Habits</h1>
        <p className="text-sm text-neutral-500">Create, color, and track daily / weekly / monthly / yearly habits.</p>
      </div>
      <Toolbar onOpenCreate={()=>setOpenCreate(true)} query={query} setQuery={setQuery} activeFreq={activeFreq} setActiveFreq={setActiveFreq} />
      <div className="grid grid-cols-4 rounded-lg border p-1 text-sm w-full max-w-md">
        {[
          {k:"daily", label:"Daily"},
          {k:"weekly", label:"Weekly"},
          {k:"monthly", label:"Monthly"},
          {k:"yearly", label:"Yearly"},
        ].map(t => (
          <button key={t.k} onClick={()=>setActiveFreq(t.k)} className={classNames("h-8 rounded-md", activeFreq===t.k?"bg-pink-500 text-white":"hover:bg-neutral-50 dark:hover:bg-neutral-900")}>{t.label}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(h=> (
          <HabitCard key={h.id} habit={h} onToggle={onToggle} onOpenDetail={openDetail} />
        ))}
      </div>
      {filtered.length===0 && (
        <div className="text-sm text-neutral-500 border rounded-lg p-6 text-center">No habits yet. Click <span className="font-medium">Create habit</span> to get started.</div>
      )}
      <CreateHabitModal open={openCreate} setOpen={setOpenCreate} onCreate={onCreate} />
      {detailHabit && <HabitDetail habit={detailHabit} setHabit={updateDetailHabit} onClose={closeDetail} />}
    </div>
  );
}
