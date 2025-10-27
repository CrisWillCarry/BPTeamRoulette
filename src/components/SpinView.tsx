import React, { useEffect, useRef, useState } from "react";
import type { Team } from "../objects/Team";

type Props = {
  teams: Team[];
  onFinish: (winner: Team) => void;
  className?: string;
};

function removeRandom<T>(arr: T[]) {
  if (arr.length === 0) return arr;
  const i = Math.floor(Math.random() * arr.length);
  return arr.slice(0, i).concat(arr.slice(i + 1));
}

export default function SpinView({ teams: initialTeams, onFinish, className = "" }: Props) {
  const [visible, setVisible] = useState<Team[]>([...initialTeams]);
  const [phase, setPhase] = useState<"shrink" | "merge" | "spin" | "done">("shrink");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winner, setWinner] = useState<Team | null>(null);

  const mounted = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimers();
    };
  }, []);

  // Phase 1: random removals until 3 remain
  useEffect(() => {
    clearTimers();
    if (!mounted.current) return;
    if (initialTeams.length <= 3) {
      setVisible(initialTeams.slice(0, 3));
      setPhase("merge");
      return;
    }

    setVisible([...initialTeams]);

    const toRemove = initialTeams.length - 3;
    let totalDelay = 0;
    for (let i = 0; i < toRemove; i++) {
      const delay = 180 + i * 60;
      totalDelay += delay;
      const id = window.setTimeout(() => {
        if (!mounted.current) return;
        setVisible((prev) => {
          if (prev.length <= 3) return prev;
          return removeRandom(prev);
        });
      }, totalDelay);
      timersRef.current.push(id);
    }

    // after removals, move to merge
    const t = window.setTimeout(() => {
      if (!mounted.current) return;
      setPhase("merge");
    }, totalDelay + 220);
    timersRef.current.push(t);

    return () => clearTimers();
  }, [initialTeams]);

  // Phase 2 -> small merge pause then spin phase
  useEffect(() => {
    if (phase !== "merge") return;
    clearTimers();
    const t = window.setTimeout(() => {
      if (!mounted.current) return;
      setPhase("spin");
    }, 500);
    timersRef.current.push(t);
    return () => clearTimers();
  }, [phase]);

  // Phase 3: spin among the 3 logos
  useEffect(() => {
    if (phase !== "spin") return;
    clearTimers();
    const pool = visible.slice(0, 3);
    if (pool.length === 0) {
      setPhase("done");
      return;
    }

    const finalIndex = Math.floor(Math.random() * pool.length);
    const steps = 30 + Math.floor(Math.random() * 30); // total steps before slowing to final
    const startDelay = 40;
    const endDelay = 300;

    // schedule a sequence of ticks with easing delays
    let cumulative = 0;
    for (let step = 0; step <= steps; step++) {
      const progress = step / steps;
      const delay = startDelay + Math.pow(progress, 2) * (endDelay - startDelay);
      cumulative += delay;
      const id = window.setTimeout(() => {
        if (!mounted.current) return;
        setCurrentIndex((s) => (s + 1) % pool.length);
      }, Math.floor(cumulative));
      timersRef.current.push(id);
    }

    // finishing sequence: a few extra ticks that slow down and end on finalIndex
    const extras = 6 + Math.floor(Math.random() * 6);
    for (let e = 0; e <= extras; e++) {
      const progress = (steps + e) / (steps + extras);
      const delay = startDelay + Math.pow(progress, 2) * (endDelay - startDelay);
      cumulative += delay;
      const id = window.setTimeout(() => {
        if (!mounted.current) return;
        setCurrentIndex((s) => (s + 1) % pool.length);
      }, Math.floor(cumulative));
      timersRef.current.push(id);
    }

    // final timeout: set winner and move to done, but DO NOT call onFinish automatically
    const finalDelay = cumulative + endDelay;
    const finalId = window.setTimeout(() => {
      if (!mounted.current) return;
      setCurrentIndex(finalIndex);
      const chosen = pool[finalIndex];
      setWinner(chosen);
      setPhase("done");
      // do not call onFinish here — user must confirm via button
    }, Math.floor(finalDelay));
    timersRef.current.push(finalId);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, visible]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${className}`} aria-live="polite">
      <div className="relative w-full max-w-4xl p-6">
        {phase === "shrink" && (
          <div className="grid grid-cols-6 gap-3 place-items-center">
            {visible.map((t, i) => (
              <img
                key={t.id + "-" + i}
                src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                alt={t.name}
                className="h-24 w-auto transition-opacity duration-200 ease-out"
              />
            ))}
          </div>
        )}

        {phase === "merge" && (
          <div className="flex items-center justify-center gap-6">
            {visible.slice(0, 3).map((t, i) => (
              <img
                key={t.id + "-" + i}
                src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                alt={t.name}
                className="h-28 w-auto transform transition-all duration-400 ease-out"
                style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }}
              />
            ))}
          </div>
        )}

        {phase === "spin" && visible.slice(0, 3).length > 0 && (
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
              {visible.slice(0, 3).map((t, i) => {
                const isActive = i === currentIndex;
                return (
                  <img
                    key={t.id + "-" + i}
                    src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                    alt={t.name}
                    className={`absolute transition-all duration-150 ease-out ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                    style={{
                      width: 220,
                      height: "auto",
                      zIndex: isActive ? 30 : 10,
                      filter: isActive ? "drop-shadow(0 10px 30px rgba(0,0,0,0.7))" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {phase === "done" && winner && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-white text-4xl font-bold">{winner.name}</div>

            <div className="relative">
              <img
                src={`/images/teams/${winner.name.replace(/ /g, "_")}.png`}
                alt={winner.name}
                className="h-64 w-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                clearTimers();
                onFinish(winner);
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium hover:cursor-pointer hover:scale-125 transition-all duration-150 ease-in-out"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}