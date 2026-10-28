"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type Line = { id: string; text: string; note: string };
export type Note = { id: string; place: string; date: string; title: string; lines: Line[]; createdAt: number };
export type Week = {
  id: string; n: number; date: string; place: string;
  good: string[]; improve: string[]; expr: string[]; goal: string[];
  letter: string; drawing: string;
};
export type Start = { name: string; date: string; place: string; why: string; rows: { loser: string; hero: string }[] };
export type Data = { start: Start; notes: Note[]; weeks: Week[] };

const KEY = "malcom-notebook:v1";
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);
export const blanks = (n: number) => Array.from({ length: n }, () => "");
export const newLines = (n = 10): Line[] => Array.from({ length: n }, () => ({ id: uid(), text: "", note: "" }));

export const emptyData = (): Data => ({
  start: { name: "", date: today(), place: "", why: "", rows: Array.from({ length: 6 }, () => ({ loser: "", hero: "" })) },
  notes: [],
  weeks: [],
});

export function newNote(): Note {
  return { id: uid(), place: "", date: today(), title: "", lines: newLines(), createdAt: Date.now() };
}
export function newWeek(n: number): Week {
  return { id: uid(), n, date: today(), place: "", good: blanks(5), improve: blanks(5), expr: blanks(5), goal: blanks(4), letter: "", drawing: "" };
}

export function useStore() {
  const [data, setData] = useState<Data>(emptyData);
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData({ ...emptyData(), ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { alert("Stockage plein : exporte une sauvegarde."); }
    }, 300);
  }, [data, ready]);

  const update = useCallback((fn: (d: Data) => Data) => setData(fn), []);
  const replace = useCallback((d: Data) => setData({ ...emptyData(), ...d }), []);
  return { data, ready, update, replace };
}

export const countExpressions = (d: Data) =>
  d.notes.reduce((a, n) => a + n.lines.filter((l) => l.text.trim()).length, 0);
