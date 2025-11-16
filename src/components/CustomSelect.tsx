import React, { useEffect, useRef, useState } from "react";
import { playClick, playHover } from "../classes/SoundManager";

type Option<T = string | number> = { label: string; value: T };

type Props<T = string | number> = {
  options: Option<T>[];
  value: T | "" ;
  onChange: (v: T | "") => void;
  placeholder?: string;
  className?: string;
};

export default function CustomSelect<T = number>({
  options,
  value,
  onChange,
  placeholder = "— select —",
  className = "",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(() =>
    value === "" ? 0 : Math.max(0, options.findIndex((o) => o.value === value))
  );
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    // keep highlight in bounds when options change
    setHighlight((h) => Math.max(0, Math.min(h, Math.max(0, options.length - 1))));
  }, [options]);

  const toggle = () => setOpen((s) => !s);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => {
        const next = Math.min(h + 1, options.length - 1);
        if (next !== h) playHover();
        return next;
      });
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => {
        const next = Math.max(h - 1, 0);
        if (next !== h) playHover();
        return next;
      });
      setOpen(true);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) {
        onChange(opt.value);
        playClick();
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { toggle(); playClick(); }}
        onMouseEnter={()=> playHover()}
        onKeyDown={handleKey}
        className="w-full p-2 sm:p-3 bg-black border border-gray-700 rounded text-center text-sm sm:text-base"
      >
        {value === "" ? placeholder : options.find((o) => o.value === value)?.label}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-activedescendant={`opt-${highlight}`}
          tabIndex={-1}
          className="absolute z-40 mt-1 w-full bg-black border border-gray-700 rounded shadow max-h-64 overflow-auto"
        >
          {options.map((opt, i) => (
            <li
              id={`opt-${i}`}
              role="option"
              key={String(opt.value) + "-" + i}
              aria-selected={value === opt.value}
              onMouseEnter={() => {
                setHighlight(i);
                playHover();
              }}
              onMouseMove={() => {
                // play again on repeated movement over different items
                if (i !== highlight) {
                  setHighlight(i);
                  playHover();
                }
              }}
              onClick={() => {
                onChange(opt.value);
                playClick();
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer select-none text-center ${
                i === highlight ? "bg-gray-800 text-white" : "text-gray-200"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}