/**
 * The skills graph: skill areas linked to the work that used them. Each link
 * follows the work's own description in portfolio.js (e.g. "MediaPipe hand
 * landmarks" → landmarks; "tuned for calibration" → uncertainty).
 */
import { publications, projects } from "./portfolio";

export const AREAS = [
  ["3d", "3D vision"],
  ["unc", "uncertainty"],
  ["det", "object detection"],
  ["lmk", "face & hand landmarks"],
  ["ml", "classical ML"],
  ["xai", "explainable AI"],
  ["seq", "sequence models"],
  ["llm", "LLM / VLM agents"],
  ["edge", "edge AI · Jetson"],
  ["rob", "robotics · ROS"],
  ["health", "healthcare"],
  ["assist", "assistive tech"],
  ["foren", "media forensics"],
  ["web", "web · MERN · PHP"],
  ["gfx", "3D graphics"],
  ["sys", "systems · C"],
  ["emb", "embedded"],
];

const USES = {
  revar3r: ["3d", "unc"],
  camdet: ["3d", "det", "edge"],
  "stroke-detection": ["lmk", "ml", "xai", "health"],
  "gesture-keyboard": ["lmk", "seq", "assist"],
  "sleep-4stage": ["ml", "xai", "health"],
  "sleep-stage-ml": ["ml", "health"],
  "icea-deepfake": ["foren"],
  "edge-agent": ["llm", "edge", "assist"],
  dristee: ["3d", "det", "llm", "assist"],
  "cervical-cancer": ["health", "edge", "unc"],
  weheal: ["web", "health", "llm"],
  skillwise: ["web", "lmk"],
  "journaling-fs": ["sys"],
  "die-again": ["gfx", "web"],
  "matrimonial-hub": ["web"],
  librobot: ["emb", "rob"],
  rover: ["rob", "det", "edge"],
};

const SHORT = {
  revar3r: "ReVar3R",
  camdet: "CAMDet",
  "stroke-detection": "Stroke XAI",
  "gesture-keyboard": "Gesture KB",
  "sleep-4stage": "Sleep XAI",
  "sleep-stage-ml": "Sleep ML",
};

export function buildGraph() {
  const nodes = AREAS.map(([id, label]) => ({ id, label, kind: "area" }));
  publications.forEach((p) => nodes.push({ id: p.slug, label: SHORT[p.slug] || p.slug, kind: "paper", tag: p.id }));
  projects.forEach((p) => nodes.push({ id: p.slug, label: p.name, kind: "project" }));
  nodes.push({ id: "rover", label: "Mars rover", kind: "role" });
  const edges = [];
  Object.entries(USES).forEach(([w, areas]) => areas.forEach((a) => edges.push([a, w])));
  return { nodes: nodes.filter((n) => n.kind === "area" || USES[n.id]), edges };
}
