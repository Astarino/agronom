"use client";

import { useState } from "react";
import { Plus, X, Leaf } from "lucide-react";

const DEFAULT_STEPS = JSON.stringify([
  { step: 1, title: "Сортировка семян", desc: "Убираем повреждённые семена" },
  { step: 2, title: "Засеваем лоток", desc: "Равномерно распределяем семена на агровате" },
  { step: 3, title: "Тёмная фаза", desc: "Прижим, тёмное место", phase: "DARK_PHASE" },
  { step: 4, title: "Под свет", desc: "Свет 16 ч / темнота 8 ч", phase: "LIGHT_PHASE" },
  { step: 5, title: "Готово!", desc: "Собираем урожай", phase: "READY" },
]);

export function AddSpeciesButton({ asCard = false }: { asCard?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", variety: "", color: "#87bd9c",
    seedAmount: "10", soakHours: "",
    pressWeight: "1000",
    darkDaysMin: "2", darkDaysMax: "3",
    lightDaysMin: "4", lightDaysMax: "6",
    tempMin: "20", tempMax: "23",
    humidityMin: "50", humidityMax: "70",
    heightMin: "5", heightMax: "10",
    overgrownHeight: "12",
    lightHeight: "",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        seedAmount: parseFloat(form.seedAmount),
        soakHours: form.soakHours ? parseFloat(form.soakHours) : null,
        pressWeight: parseFloat(form.pressWeight),
        darkDaysMin: parseInt(form.darkDaysMin),
        darkDaysMax: parseInt(form.darkDaysMax),
        lightDaysMin: parseInt(form.lightDaysMin),
        lightDaysMax: parseInt(form.lightDaysMax),
        tempMin: parseFloat(form.tempMin),
        tempMax: parseFloat(form.tempMax),
        humidityMin: parseFloat(form.humidityMin),
        humidityMax: parseFloat(form.humidityMax),
        heightMin: parseFloat(form.heightMin),
        heightMax: parseFloat(form.heightMax),
        overgrownHeight: parseFloat(form.overgrownHeight),
        lightHeight: form.lightHeight ? parseFloat(form.lightHeight) : null,
        steps: DEFAULT_STEPS,
        readySigns: JSON.stringify([`Высота ${form.heightMin}–${form.heightMax} см`, "Свежий вид"]),
        overgrownSigns: JSON.stringify([`Высота выше ${form.overgrownHeight} см`, "Начинает падать"]),
      };
      const res = await fetch("/api/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setOpen(false); window.location.reload(); }
    } finally {
      setLoading(false);
    }
  }

  const trigger = asCard ? (
    <button onClick={() => setOpen(true)}
      className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition-all hover:border-[color:var(--border-light)] hover:bg-white/[0.03] min-h-[160px]"
      style={{ borderColor: "var(--border)" }}>
      <Plus size={24} style={{ color: "var(--text-muted)" }} />
      <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Добавить вид</span>
    </button>
  ) : (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
      style={{ background: "rgba(135, 189, 156,0.1)", color: "var(--green-sprout)", border: "1px solid rgba(135, 189, 156,0.3)" }}>
      <Plus size={16} /> Новый вид
    </button>
  );

  return (
    <>
      {trigger}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(7,15,9,0.9)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl my-4"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <Leaf size={18} style={{ color: "var(--green-sprout)" }} />
                <h2 className="font-display text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  Новый вид
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Название" required value={form.name} onChange={(v) => set("name", v)} placeholder="Редис «Дайкон»" span2 />
                <Field label="Сорт" value={form.variety} onChange={(v) => set("variety", v)} placeholder="Daikon" />
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Цвет</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)}
                      className="w-10 h-9 rounded-lg cursor-pointer border-0 p-1" style={{ background: "var(--surface)" }} />
                    <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{form.color}</span>
                  </div>
                </div>
                <Field label="Семян, г/лоток" value={form.seedAmount} onChange={(v) => set("seedAmount", v)} type="number" />
                <Field label="Прижим, г" value={form.pressWeight} onChange={(v) => set("pressWeight", v)} type="number" />
                <Field label="Замачивание, ч" value={form.soakHours} onChange={(v) => set("soakHours", v)} type="number" placeholder="нет" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Тёмная фаза (дней мин)" value={form.darkDaysMin} onChange={(v) => set("darkDaysMin", v)} type="number" />
                <Field label="Тёмная фаза (дней макс)" value={form.darkDaysMax} onChange={(v) => set("darkDaysMax", v)} type="number" />
                <Field label="Фаза света (дней мин)" value={form.lightDaysMin} onChange={(v) => set("lightDaysMin", v)} type="number" />
                <Field label="Фаза света (дней макс)" value={form.lightDaysMax} onChange={(v) => set("lightDaysMax", v)} type="number" />
                <Field label="Высота мин, см" value={form.heightMin} onChange={(v) => set("heightMin", v)} type="number" />
                <Field label="Высота макс, см" value={form.heightMax} onChange={(v) => set("heightMax", v)} type="number" />
                <Field label="Переросло от, см" value={form.overgrownHeight} onChange={(v) => set("overgrownHeight", v)} type="number" />
                <Field label="Высота света, см" value={form.lightHeight} onChange={(v) => set("lightHeight", v)} type="number" placeholder="нет" />
                <Field label="Темп. мин, °C" value={form.tempMin} onChange={(v) => set("tempMin", v)} type="number" />
                <Field label="Темп. макс, °C" value={form.tempMax} onChange={(v) => set("tempMax", v)} type="number" />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                * Шаги инструкции можно отредактировать после создания
              </p>
              <button type="submit" disabled={loading || !form.name}
                className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: "var(--green-sprout)", color: "#0A1409" }}>
                {loading ? "Сохранение..." : "Добавить вид"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required, span2 }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}{required && <span style={{ color: "var(--green-sprout)" }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2 rounded-xl text-sm"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      />
    </div>
  );
}
