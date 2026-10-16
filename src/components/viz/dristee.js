/**
 * Schematic DRISTEE navigation: a room as an occupancy grid, an A* path that
 * keeps clear of furniture, and the path turned into short spoken guidance.
 * Pure functions, no React.
 */
import { mulberry32 } from "@/three/core";

export const W = 40;
export const H = 19;
export const CELL_M = 0.25;
const WALL_X = 27;
const DOOR = [3, 6]; // rows [from, to) open in the interior wall

const KINDS = [
  ["chair", 3, 2],
  ["table", 5, 3],
  ["sofa", 6, 2],
  ["desk", 5, 2],
  ["bin", 2, 1],
  ["box", 2, 2],
];

export const FREE = 0, WALL = 1, OBJ = 2;

export function makeRoom(seed) {
  const rng = mulberry32(seed * 977 + 5);
  const grid = new Uint8Array(W * H);
  const at = (x, y) => y * W + x;
  for (let x = 0; x < W; x++) { grid[at(x, 0)] = WALL; grid[at(x, H - 1)] = WALL; }
  for (let y = 0; y < H; y++) {
    grid[at(0, y)] = WALL;
    grid[at(W - 1, y)] = WALL;
    if (y < DOOR[0] || y >= DOOR[1]) grid[at(WALL_X, y)] = WALL;
  }
  const user = [Math.floor(WALL_X / 2), H - 2];
  const objects = [];
  const fits = (x, y, w, h) => {
    if (x < 2 || y < 2 || x + w > W - 2 || y + h > H - 2) return false;
    if (x <= WALL_X + 1 && x + w >= WALL_X - 1) return false;
    if (Math.abs(x + w / 2 - user[0]) < w / 2 + 3 && y + h > H - 6) return false;
    if (x + w >= WALL_X - 4 && x <= WALL_X && y < DOOR[1] + 2) return false; // keep the door approach clear
    for (let j = y - 1; j < y + h + 1; j++) for (let i = x - 1; i < x + w + 1; i++) if (grid[at(i, j)] !== FREE) return false;
    return true;
  };
  const order = KINDS.slice().sort(() => rng() - 0.5);
  for (const [name, w, h] of order) {
    for (let tries = 0; tries < 200; tries++) {
      const x = 2 + Math.floor(rng() * (W - w - 3));
      const y = 2 + Math.floor(rng() * (H - h - 3));
      if (!fits(x, y, w, h)) continue;
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) grid[at(i, j)] = OBJ;
      objects.push({ name, x, y, w, h });
      break;
    }
  }
  // default goal: far corner of the other room, nudged to a free cell
  let goal = [W - 4, H - 3];
  for (let r = 0; r < 6 && grid[at(goal[0], goal[1])] !== FREE; r++) goal = [goal[0] - 1, goal[1] - 1];
  return { grid, objects, user, goal };
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/** 8-connected A*, no corner cutting, extra cost next to obstacles (soft inflation). */
export function astar(grid, start, goal) {
  const at = (x, y) => y * W + x;
  const blocked = (x, y) => x < 0 || y < 0 || x >= W || y >= H || grid[at(x, y)] !== FREE;
  if (blocked(goal[0], goal[1])) return null;
  const near = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (!blocked(x, y)) for (const [dx, dy] of DIRS) if (blocked(x + dx, y + dy)) { near[at(x, y)] = 1.5; break; }

  const g = new Float32Array(W * H).fill(Infinity);
  const from = new Int32Array(W * H).fill(-1);
  const closed = new Uint8Array(W * H);
  const h = (x, y) => {
    const dx = Math.abs(x - goal[0]), dy = Math.abs(y - goal[1]);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };
  const open = [[h(start[0], start[1]), at(start[0], start[1])]];
  g[at(start[0], start[1])] = 0;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, cur] = open.splice(bi, 1)[0];
    if (closed[cur]) continue;
    closed[cur] = 1;
    const cx = cur % W, cy = (cur / W) | 0;
    if (cx === goal[0] && cy === goal[1]) break;
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx, ny = cy + dy;
      if (blocked(nx, ny)) continue;
      if (dx && dy && (blocked(cx + dx, cy) || blocked(cx, cy + dy))) continue;
      const ni = at(nx, ny);
      const cost = g[cur] + (dx && dy ? Math.SQRT2 : 1) + near[ni];
      if (cost < g[ni]) {
        g[ni] = cost;
        from[ni] = cur;
        open.push([cost + h(nx, ny), ni]);
      }
    }
  }
  const end = at(goal[0], goal[1]);
  if (from[end] === -1 && end !== at(start[0], start[1])) return null;
  const path = [];
  for (let c = end; c !== -1; c = from[c]) path.push([c % W, (c / W) | 0]);
  return path.reverse();
}

function los(grid, a, b) {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 4);
  for (let s = 1; s < steps; s++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * s) / steps);
    const y = Math.round(a[1] + ((b[1] - a[1]) * s) / steps);
    if (grid[y * W + x] !== FREE) return false;
  }
  return true;
}

/** String-pull the grid path into straight legs. */
export function waypoints(grid, path) {
  if (!path || path.length < 2) return path || [];
  const out = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1 && !los(grid, path[i], path[j])) j--;
    out.push(path[j]);
    i = j;
  }
  return out;
}

const deg = (r) => (r * 180) / Math.PI;
const wrap = (a) => ((a + 540) % 360) - 180;

function side(turn) {
  const a = Math.abs(turn), dir = turn > 0 ? "right" : "left";
  if (a < 20) return "straight ahead";
  if (a < 65) return `ahead, slightly ${dir}`;
  if (a < 120) return `to your ${dir}`;
  return "behind you";
}

/** Turn waypoints into the kind of short instruction DRISTEE speaks. */
export function guidance(room, wps) {
  if (!wps || wps.length < 2) return "No path to that spot. Try another goal.";
  const heading0 = -90; // facing "up" the map; screen y grows downward, so +turn = right
  // closest obstacle in front of the user
  let hazard = null;
  for (const o of room.objects) {
    const cx = Math.max(o.x, Math.min(room.user[0], o.x + o.w - 1));
    const cy = Math.max(o.y, Math.min(room.user[1], o.y + o.h - 1));
    const d = Math.hypot(cx - room.user[0], cy - room.user[1]) * CELL_M;
    const turn = wrap(deg(Math.atan2(cy - room.user[1], cx - room.user[0])) - heading0);
    if (Math.abs(turn) < 70 && d < 3 && (!hazard || d < hazard.d)) hazard = { name: o.name, d, turn };
  }
  const steps = [];
  let heading = heading0, total = 0;
  for (let i = 0; i < wps.length - 1; i++) {
    const [ax, ay] = wps[i], [bx, by] = wps[i + 1];
    const ang = deg(Math.atan2(by - ay, bx - ax));
    const turn = wrap(ang - heading);
    const d = Math.hypot(bx - ax, by - ay) * CELL_M;
    total += d;
    const a = Math.abs(turn), dir = turn > 0 ? "right" : "left";
    const verb = a < 20 ? (i ? "continue" : "walk forward") : a < 65 ? `bear ${dir}` : a < 135 ? `turn ${dir}` : "turn around";
    steps.push(`${verb} ${d.toFixed(1)} m`);
    heading = ang;
  }
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const lead = hazard ? `${cap(hazard.name)} ${hazard.d.toFixed(1)} m ${side(hazard.turn)}. ` : "Path is clear. ";
  const shown = steps.slice(0, 3).join(", then ");
  return `${lead}${cap(shown)}${steps.length > 3 ? ", …" : "."} Goal in ${total.toFixed(1)} m.`;
}
