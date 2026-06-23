// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Small inline-editable cell components shared by every table.
// Each saves on blur (text/number) or immediately (checkbox/select)
// — never on every keystroke, to avoid hammering Firestore.
// ============================================================

import React, { useEffect, useState, type CSSProperties } from "react";

type TextCellProps = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
};

export function TextCell({ value, onSave, placeholder, className, style }: TextCellProps) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value]);

  return (
    <input
      className={`cell-input ${className ?? ""}`}
      style={style}
      value={draft}
      placeholder={placeholder}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onSave(draft);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

type NumberCellProps = {
  value: number | undefined;
  onSave: (value: number) => void;
  className?: string;
  min?: number;
};

export function NumberCell({ value, onSave, className, min }: NumberCellProps) {
  const [draft, setDraft] = useState(String(value ?? ""));
  useEffect(() => setDraft(String(value ?? "")), [value]);

  return (
    <input
      type="number"
      className={`cell-input ${className ?? ""}`}
      value={draft}
      min={min}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
      onBlur={() => {
        const num = Number(draft);
        if (!Number.isNaN(num) && num !== value) onSave(num);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

type CheckboxCellProps = {
  checked: boolean;
  onSave: (checked: boolean) => void;
};

export function CheckboxCell({ checked, onSave }: CheckboxCellProps) {
  return (
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSave(e.target.checked)}
    />
  );
}

type SelectCellProps = {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
};

export function SelectCell({ value, options, onSave }: SelectCellProps) {
  return (
    <select className="cell-input" value={value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSave(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

type AllergenChipsCellProps = {
  selected: number[];
  legend: Record<number, string>;
  onSave: (selected: number[]) => void;
};

export function AllergenChipsCell({ selected, legend, onSave }: AllergenChipsCellProps) {
  const selectedSet = new Set(selected ?? []);
  function toggle(code: number) {
    const next = new Set(selectedSet);
    if (next.has(code)) next.delete(code); else next.add(code);
    onSave(Array.from(next).sort((a, b) => a - b));
  }
  return (
    <div className="allergen-chips">
      {Object.entries(legend).map(([codeStr, label]) => {
        const code = Number(codeStr);
        const isActive = selectedSet.has(code);
        return (
          <button
            key={code}
            type="button"
            className={`allergen-chip ${isActive ? "active" : ""}`}
            title={label}
            onClick={() => toggle(code)}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
