"use client";
import { useEffect, useRef, useState } from "react";

const COLORS = ["#1e1b4b", "#4338ca", "#f59e0b", "#e11d48", "#059669", "#0ea5e9"];

export default function Drawing({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[1]);
  const [eraser, setEraser] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };
  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    ref.current!.setPointerCapture(e.pointerId);
    move(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = eraser ? "#fff" : color;
    ctx.lineWidth = eraser ? 22 : 4;
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current!.toDataURL("image/jpeg", 0.7));
  };
  const clear = () => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    onChange("");
  };

  return (
    <div className="draw">
      <canvas ref={ref} width={640} height={400} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      <div className="draw-tools">
        {COLORS.map((c) => (
          <button key={c} className={"dot" + (!eraser && color === c ? " on" : "")} style={{ background: c }} onClick={() => { setColor(c); setEraser(false); }} aria-label={c} />
        ))}
        <button className={"chip" + (eraser ? " on" : "")} onClick={() => setEraser(!eraser)}>Gomme</button>
        <button className="chip" onClick={clear}>Effacer</button>
      </div>
    </div>
  );
}
