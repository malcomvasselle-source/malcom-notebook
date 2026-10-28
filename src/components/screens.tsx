"use client";
import { useMemo, useState } from "react";
import { Data, Note, Week, blanks, countExpressions, newLines, newNote, newWeek, today } from "@/lib/store";
import { Field, Header, LineList, Logo, Sparkle } from "./ui";
import Drawing from "./Drawing";
import Pronounce from "./Pronounce";

type Upd = (fn: (d: Data) => Data) => void;
const fmt = (d: string) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");
const go = (h: string) => { location.hash = h; };

/* ───────── Accueil ───────── */
export function Home({ data }: { data: Data }) {
  const started = data.start.why.trim() || data.start.rows.some((r) => r.loser || r.hero);
  const last = [...data.notes].sort((a, b) => b.createdAt - a.createdAt)[0];
  return (
    <div className="page">
      <div className="hero">
        <Logo size={84} />
        <h1>Malcom Notebook</h1>
        <p className="tag">“Le seul carnet qui peut changer ta façon de parler anglais.”</p>
      </div>
      <div className="stats">
        <div><b>{countExpressions(data)}</b><span>expressions</span></div>
        <div><b>{data.notes.length}</b><span>pages</span></div>
        <div><b>{data.weeks.length}</b><span>semaines</span></div>
      </div>
      <a className="card big" href="#/start">
        <Sparkle size={22} />
        <div><h3>Starting Document</h3><p>{started ? "Relis ton pourquoi quand tu doutes." : "Écris pourquoi tu veux parler anglais."}</p></div>
        <i>›</i>
      </a>
      <a className="card big" href="#/notes">
        <Sparkle size={22} />
        <div><h3>English Notebook</h3><p>Mots et expressions appris, avec le lieu, la date et le thème.</p></div>
        <i>›</i>
      </a>
      <a className="card big" href="#/weeks">
        <Sparkle size={22} />
        <div><h3>Weekly Progress</h3><p>Le bilan de ta semaine : bien, à améliorer, objectifs.</p></div>
        <i>›</i>
      </a>
      <a className="card big" href="#/say">
        <Sparkle size={22} />
        <div><h3>Prononciation</h3><p>Écoute un mot dans de vraies vidéos (YouGlish).</p></div>
        <i>›</i>
      </a>
      <button className="cta" onClick={() => { const n = newNote(); local(n); }}>＋ Nouvelle page de notes</button>
      {last && <p className="muted center">Dernière page : <a href={`#/note/${last.id}`}>{last.title || "Sans titre"}</a></p>}
    </div>
  );
  function local(n: Note) { sessionStorage.setItem("mnb:new", JSON.stringify(n)); go("#/note/new"); }
}

/* ───────── Starting Document ───────── */
export function StartDoc({ data, update }: { data: Data; update: Upd }) {
  const s = data.start;
  const set = (p: Partial<typeof s>) => update((d) => ({ ...d, start: { ...d.start, ...p } }));
  const setRow = (i: number, k: "loser" | "hero", v: string) => set({ rows: s.rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)) });
  return (
    <div className="page">
      <Header title="The Starting Document" sub="Ton point de départ" back="#/" />
      <div className="sheet">
        <Field label="Nom"><input value={s.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <div className="row2">
          <Field label="Date"><input type="date" value={s.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Lieu"><input value={s.place} onChange={(e) => set({ place: e.target.value })} /></Field>
        </div>
        <h2 className="sec">The reason <em>WHY</em> I need to speak English</h2>
        <textarea className="box" rows={6} placeholder="Ma raison profonde…" value={s.why} onChange={(e) => set({ why: e.target.value })} />
        <div className="vs">
          <div className="vs-h"><span>LOSER ME</span><b>VS</b><span>HERO ME</span></div>
          {s.rows.map((r, i) => (
            <div className="vs-r" key={i}>
              <textarea rows={2} value={r.loser} onChange={(e) => setRow(i, "loser", e.target.value)} />
              <textarea rows={2} value={r.hero} onChange={(e) => setRow(i, "hero", e.target.value)} />
            </div>
          ))}
          <button className="link" onClick={() => set({ rows: [...s.rows, { loser: "", hero: "" }] })}>+ Ajouter une ligne</button>
        </div>
        <p className="muted center">Relis ce document quand tu doutes ou que la discipline manque.</p>
      </div>
    </div>
  );
}

/* ───────── Liste des pages ───────── */
export function Notes({ data }: { data: Data }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const sorted = [...data.notes].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
    if (!t) return sorted.map((n) => ({ n, hits: [] as string[] }));
    return sorted
      .map((n) => {
        const hits = n.lines.filter((l) => (l.text + " " + l.note).toLowerCase().includes(t)).map((l) => l.text);
        const meta = (n.title + n.place).toLowerCase().includes(t);
        return { n, hits: meta || hits.length ? hits : null };
      })
      .filter((x) => x.hits) as { n: Note; hits: string[] }[];
  }, [data.notes, q]);
  return (
    <div className="page">
      <Header title="English Notebook" sub="Tes pages d'expressions" back="#/" />
      <input className="search" placeholder="Rechercher un mot, un thème, un lieu…" value={q} onChange={(e) => setQ(e.target.value)} />
      <button className="cta" onClick={() => { sessionStorage.setItem("mnb:new", JSON.stringify(newNote())); go("#/note/new"); }}>＋ Nouvelle page</button>
      {list.length === 0 && <p className="empty">{q ? "Aucun résultat." : "Aucune page pour l'instant. Crée ta première page !"}</p>}
      {list.map(({ n, hits }) => {
        const filled = n.lines.filter((l) => l.text.trim());
        return (
          <a key={n.id} className="card" href={`#/note/${n.id}`}>
            <div>
              <h3>{n.title || "Sans titre"}</h3>
              <p>{[fmt(n.date), n.place].filter(Boolean).join(" · ")}</p>
              <p className="prev">{(hits.length ? hits : filled.map((l) => l.text)).slice(0, 3).join(" · ") || "Page vide"}</p>
            </div>
            <span className="badge">{filled.length}</span>
          </a>
        );
      })}
    </div>
  );
}

