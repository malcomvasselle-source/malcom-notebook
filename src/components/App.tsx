"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Home, Notes, NoteEditor, Say, Settings, StartDoc, WeekEditor, Weeks } from "./screens";

export default function App() {
  const { data, ready, update, replace } = useStore();
  const [hash, setHash] = useState("#/");
  useEffect(() => {
    const on = () => { setHash(location.hash || "#/"); window.scrollTo(0, 0); };
    on();
    addEventListener("hashchange", on);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => removeEventListener("hashchange", on);
  }, []);
  if (!ready) return null;

  const [, route, arg] = hash.split("/");
  let view;
  switch (route) {
    case "start": view = <StartDoc data={data} update={update} />; break;
    case "notes": view = <Notes data={data} />; break;
    case "note": view = <NoteEditor key={arg} id={arg} data={data} update={update} />; break;
    case "weeks": view = <Weeks data={data} update={update} />; break;
    case "week": view = <WeekEditor key={arg} id={arg} data={data} update={update} />; break;
    case "say": view = <Say q={decodeURIComponent(arg ?? "")} />; break;
    case "settings": view = <Settings data={data} replace={replace} />; break;
    default: view = <Home data={data} />;
  }
  const tab = (r: string, label: string, icon: string, active: boolean) => (
    <a href={`#/${r}`} className={active ? "on" : ""}><span>{icon}</span>{label}</a>
  );
  return (
    <>
      {view}
      <nav className="tabs">
        {tab("", "Accueil", "🏠", !route)}
        {tab("start", "Départ", "🎯", route === "start")}
        {tab("notes", "Notebook", "✍️", route === "notes" || route === "note")}
        {tab("weeks", "Semaines", "📈", route === "weeks" || route === "week")}
        {tab("settings", "Backup", "💾", route === "settings")}
      </nav>
    </>
  );
}
