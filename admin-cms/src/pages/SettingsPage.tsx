// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Settings page — settings/general (contact info) and
// settings/hours (weekly opening hours). These are single fixed
// documents, so a form makes more sense here than a table.
// ============================================================

import React, { useEffect, useState } from "react";
import { useDocument } from "../lib/useCollection";
import { DAY_KEYS, DAY_LABELS, type DayHours, type SettingsGeneral, type SettingsHours } from "../lib/types";

function useSaveStatus() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function run(fn: () => Promise<void>) {
    setStatus("saving");
    try {
      await fn();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return { status, run };
}

function GeneralSettingsForm() {
  const { data, loading, save } = useDocument<SettingsGeneral>("settings", "general");
  const { status, run } = useSaveStatus();
  const [form, setForm] = useState<SettingsGeneral>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function field<K extends keyof SettingsGeneral>(key: K) {
    return {
      value: form[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }))
    };
  }

  function handleSave() {
    run(() => save(form));
  }

  if (loading) return <p className="empty-state">Betöltés…</p>;

  return (
    <>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="address">Cím</label>
          <input id="address" {...field("address")} placeholder="Jókai Mór ltp. 9., Hajmáskér, 8192" />
        </div>
        <div className="form-field">
          <label htmlFor="addressMapsUrl">Google Maps link</label>
          <input id="addressMapsUrl" {...field("addressMapsUrl")} placeholder="https://maps.google.com/?q=..." />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Telefonszám (hívható, pl. +36705846276)</label>
          <input id="phone" {...field("phone")} placeholder="+36705846276" />
        </div>
        <div className="form-field">
          <label htmlFor="phoneDisplay">Telefonszám (megjelenített)</label>
          <input id="phoneDisplay" {...field("phoneDisplay")} placeholder="(70) 584 6276" />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...field("email")} placeholder="hajmaskerpizzeria@gmail.com" />
        </div>
        <div className="form-field">
          <label htmlFor="messengerUrl">Messenger link</label>
          <input id="messengerUrl" {...field("messengerUrl")} placeholder="https://m.me/..." />
        </div>
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="heroPhotoUrl">Főoldali (hero) fotó URL</label>
          <input id="heroPhotoUrl" {...field("heroPhotoUrl")} placeholder="https://…/pizza.jpg" />
        </div>
      </div>
      <div className="toolbar" style={{ marginTop: "-0.5rem" }}>
        <span className={`save-status ${status}`}>
          {status === "saving" && "Mentés…"}
          {status === "saved" && "✓ Elmentve"}
          {status === "error" && "Hiba történt a mentéskor."}
        </span>
        <button className="btn btn-primary" onClick={handleSave} disabled={status === "saving"}>
          Mentés
        </button>
      </div>
    </>
  );
}

function HoursSettingsForm() {
  const { data, loading, save } = useDocument<SettingsHours>("settings", "hours");
  const { status, run } = useSaveStatus();
  const [form, setForm] = useState<SettingsHours>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function updateDay(day: keyof SettingsHours, patch: Partial<DayHours>) {
    setForm((f) => ({ ...f, [day]: { ...f[day], ...patch } }));
  }

  function handleSave() {
    run(() => save(form));
  }

  if (loading) return <p className="empty-state">Betöltés…</p>;

  return (
    <>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr", maxWidth: 560 }}>
        {DAY_KEYS.map((day) => {
          const dayData = form[day] ?? {};
          return (
            <div className="hours-row" key={day}>
              <span className="hours-day-label">{DAY_LABELS[day]}</span>
              {dayData.closed ? (
                <span className="page-sub" style={{ gridColumn: "2 / 4" }}>Zárva</span>
              ) : (
                <>
                  <input
                    type="time"
                    value={dayData.open ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDay(day, { open: e.target.value })}
                  />
                  <input
                    type="time"
                    value={dayData.close ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDay(day, { close: e.target.value })}
                  />
                </>
              )}
              <label className="hours-closed-toggle">
                <input
                  type="checkbox"
                  checked={!!dayData.closed}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateDay(day, { closed: e.target.checked })}
                />
                Zárva
              </label>
            </div>
          );
        })}
      </div>
      <div className="toolbar" style={{ marginTop: "-0.5rem" }}>
        <span className={`save-status ${status}`}>
          {status === "saving" && "Mentés…"}
          {status === "saved" && "✓ Elmentve"}
          {status === "error" && "Hiba történt a mentéskor."}
        </span>
        <button className="btn btn-primary" onClick={handleSave} disabled={status === "saving"}>
          Mentés
        </button>
      </div>
    </>
  );
}

export function SettingsPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Beállítások</h1>
          <p className="page-sub">Elérhetőségek és nyitvatartás. A "Mentés" gomb külön-külön menti a két szekciót.</p>
        </div>
      </div>

      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Elérhetőségek</h2>
      <GeneralSettingsForm />

      <h2 style={{ fontSize: "1rem", margin: "2rem 0 0.75rem" }}>Nyitvatartás</h2>
      <HoursSettingsForm />
    </div>
  );
}