/* ───────── Une page ───────── */
export function NoteEditor({ id, data, update }: { id: string; data: Data; update: Upd }) {
  const isNew = id === "new";
  const [draft] = useState<Note | null>(() => {
    if (!isNew) return null;
    try { return JSON.parse(sessionStorage.getItem("mnb:new") || "null") ?? newNote(); } catch { return newNote(); }
  });
  const note = isNew ? draft! : data.notes.find((n) => n.id === id);
  // Une page « nouvelle » n'est ajoutée qu'à la première saisie.
  const [created, setCreated] = useState(false);
  if (!note) return <div className="page"><Header title="Page introuvable" back="#/notes" /></div>;
  const current = isNew ? data.notes.find((n) => n.id === note.id) ?? note : note;

  const patch = (p: Partial<Note>) =>
    update((d) => {
      const exists = d.notes.some((n) => n.id === current.id);
      const next = { ...current, ...p };
      return { ...d, notes: exists ? d.notes.map((n) => (n.id === current.id ? next : n)) : [next, ...d.notes] };
    });
  const setLine = (i: number, k: "text" | "note", v: string) => patch({ lines: current.lines.map((l, j) => (j === i ? { ...l, [k]: v } : l)) });
  const remove = () => {
    if (!confirm("Supprimer cette page ?")) return;
    update((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== current.id) }));
    go("#/notes");
  };
  void created; void setCreated;
  return (
    <div className="page">
      <Header title="English Notebook" back="#/notes" right={<button className="icon" onClick={remove} aria-label="Supprimer">🗑</button>} />
      <div className="sheet">
        <Field label="Titre / thème"><input value={current.title} placeholder="Ex : Au restaurant" onChange={(e) => patch({ title: e.target.value })} /></Field>
        <div className="row2">
          <Field label="Date"><input type="date" value={current.date} onChange={(e) => patch({ date: e.target.value })} /></Field>
          <Field label="Lieu"><input value={current.place} placeholder="Où je l'ai appris" onChange={(e) => patch({ place: e.target.value })} /></Field>
        </div>
        <div className="lines big">
          {current.lines.map((l, i) => (
            <div className="nline" key={l.id}>
              <Sparkle size={16} />
              <div>
                <input className="main" value={l.text} placeholder={i === 0 ? "Mot ou expression" : ""} onChange={(e) => setLine(i, "text", e.target.value)} />
                {(l.text || l.note) && <input className="sub" value={l.note} placeholder="Sens / exemple (optionnel)" onChange={(e) => setLine(i, "note", e.target.value)} />}
              </div>
              {l.text.trim() && <a className="say" href={`#/say/${encodeURIComponent(l.text.trim())}`} aria-label="Écouter la prononciation">🔊</a>}
            </div>
          ))}
          <button className="link" onClick={() => patch({ lines: [...current.lines, ...newLines(5)] })}>+ 5 lignes de plus</button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Weekly: liste ───────── */
export function Weeks({ data, update }: { data: Data; update: Upd }) {
  const sorted = [...data.weeks].sort((a, b) => b.n - a.n);
  const add = () => {
    const w = newWeek(Math.max(0, ...data.weeks.map((x) => x.n)) + 1);
    update((d) => ({ ...d, weeks: [...d.weeks, w] }));
    go(`#/week/${w.id}`);
  };
  return (
    <div className="page">
      <Header title="Weekly Progress" sub="Ton bilan chaque semaine" back="#/" />
      <button className="cta" onClick={add}>＋ Nouvelle semaine</button>
      {sorted.length === 0 && <p className="empty">Pas encore de bilan. Fais le premier en fin de semaine !</p>}
      {sorted.map((w) => (
        <a key={w.id} className="card" href={`#/week/${w.id}`}>
          <div>
            <h3>Semaine {w.n}</h3>
            <p>{fmt(w.date)}{w.place ? " · " + w.place : ""}</p>
            <p className="prev">{w.goal.filter(Boolean).slice(0, 2).join(" · ") || "—"}</p>
          </div>
          {w.drawing && <img className="thumb" src={w.drawing} alt="" />}
        </a>
      ))}
    </div>
  );
}

/* ───────── Weekly: fiche ───────── */
const ENCOURAGE = ["Ready ? Set. Speak !", "You're on the right track !", "Keep going, you're improving !", "Consistency beats intensity !"];
export function WeekEditor({ id, data, update }: { id: string; data: Data; update: Upd }) {
  const w = data.weeks.find((x) => x.id === id);
  if (!w) return <div className="page"><Header title="Semaine introuvable" back="#/weeks" /></div>;
  const patch = (p: Partial<Week>) => update((d) => ({ ...d, weeks: d.weeks.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const remove = () => {
    if (!confirm("Supprimer cette semaine ?")) return;
    update((d) => ({ ...d, weeks: d.weeks.filter((x) => x.id !== id) }));
    go("#/weeks");
  };
  const prev = data.weeks.filter((x) => x.n < w.n).sort((a, b) => b.n - a.n)[0];
  return (
    <div className="page">
      <Header title={`Weekly Progress`} back="#/weeks" right={<button className="icon" onClick={remove} aria-label="Supprimer">🗑</button>} />
      <div className="sheet">
        <div className="row3">
          <Field label="Semaine n°"><input type="number" min={1} value={w.n} onChange={(e) => patch({ n: Number(e.target.value) || 1 })} /></Field>
          <Field label="Date"><input type="date" value={w.date} onChange={(e) => patch({ date: e.target.value })} /></Field>
          <Field label="Lieu"><input value={w.place} onChange={(e) => patch({ place: e.target.value })} /></Field>
        </div>
        {prev && prev.goal.some(Boolean) && (
          <div className="recall"><b>Objectifs de la semaine {prev.n} :</b> {prev.goal.filter(Boolean).join(" · ")}</div>
        )}
        <h2 className="sec">What was good ?</h2>
        <LineList values={w.good} onChange={(v) => patch({ good: v })} />
        <h2 className="sec">What can I improve ?</h2>
        <LineList values={w.improve} onChange={(v) => patch({ improve: v })} />
        <h2 className="sec">New expressions</h2>
        <LineList values={w.expr} onChange={(v) => patch({ expr: v })} />
        <h2 className="sec">Draw something that represents your week</h2>
        <Drawing value={w.drawing} onChange={(v) => patch({ drawing: v })} />
        <h2 className="sec">Write something for yourself</h2>
        <textarea className="box tint" rows={4} placeholder="Un mot pour toi, le jour où tu relis ce carnet…" value={w.letter} onChange={(e) => patch({ letter: e.target.value })} />
        <h2 className="sec">Goal for next week</h2>
        <LineList values={w.goal} onChange={(v) => patch({ goal: v })} />
        <p className="muted center strong">{ENCOURAGE[w.n % ENCOURAGE.length]}</p>
      </div>
    </div>
  );
}

/* ───────── Réglages / sauvegarde ───────── */
export function Settings({ data, replace }: { data: Data; replace: (d: Data) => void }) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `malcom-notebook-${today()}.json`;
    a.click();
  };
  const importJson = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(String(r.result));
        if (!d.notes || !d.weeks) throw new Error();
        if (confirm("Remplacer tout le contenu actuel par cette sauvegarde ?")) replace(d);
      } catch { alert("Fichier invalide."); }
    };
    r.readAsText(f);
  };
  const reset = () => {
    if (!confirm("Tout effacer définitivement ?")) return;
    replace({ start: { name: "", date: today(), place: "", why: "", rows: Array.from({ length: 6 }, () => ({ loser: "", hero: "" })) }, notes: [], weeks: [] });
  };
  void blanks;
  return (
    <div className="page">
      <Header title="Sauvegarde" sub="Tes données restent sur ce téléphone" back="#/" />
      <div className="sheet">
        <p className="muted">Le carnet est enregistré localement. Exporte régulièrement un fichier de sauvegarde pour ne rien perdre (changement de téléphone, navigateur réinitialisé…).</p>
        <button className="cta" onClick={exportJson}>⬇ Exporter ma sauvegarde</button>
        <label className="cta alt">⬆ Importer une sauvegarde<input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} /></label>
        <button className="cta danger" onClick={reset}>Tout effacer</button>
        <p className="muted center">Astuce : sur iPhone, Safari → Partager → « Sur l'écran d'accueil » ; sur Android, menu → « Installer l'application ».</p>
      </div>
    </div>
  );
}

/* ───────── Prononciation (YouGlish) ───────── */
export function Say({ q }: { q: string }) {
  return (
    <div className="page">
      <header className="head">
        <button className="back" onClick={() => (history.length > 1 ? history.back() : go("#/"))} aria-label="Retour">‹</button>
        <div className="head-t"><h1>Prononciation</h1><p>Entends-le dans la vraie vie</p></div>
      </header>
      <Pronounce key={q} initial={q} />
      <a className="card" href="https://www.languagereactor.com/" target="_blank" rel="noreferrer">
        <div><h3>Language Reactor ↗</h3><p>Sous-titres interactifs sur YouTube et Netflix (extension Chrome sur ordinateur).</p></div>
      </a>
    </div>
  );
}
