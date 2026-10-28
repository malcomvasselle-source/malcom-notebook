"use client";
import { ReactNode } from "react";

export function Sparkle({ size = 18 }: { size?: number }) {
  return (
    <svg className="spark" width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1l2.6 7.4L22 11l-7.4 2.6L12 21l-2.6-7.4L2 11l7.4-2.6z" fill="currentColor" />
    </svg>
  );
}

export function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-label="Malcom Notebook">
      <rect x="14" y="10" width="62" height="76" rx="12" fill="#fff" stroke="#4338ca" strokeWidth="5" />
      <path d="M28 52V28l15 14 15-14v24" fill="none" stroke="#4338ca" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 66h30M28 76h20" stroke="#c7c9f5" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 8l3.5 9.5L89 21l-9.5 3.5L76 34l-3.5-9.5L63 21l9.5-3.5z" fill="#f59e0b" />
    </svg>
  );
}

export function Header({ title, sub, back, right }: { title: string; sub?: string; back?: string; right?: ReactNode }) {
  return (
    <header className="head">
      {back && <a className="back" href={back} aria-label="Retour">‹</a>}
      <div className="head-t">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </header>
  );
}

/** Liste de lignes "carnet" avec puces étincelle. */
export function LineList({ values, onChange, placeholder, minRows, addLabel = "+ Ajouter une ligne" }: {
  values: string[]; onChange: (v: string[]) => void; placeholder?: string; minRows?: number; addLabel?: string;
}) {
  const set = (i: number, v: string) => onChange(values.map((x, j) => (j === i ? v : x)));
  return (
    <div className="lines">
      {values.map((v, i) => (
        <div className="line" key={i}>
          <Sparkle size={14} />
          <input value={v} placeholder={i === 0 ? placeholder : ""} onChange={(e) => set(i, e.target.value)} />
        </div>
      ))}
      <button className="link" onClick={() => onChange([...values, ""])}>{addLabel}</button>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
