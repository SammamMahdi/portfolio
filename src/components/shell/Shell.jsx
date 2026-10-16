import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTerm } from "@/components/term/termStore";
import { isTyping, scrollToSection } from "@/hooks/useTerm";
import { run, complete } from "./commands";

const GREETING = [
  ["sammam shell — type `help` to see what it can do.", "t-dim"],
];

/** Drop-down console, toggled with the backtick key or the top-bar button. */
export function Shell() {
  const { shellOpen, setShellOpen, toggleShell, setCrt, theme, setTheme } = useTerm();
  const navigate = useNavigate();
  const [log, setLog] = useState(GREETING);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const openerRef = useRef(null);

  const close = useCallback(() => setShellOpen(false), [setShellOpen]);

  // ` toggles from anywhere except other text fields
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "`" && e.key !== "~") return;
      if (isTyping(document.activeElement) && document.activeElement !== inputRef.current) return;
      e.preventDefault();
      toggleShell();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleShell]);

  useEffect(() => {
    if (shellOpen) {
      openerRef.current = document.activeElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (openerRef.current?.focus) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [shellOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [log]);

  const submit = (e) => {
    e.preventDefault();
    const line = input;
    const hist = line.trim() ? [...history, line.trim()] : history;
    let cleared = false;
    const ctx = {
      navigate,
      close,
      setCrt,
      theme,
      setTheme,
      history: hist,
      clear: () => (cleared = true),
      scrollTo: (id) => {
        if (window.location.pathname !== "/") navigate(`/#${id}`);
        else scrollToSection(id);
      },
    };
    const out = run(line, ctx);
    setLog((l) => (cleared ? [] : [...l, [`$ ${line}`, "t-text"], ...out]));
    setHistory(hist);
    setCursor(-1);
    setInput("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const c = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(c);
      setInput(history[c]);
    } else if (e.key === "ArrowDown" && cursor >= 0) {
      e.preventDefault();
      const c = cursor + 1;
      if (c >= history.length) {
        setCursor(-1);
        setInput("");
      } else {
        setCursor(c);
        setInput(history[c]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { hits, apply } = complete(input);
      if (hits.length === 1) setInput(apply(hits[0]));
      else if (hits.length > 1) setLog((l) => [...l, [`$ ${input}`, "t-text"], [hits.join("  "), "t-dim"]]);
    }
  };

  if (!shellOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Shell"
      className="fixed inset-x-0 top-0 z-[55] md:top-[10px]"
      style={{ animation: "rise 0.18s ease-out both" }}
    >
      <div className="container pt-14">
        <div className="term-window shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]">
          <div className="term-bar">
            <span className="term-title">shell</span>
            <span className="hidden sm:inline">/home/sammam</span>
            <button type="button" onClick={close} className="btn-term is-sm ml-auto">
              esc
            </button>
          </div>
          <div
            className="h-[min(52vh,30rem)] overflow-y-auto bg-[var(--t-deep)] p-4 text-[0.82rem] leading-relaxed"
            onClick={() => inputRef.current?.focus()}
          >
            <div aria-live="polite">
              {log.map((l, i) => {
                const [text, cls] = Array.isArray(l) ? l : [l, ""];
                return (
                  <div key={i} className={`whitespace-pre-wrap break-words ${cls || "t-text"}`}>
                    {text || " "}
                  </div>
                );
              })}
            </div>
            <form onSubmit={submit} className="mt-1 flex items-center gap-2">
              <label htmlFor="shell-input" className="shrink-0">
                <span className="t-amber">sammam</span>
                <span className="t-faint">:~$</span>
              </label>
              <input
                id="shell-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[var(--t-hi)] caret-[var(--t-amber)] outline-none"
              />
            </form>
            <div ref={endRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
