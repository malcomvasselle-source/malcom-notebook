"use client";
import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
let loader: Promise<any> | null = null;
function loadYG(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  const w = window as any;
  if (w.YG?.Widget) return Promise.resolve(w.YG);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      w.onYouglishAPIReady = () => resolve(w.YG);
      const s = document.createElement("script");
      s.src = "https://youglish.com/public/emb/widget.js";
      s.async = true;
      s.onerror = () => { loader = null; reject(new Error("load")); };
      document.head.appendChild(s);
    });
  }
  return loader;
}

const ACCENTS = [
  { id: "us", label: "🇺🇸 US" },
  { id: "uk", label: "🇬🇧 UK" },
  { id: "aus", label: "🇦🇺 AUS" },
  { id: "ca", label: "🇨🇦 CA" },
];

export default function Pronounce({ initial }: { initial: string }) {
  const [input, setInput] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [accent, setAccent] = useState("us");
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error" | "ok">("idle");
  const [total, setTotal] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<any>(null);

  useEffect(() => {
    let dead = false;
    if (!query.trim()) { setStatus("idle"); return; }
    setStatus("loading");
    loadYG()
      .then((YG) => {
        if (dead || !host.current) return;
        if (!widget.current) {
          host.current.innerHTML = "";
          const el = document.createElement("div");
          host.current.appendChild(el);
          widget.current = new YG.Widget(el, {
            width: Math.min(host.current.clientWidth || 360, 520),
            components: 4 + 8 + 16 + 64,
            captionSize: 22,
            backgroundColor: "#ffffff",
            linkColor: "#4338ca",
            captionColor: "#1e1b4b",
            queryColor: "#f59e0b",
            markerColor: "#fde68a",
            restrictionMode: 1,
            events: {
              onFetchDone: (e: any) => { if (dead) return; setTotal(e.totalResult); setStatus(e.totalResult === 0 ? "empty" : "ok"); },
              onError: () => !dead && setStatus("error"),
            },
          });
        }
        widget.current.fetch(query.trim(), "english", accent);
      })
      .catch(() => !dead && setStatus("error"));
    return () => { dead = true; };
  }, [query, accent]);

  useEffect(() => () => { try { widget.current?.close?.(); } catch {} widget.current = null; }, []);

  return (
    <div>
      <form className="yg-form" onSubmit={(e) => { e.preventDefault(); setQuery(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Mot ou expression (ex : shenanigans)" autoCapitalize="none" autoCorrect="off" />
        <button className="yg-go" type="submit">Écouter</button>
      </form>
      <div className="yg-acc">
        {ACCENTS.map((a) => (
          <button key={a.id} className={"chip" + (accent === a.id ? " on" : "")} onClick={() => setAccent(a.id)}>{a.label}</button>
        ))}
      </div>
      <div className="yg-box" ref={host} />
      {status === "idle" && <p className="muted center">Tape un mot pour l'entendre prononcé par de vrais locuteurs (YouTube).</p>}
      {status === "loading" && <p className="muted center">Recherche…</p>}
      {status === "empty" && <p className="muted center">Aucun résultat pour « {query} » avec cet accent. Essaie un autre accent ou une autre orthographe.</p>}
      {status === "error" && <p className="muted center">Impossible de charger YouGlish (connexion requise).</p>}
      {status === "ok" && <p className="muted center">{total} extrait{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}. Utilise les flèches du lecteur pour passer au suivant.</p>}
      <p className="muted center small">Vidéos et sous-titres fournis par <a href="https://youglish.com" target="_blank" rel="noreferrer">YouGlish</a> · <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Conditions YouTube</a> · <a href="https://www.google.com/policies/privacy" target="_blank" rel="noreferrer">Confidentialité Google</a></p>
    </div>
  );
}
