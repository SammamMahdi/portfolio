import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStage } from "@/three/useStage";
import { useReducedMotion } from "@/hooks/useTerm";
import { Window } from "@/components/term/Term";
import { mulberry32 } from "@/lib/rand";

/* ── helpers ─────────────────────────────────────────────────────────── */
const DAY = 864e5;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function getCookie(name) {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function readPin() {
  try {
    return sessionStorage.getItem("analytics_pin") || "";
  } catch {
    return "";
  }
}

function ago(d) {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 90) return "just now";
  if (s < 5400) return `${Math.round(s / 60)} min ago`;
  if (s < 129600) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

/** Bars as SVG: values with optional labels, a max line and hover titles. */
function Bars({ values, labels, titles, height = 110, hi = -1 }) {
  const max = Math.max(1, ...values);
  const W = 100 / values.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="block w-full" style={{ height }} role="img">
      {values.map((v, i) => {
        const h = (v / max) * (height - 14);
        return (
          <rect
            key={i}
            x={i * W + W * 0.12}
            y={height - 12 - h}
            width={W * 0.76}
            height={Math.max(v ? 1 : 0.4, h)}
            fill={i === hi ? "var(--t-hi)" : v ? "var(--t-amber)" : "var(--t-line)"}
            opacity={v ? 0.9 : 1}
          >
            <title>{titles ? titles[i] : `${labels?.[i] ?? i}: ${v}`}</title>
          </rect>
        );
      })}
      <line x1="0" x2="100" y1={height - 11.5} y2={height - 11.5} stroke="var(--t-line)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Local-development preview only: ~6 months of plausible visits, clearly labelled as sample data. */
function sampleVisits() {
  const rng = mulberry32(42);
  const out = [];
  for (let i = 0; i < 420; i++) {
    const at = new Date(Date.now() - Math.floor(Math.pow(rng(), 1.7) * 180) * DAY);
    at.setHours(Math.floor(8 + rng() * 15) % 24, Math.floor(rng() * 60));
    if (at > new Date()) continue;
    out.push({ _id: `demo-${i}`, visitorId: `demo-${Math.floor(rng() * 1e9).toString(16)}`, at });
  }
  return out.sort((a, b) => b.at - a.at);
}

function Kpi({ k, v, sub }) {
  return (
    <div className="border-b border-r border-[var(--t-line)] px-4 py-3">
      <div className="text-[0.65rem] uppercase tracking-[0.16em] t-dim">{k}</div>
      <div className="font-display text-[2.6rem] leading-none t-hi glow">{v}</div>
      {sub && <div className="mt-1 text-[0.68rem] t-dim">{sub}</div>}
    </div>
  );
}

/* ── 3D skyline ──────────────────────────────────────────────────────── */
function Skyline({ days }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(null);
  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) =>
    import("@/three/SkylineScene").then(({ SkylineScene }) => new SkylineScene(canvas, { reducedMotion: reduced, onHover: setHover }))
  );
  useEffect(() => {
    stageRef.current?.setData(days);
  }, [days, status, stageRef]);
  return (
    <div ref={wrapRef} className="relative h-[320px] bg-[var(--t-deep)] sm:h-[380px]">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="3D skyline of visits per day over the last 26 weeks. Drag to orbit."
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
      />
      <div className="pointer-events-none absolute left-3 top-2 text-[0.65rem] uppercase tracking-[0.16em] t-dim">
        26 weeks · one bar per day · drag to orbit
      </div>
      <div className="pointer-events-none absolute bottom-2 left-3 text-[0.75rem]">
        {hover ? (
          <span className="t-hi">
            {WEEKDAYS[hover.weekday]} {hover.date} · {hover.count} visit{hover.count === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="t-faint">hover a bar</span>
        )}
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────── */
export default function Analytics() {
  const [pin, setPin] = useState(readPin);
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [tries, setTries] = useState(0);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(30);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(50);
  const [confirm, setConfirm] = useState("");
  const [showDanger, setShowDanger] = useState(false);
  const [offline, setOffline] = useState(false);
  const [demo, setDemo] = useState(false);

  const api = useCallback(
    (path, opts = {}) => fetch(path, { ...opts, headers: { ...(opts.headers || {}), "x-analytics-pin": pin } }),
    [pin]
  );

  const logout = useCallback((msg = "") => {
    try {
      sessionStorage.removeItem("analytics_pin");
    } catch {
      /* ignore */
    }
    setPin("");
    setRows(null);
    setAuthError(msg);
  }, []);

  // load (and, as before, drop the admin's own most recent visit so it doesn't count)
  const load = useCallback(async () => {
    if (!pin || demo) return;
    setLoading(true);
    setOffline(false);
    try {
      const res = await api("/api/visitor-analytics");
      // Under `vite` (local dev) /api isn't executed: the dev server returns the function's source instead of JSON.
      if (!(res.headers.get("content-type") || "").includes("application/json")) {
        setOffline(true);
        setRows(null);
        return;
      }
      if (res.status === 401) return logout("Sorry, try again.");
      if (res.status === 503) return logout("server: ANALYTICS_PIN is not set — add it to the deployment's environment variables.");
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      let visits = data.visits
        .map((v) => ({ ...v, at: new Date(v.lastVisit || v.timestamp) }))
        .filter((v) => !isNaN(v.at.getTime()));
      const me = getCookie("unique_visitor_id");
      const mine = visits.filter((v) => v.visitorId === me).sort((a, b) => b.at - a.at)[0];
      if (mine) {
        const del = await api("/api/delete-visitor", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: mine._id }),
        });
        if (del.ok) visits = visits.filter((v) => v._id !== mine._id);
      }
      setRows(visits.sort((a, b) => b.at - a.at));
    } catch {
      setOffline(true);
      setRows(null);
    } finally {
      setLoading(false);
    }
  }, [api, pin, logout, demo]);

  const previewDemo = () => {
    setDemo(true);
    setOffline(false);
    setRows(sampleVisits());
  };

  useEffect(() => {
    load();
  }, [load]);

  const submit = (e) => {
    e.preventDefault();
    if (!input) return;
    try {
      sessionStorage.setItem("analytics_pin", input);
    } catch {
      /* ignore */
    }
    setTries((t) => t + 1);
    setAuthError("");
    setPin(input);
    setInput("");
  };

  const removeOne = async (_id) => {
    if (demo) return setRows((r) => r.filter((v) => v._id !== _id)); // sample data: local only
    const res = await api("/api/delete-visitor", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    if (res.ok) setRows((r) => r.filter((v) => v._id !== _id));
  };

  const removeAll = async () => {
    const res = demo ? { ok: true } : await api("/api/delete-visitors", { method: "DELETE" });
    if (res.ok) {
      setRows([]);
      setShowDanger(false);
      setConfirm("");
    }
  };

  /* ── derived ── */
  const stats = useMemo(() => {
    if (!rows) return null;
    const today = startOfDay(new Date());
    const byDay = new Map();
    const hours = new Array(24).fill(0), weekdays = new Array(7).fill(0);
    rows.forEach((v) => {
      const k = ymd(v.at);
      byDay.set(k, (byDay.get(k) || 0) + 1);
      hours[v.at.getHours()]++;
      weekdays[v.at.getDay()]++;
    });
    const within = (n) => rows.filter((v) => v.at >= new Date(today.getTime() - (n - 1) * DAY)).length;
    // skyline: 26 full weeks ending this week
    const start = new Date(today.getTime() - (today.getDay() + 25 * 7) * DAY);
    const sky = [];
    for (let d = new Date(start); d <= today; d = new Date(d.getTime() + DAY)) {
      const i = Math.round((d - start) / DAY);
      sky.push({ date: ymd(d), count: byDay.get(ymd(d)) || 0, week: Math.floor(i / 7), weekday: d.getDay() });
    }
    const peak = hours.indexOf(Math.max(...hours));
    return { byDay, hours, weekdays, sky, today: within(1), week: within(7), month: within(30), peak };
  }, [rows]);

  const timeline = useMemo(() => {
    if (!stats || !rows) return null;
    const today = startOfDay(new Date());
    const span = range === 0 ? Math.max(1, Math.ceil((today - startOfDay(rows[rows.length - 1]?.at || today)) / DAY) + 1) : range;
    const days = [];
    for (let i = span - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY);
      days.push([ymd(d), stats.byDay.get(ymd(d)) || 0]);
    }
    return days;
  }, [stats, rows, range]);

  const filtered = useMemo(
    () => (rows || []).filter((v) => (!from || ymd(v.at) >= from) && (!to || ymd(v.at) <= to)),
    [rows, from, to]
  );

  /* ── views ── */
  if (!pin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <form onSubmit={submit} className="w-full max-w-md text-sm">
          <p className="font-display text-5xl t-hi glow-strong">ANALYTICS</p>
          <p className="mt-4 t-text">
            <span className="t-amber">sammam</span>
            <span className="t-faint">:~$ </span>sudo analytics
          </p>
          <label className="mt-1 flex items-center gap-2 t-text">
            [sudo] password for sammam:
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              aria-label="Analytics PIN"
              className="min-w-0 flex-1 border-0 border-b border-[var(--t-faint)] bg-transparent px-1 text-[var(--t-hi)] outline-none focus:border-[var(--t-amber)]"
            />
          </label>
          {authError && <p className="mt-2 t-alert">{authError}</p>}
          {tries >= 3 && authError.startsWith("Sorry") && <p className="t-dim">sudo: {tries} incorrect password attempts</p>}
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-term is-primary">
              authenticate ⏎
            </button>
            <Link to="/" className="btn-term">
              cd ~
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="container py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm t-dim">
            <span className="t-amber">sammam</span>
            <span className="t-faint">:~# </span>analytics --live
          </p>
          <h1 className="mt-2 font-display text-[3.4rem] uppercase leading-none t-hi glow-strong md:text-[4.4rem]">Visitors</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-term is-sm" onClick={load} disabled={loading}>
            {loading ? "loading…" : "↻ refresh"}
          </button>
          <button type="button" className="btn-term is-sm" onClick={() => logout()}>
            logout
          </button>
          <Link to="/" className="btn-term is-sm is-primary">
            cd ~
          </Link>
        </div>
      </header>

      {authError && <p className="mb-6 text-sm t-alert">{authError}</p>}
      {demo && (
        <p className="mb-6 border border-dashed border-[var(--t-alert)] px-3 py-2 text-sm t-alert">
          DEMO — sample visits generated in your browser for local development. None of this is real, and deletes only
          change this preview.
        </p>
      )}

      {offline ? (
        <Window title="api offline" bodyClassName="p-5 text-sm leading-relaxed">
          <p className="m-0 t-text">The analytics API isn’t running here.</p>
          <p className="mt-2 t-dim">
            The <span className="t-hi">/api</span> functions are Vercel serverless functions. They run on the deployed site
            (or locally with <span className="t-hi">vercel dev</span>, with <span className="t-hi">MONGODB_URI</span> and{" "}
            <span className="t-hi">ANALYTICS_PIN</span> set). The plain <span className="t-hi">vite</span> dev server only
            serves their source files, so there is no data to show.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-term is-sm" onClick={load}>
              ↻ retry
            </button>
            {import.meta.env.DEV && (
              <button type="button" className="btn-term is-sm is-primary" onClick={previewDemo}>
                preview with sample data
              </button>
            )}
          </div>
        </Window>
      ) : !stats ? (
        <p className="text-sm t-dim">
          loading<span className="cursor" aria-hidden="true" />
        </p>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-2 border-l border-t border-[var(--t-line)] sm:grid-cols-3 lg:grid-cols-6">
            <Kpi k="all time" v={rows.length} sub="visitor records" />
            <Kpi k="today" v={stats.today} />
            <Kpi k="7 days" v={stats.week} />
            <Kpi k="30 days" v={stats.month} />
            <Kpi k="peak hour" v={rows.length ? `${pad(stats.peak)}h` : "—"} sub="local time" />
            <Kpi k="last visit" v={rows[0] ? ago(rows[0].at) : "—"} />
          </section>

          <div className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Window title="skyline.3d">
              <Skyline days={stats.sky} />
            </Window>
            <div className="grid content-start gap-6">
              <Window title="hour-of-day" bodyClassName="p-4">
                <Bars values={stats.hours} labels={stats.hours.map((_, i) => `${pad(i)}:00`)} hi={stats.peak} />
                <div className="mt-1 flex justify-between text-[0.65rem] t-faint">
                  <span>00</span>
                  <span>06</span>
                  <span>12</span>
                  <span>18</span>
                  <span>23</span>
                </div>
              </Window>
              <Window title="weekday" bodyClassName="p-4">
                <Bars values={stats.weekdays} labels={WEEKDAYS} height={90} />
                <div className="mt-1 grid grid-cols-7 text-center text-[0.65rem] t-faint">
                  {WEEKDAYS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </Window>
            </div>
          </div>

          <Window
            title="timeline"
            className="mb-6"
            bodyClassName="p-4"
            right={
              <div className="flex gap-1">
                {[
                  [30, "30d"],
                  [90, "90d"],
                  [365, "1y"],
                  [0, "all"],
                ].map(([n, l]) => (
                  <button key={l} type="button" className="btn-term is-sm" aria-pressed={range === n} onClick={() => setRange(n)}>
                    {l}
                  </button>
                ))}
              </div>
            }
          >
            <Bars values={timeline.map(([, c]) => c)} titles={timeline.map(([d, c]) => `${d}: ${c}`)} height={130} />
            <div className="mt-1 flex justify-between text-[0.68rem] t-faint">
              <span>{timeline[0]?.[0]}</span>
              <span>
                {timeline.reduce((s, [, c]) => s + c, 0)} visits in range · max {Math.max(0, ...timeline.map(([, c]) => c))}/day
              </span>
              <span>{timeline[timeline.length - 1]?.[0]}</span>
            </div>
          </Window>

          <Window
            title="tail -f visitors.log"
            className="mb-6"
            right={
              <div className="flex flex-wrap items-center gap-2 text-[0.7rem] normal-case tracking-normal">
                <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="border border-[var(--t-faint)] bg-transparent px-1 text-[var(--t-text)] [color-scheme:dark]" />
                <span className="t-faint">→</span>
                <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="border border-[var(--t-faint)] bg-transparent px-1 text-[var(--t-text)] [color-scheme:dark]" />
                {(from || to) && (
                  <button type="button" className="btn-term is-sm" onClick={() => { setFrom(""); setTo(""); }}>
                    clear
                  </button>
                )}
              </div>
            }
          >
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full border-collapse text-left text-[0.8rem] tabular-nums">
                <thead className="sticky top-0 bg-[var(--t-panel)]">
                  <tr className="text-[0.65rem] uppercase tracking-[0.14em] t-dim">
                    <th className="px-4 py-2 font-normal">date</th>
                    <th className="px-2 py-2 font-normal">time</th>
                    <th className="px-2 py-2 font-normal">visitor</th>
                    <th className="px-4 py-2 text-right font-normal">rm</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center t-dim">
                        no visits in this range
                      </td>
                    </tr>
                  )}
                  {filtered.slice(0, limit).map((v) => (
                    <tr key={v._id} className="border-t border-[var(--t-line)] hover:bg-[var(--t-ghost)]">
                      <td className="px-4 py-1.5 t-text">{ymd(v.at)}</td>
                      <td className="px-2 py-1.5 t-dim">{v.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-2 py-1.5 t-faint" title={v.visitorId}>
                        {String(v.visitorId).slice(0, 8)}…
                      </td>
                      <td className="px-4 py-1.5 text-right">
                        <button type="button" className="t-faint hover:text-[var(--t-alert)]" onClick={() => removeOne(v._id)} aria-label="Delete this record">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > limit && (
              <div className="border-t border-[var(--t-line)] px-4 py-2">
                <button type="button" className="btn-term is-sm" onClick={() => setLimit((l) => l + 100)}>
                  show more ({filtered.length - limit} left)
                </button>
              </div>
            )}
          </Window>

          <section className="border border-dashed border-[var(--t-faint)] p-4 text-sm">
            {!showDanger ? (
              <button type="button" className="btn-term is-sm" onClick={() => setShowDanger(true)}>
                danger zone…
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="t-alert">rm -rf visitors/*</span>
                <span className="t-dim">type DELETE to wipe all {rows.length} records:</span>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-label="Type DELETE to confirm"
                  className="w-28 border border-[var(--t-faint)] bg-transparent px-2 py-1 text-[var(--t-hi)] outline-none focus:border-[var(--t-alert)]"
                />
                <button type="button" className="btn-term is-sm" disabled={confirm !== "DELETE"} onClick={removeAll}>
                  wipe
                </button>
                <button type="button" className="btn-term is-sm" onClick={() => { setShowDanger(false); setConfirm(""); }}>
                  cancel
                </button>
              </div>
            )}
          </section>

          <p className="mt-6 text-[0.72rem] t-faint">
            A record is one browser: the visitor cookie lasts 24 h and each visit updates that browser’s last-seen time,
            so counts approximate unique browsers per day. Your own latest visit is removed when you open this page.
          </p>
        </>
      )}
    </main>
  );
}
