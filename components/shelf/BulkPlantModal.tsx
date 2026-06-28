"use client";

import { useState } from "react";
import { CalendarDays, Check, Sprout, X } from "lucide-react";
import { IconPicker } from "./IconPicker";

type Species = { id: string; name: string; color: string; variety: string | null };

export function BulkPlantModal({
  selectedIds,
  species,
  onClose,
  onSuccess,
}: {
  selectedIds: string[];
  species: Species[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const count = selectedIds.length;
  const [speciesId, setSpeciesId] = useState(species[0]?.id ?? "");
  const [eventAt, setEventAt] = useState(toDateTimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/containers/bulk/plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerIds: selectedIds,
          speciesId,
          eventAt: new Date(eventAt).toISOString(),
          notes: notes || null,
          emoji: emoji || null,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Не удалось выполнить посадку");
        return;
      }

      onSuccess(`Посажено контейнеров: ${result.planted}`);
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(4,10,5,.82)", backdropFilter: "blur(12px)" }}
      onClick={(event) => event.target === event.currentTarget && !loading && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-t-3xl border sm:rounded-3xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <header className="flex items-start gap-3 border-b p-5" style={{ borderColor: "var(--border)" }}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(135, 189, 156,.12)", color: "var(--green-sprout)" }}>
            <Sprout size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold">Массовая посадка</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Один вид и дата для {count} {containerWord(count)}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="ui-icon-button h-9 w-9">
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <label className="block" htmlFor="bulk-species">
            <span className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Вид растения
            </span>
            <select
              id="bulk-species"
              data-testid="bulk-species"
              value={speciesId}
              onChange={(event) => setSpeciesId(event.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              required
              autoFocus
            >
              {species.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="block" htmlFor="bulk-planted-at">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              <CalendarDays size={13} /> Дата и время посева
            </span>
            <input
              id="bulk-planted-at"
              type="datetime-local"
              value={eventAt}
              onChange={(event) => setEventAt(event.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              required
            />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Иконка контейнеров <span className="font-normal" style={{ color: "var(--text-muted)" }}>· необязательно</span>
            </span>
            <IconPicker value={emoji} onChange={setEmoji} />
          </div>

          <label className="block" htmlFor="bulk-notes">
            <span className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Общая заметка <span className="font-normal" style={{ color: "var(--text-muted)" }}>· необязательно</span>
            </span>
            <textarea
              id="bulk-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Например: новая партия семян, замачивание 9 часов"
              className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </label>

          {error && (
            <div role="alert" className="rounded-xl border px-3 py-2.5 text-sm"
              style={{ color: "#f3a0a0", background: "rgba(239,119,119,.08)", borderColor: "rgba(239,119,119,.2)" }}>
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={loading} className="ui-button-secondary flex-1">
              Отмена
            </button>
            <button type="submit" disabled={loading || !speciesId || !eventAt} className="ui-button-primary flex-[1.4] disabled:opacity-50">
              {loading ? (
                "Посадка…"
              ) : (
                <><Check size={16} /> Посадить {count}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function containerWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "контейнера";
  return "контейнеров";
}
