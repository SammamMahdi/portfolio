import { useEffect, useMemo, useState } from "react";
import { mulberry32 } from "@/lib/rand";
import { useInView, useReducedMotion } from "@/hooks/useTerm";
import { Window } from "@/components/term/Term";
import { useCanvas2D, C, rgba } from "@/components/figs/canvas2d";

const N = 12;
const NAMES = "ABCDEFGHIJKL";

/** A small connected, weighted, planar-ish graph (MST + a few short extra edges). */
function makeGraph(seed) {
  const rng = mulberry32(seed * 131 + 7);
  const P = [];
  while (P.length < N) {
    const p = [0.07 + rng() * 0.86, 0.12 + rng() * 0.78];
    if (P.every((q) => Math.hypot((q[0] - p[0]) * 1.6, q[1] - p[1]) > 0.2)) P.push(p);
  }
  const d = (a, b) => Math.hypot((P[a][0] - P[b][0]) * 1.6, P[a][1] - P[b][1]);
  const E = new Map();
  const add = (a, b) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!E.has(k)) E.set(k, [Math.min(a, b), Math.max(a, b), Math.max(1, Math.min(9, Math.round(d(a, b) * 9)))]);
  };
  // Prim's MST keeps it connected
  const inT = new Set([0]);
  while (inT.size < N) {
    let best = null;
    for (const a of inT) for (let b = 0; b < N; b++) if (!inT.has(b) && (!best || d(a, b) < best[2])) best = [a, b, d(a, b)];
    add(best[0], best[1]);
    inT.add(best[1]);
  }
  // plus each node's nearest non-tree neighbour, for cycles
  for (let a = 0; a < N; a++) {
    const near = [...Array(N).keys()].filter((b) => b !== a).sort((x, y) => d(a, x) - d(a, y));
    if (rng() < 0.7) add(a, near[1]);
  }
  const edges = [...E.values()];
  const adj = Array.from({ length: N }, () => []);
  edges.forEach(([a, b, w]) => {
    adj[a].push([b, w]);
    adj[b].push([a, w]);
  });
  adj.forEach((l) => l.sort((x, y) => x[0] - y[0]));
  return { P, edges, adj };
}

/** Each algorithm yields frames: what the visitor sees after every step. */
function run(algo, g, src) {
  const frames = [];
  const visited = new Set(), parent = new Map(), dist = new Array(N).fill(Infinity);
  if (algo === "dijkstra") {
    dist[src] = 0;
    const pq = [[0, src]];
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [du, u] = pq.shift();
      if (visited.has(u) || du > dist[u]) continue;
      visited.add(u);
      for (const [v, w] of g.adj[u]) {
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          parent.set(v, u);
          pq.push([dist[v], v]);
        }
      }
      frames.push({ cur: u, visited: new Set(visited), parent: new Map(parent), dist: [...dist], ds: pq.filter(([d2, x]) => !visited.has(x) && d2 === dist[x]).sort((a, b) => a[0] - b[0]).map(([d2, x]) => `${NAMES[x]}:${d2}`) });
    }
    return frames;
  }
  const ds = [src];
  const seen = new Set([src]);
  while (ds.length) {
    const u = algo === "bfs" ? ds.shift() : ds.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    const next = algo === "bfs" ? g.adj[u] : [...g.adj[u]].reverse();
    for (const [v] of next) {
      if (algo === "bfs" ? !seen.has(v) : !visited.has(v)) {
        if (algo === "bfs") seen.add(v);
        if (!parent.has(v) && v !== src) parent.set(v, u);
        if (algo === "dfs" && !visited.has(v)) parent.set(v, u);
        ds.push(v);
      }
    }
    frames.push({ cur: u, visited: new Set(visited), parent: new Map(parent), ds: ds.filter((x) => !visited.has(x)).map((x) => NAMES[x]) });
  }
  return frames;
}

const LABEL = { bfs: "BFS · queue", dfs: "DFS · stack", dijkstra: "Dijkstra · priority queue" };

export default function AlgoPlayground() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ once: false, rootMargin: "0px" });
  const [seed, setSeed] = useState(2);
  const [algo, setAlgo] = useState("bfs");
  const [src, setSrc] = useState(0);
  const [target, setTarget] = useState(null);
  const [step, setStep] = useState(reduced ? 999 : 0);
  const [playing, setPlaying] = useState(!reduced);
  const g = useMemo(() => makeGraph(seed), [seed]);
  const frames = useMemo(() => run(algo, g, src), [algo, g, src]);
  const k = Math.min(step, frames.length - 1);
  const f = frames[k];
  const done = step >= frames.length - 1;

  useEffect(() => {
    if (!playing || !inView || done) return;
    const id = setTimeout(() => setStep((s) => s + 1), 750);
    return () => clearTimeout(id);
  }, [playing, inView, done, step]);

  const restart = (patch = {}) => {
    if (patch.algo) setAlgo(patch.algo);
    if (patch.src != null) setSrc(patch.src);
    if (patch.seed) setSeed(patch.seed);
    setTarget(null);
    setStep(0);
    setPlaying(!reduced);
  };

  // shortest path to the clicked target (Dijkstra, once finished)
  const path = useMemo(() => {
    if (algo !== "dijkstra" || !done || target == null) return null;
    const out = [];
    for (let v = target; v !== undefined && v !== src; v = f.parent.get(v)) out.push([f.parent.get(v), v]);
    return out;
  }, [algo, done, target, f, src]);

  const canvas = useCanvas2D((ctx, { w, h, t }) => {
    const G = g, F = f, S = src, T = target, A = algo;
    const X = (p) => p[0] * w, Y = (p) => p[1] * h;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    const onPath = new Set((path || []).map(([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`)));
    const tree = new Set([...F.parent.entries()].filter(([v]) => F.visited.has(v)).map(([v, u]) => (u < v ? `${u}-${v}` : `${v}-${u}`)));
    ctx.font = `10px ${C.font}`;
    for (const [a, b, wgt] of G.edges) {
      const key = `${a}-${b}`;
      ctx.strokeStyle = onPath.has(key) ? C.hi : tree.has(key) ? C.amber : C.line;
      ctx.lineWidth = onPath.has(key) ? 3 : tree.has(key) ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(X(G.P[a]), Y(G.P[a]));
      ctx.lineTo(X(G.P[b]), Y(G.P[b]));
      ctx.stroke();
      if (A === "dijkstra") {
        const mx = (X(G.P[a]) + X(G.P[b])) / 2, my = (Y(G.P[a]) + Y(G.P[b])) / 2;
        ctx.fillStyle = C.bg;
        ctx.fillRect(mx - 6, my - 7, 12, 12);
        ctx.fillStyle = tree.has(key) ? C.amber : C.faint;
        ctx.fillText(String(wgt), mx - 3, my + 3);
      }
    }
    ctx.lineWidth = 1;
    const frontier = new Set(F.ds.map((s) => NAMES.indexOf(s[0])));
    G.P.forEach((p, i) => {
      const x = X(p), y = Y(p), cur = i === F.cur, vis = F.visited.has(i), fr = frontier.has(i);
      if (cur) {
        ctx.fillStyle = rgba(C.hi, 0.18 + 0.12 * Math.sin(t * 6));
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = C.bg;
      ctx.strokeStyle = cur ? C.hi : vis ? C.amber : fr ? C.alert : C.faint;
      ctx.lineWidth = cur || i === S ? 2 : 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (vis) {
        ctx.fillStyle = rgba(C.amber, 0.25);
        ctx.fill();
      }
      ctx.fillStyle = cur ? C.hi : vis ? C.text : C.dim;
      ctx.font = `600 11px ${C.font}`;
      ctx.fillText(NAMES[i], x - 3.5, y + 4);
      if (A === "dijkstra" && F.dist[i] < Infinity) {
        ctx.font = `10px ${C.font}`;
        ctx.fillStyle = C.hi;
        ctx.fillText(`d=${F.dist[i]}`, x + 14, y - 10);
      }
      if (i === T) {
        ctx.strokeStyle = C.hi;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.lineWidth = 1;
  });

  const click = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    let best = -1, bd = 0.05;
    g.P.forEach((p, i) => {
      const dd = Math.hypot((p[0] - x) * (r.width / r.height), p[1] - y);
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    });
    if (best < 0) return;
    if (algo === "dijkstra" && done && best !== src) setTarget(best);
    else restart({ src: best });
  };

  return (
    <Window
      title="graph.alg"
      className="mt-5"
      right={
        <div role="tablist" aria-label="Algorithm" className="flex flex-wrap gap-1">
          {["bfs", "dfs", "dijkstra"].map((a) => (
            <button key={a} type="button" role="tab" aria-selected={algo === a} className="btn-term is-sm" onClick={() => restart({ algo: a })}>
              {a}
            </button>
          ))}
        </div>
      }
    >
      <div ref={ref} className="grid md:grid-cols-[1fr_15rem]">
        <div className="relative h-[300px] cursor-pointer sm:h-[320px]" onClick={click}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-label="Graph traversal visualisation. Click a node to start from it." />
        </div>
        <div className="border-t border-[var(--t-line)] p-3 text-[0.76rem] md:border-l md:border-t-0">
          <div className="text-[0.65rem] uppercase tracking-[0.14em] t-dim">{LABEL[algo]}</div>
          <div className="mt-1 flex min-h-[1.6rem] flex-wrap gap-1">
            {f.ds.length ? f.ds.map((x, i) => <span key={i} className="chip is-on">{x}</span>) : <span className="t-faint">empty</span>}
          </div>
          <div className="mt-3 text-[0.65rem] uppercase tracking-[0.14em] t-dim">visit order</div>
          <div className="mt-1 break-all t-text">
            {frames.slice(0, k + 1).map((fr) => NAMES[fr.cur]).join(" → ")}
          </div>
          {algo === "dijkstra" && done && (
            <div className="mt-3 t-dim">
              {target == null ? (
                "Click any node to see its shortest path."
              ) : (
                <span>
                  {NAMES[src]} → {NAMES[target]}: <span className="t-hi">cost {f.dist[target]}</span>
                </span>
              )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-1">
            <button type="button" className="btn-term is-sm" onClick={() => setPlaying((p) => !p)} disabled={done}>
              {playing && !done ? "❚❚ pause" : "▶ play"}
            </button>
            <button type="button" className="btn-term is-sm" onClick={() => { setPlaying(false); setStep((s) => Math.min(frames.length - 1, s + 1)); }} disabled={done}>
              step
            </button>
            <button type="button" className="btn-term is-sm" onClick={() => restart()}>
              ↺
            </button>
            <button type="button" className="btn-term is-sm" onClick={() => restart({ seed: seed + 1, src: 0 })}>
              new graph
            </button>
          </div>
          <p className="mt-3 text-[0.68rem] t-faint">Click a node to start from it. From the course I TA’d: Data Structures &amp; Algorithms.</p>
        </div>
      </div>
    </Window>
  );
}
