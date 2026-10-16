import { profile, publications, projects, education, skills, honors, sections, experience, findWork } from "@/data/portfolio";
import { portraitSmall } from "@/data/asciiPortrait";
import { THEMES, THEME_ORDER } from "@/lib/themes";

/**
 * Shell commands. Each returns lines: strings, or [text, className] pairs.
 * ctx: { navigate, close, setCrt, clear, history, scrollTo }
 */

const FILES = {
  "research.md": () => [
    ["# research", "t-amber"],
    profile.tagline,
    "",
    ...profile.interests.map((i) => `  - ${i}`),
  ],
  "papers.bib": () =>
    publications.flatMap((p) => [
      [`@${p.status === "published" && p.id.startsWith("J") ? "article" : p.status === "published" ? "inproceedings" : "unpublished"}{${p.slug}${p.year},`, "t-amber"],
      `  title  = {${p.title}},`,
      `  author = {${p.authors.join(" and ")}},`,
      `  note   = {${p.venue}},`,
      `  year   = {${p.year}}`,
      "}",
    ]),
  "skills.conf": () => skills.map(([k, v]) => `${k} = ${v}`),
  "honors.log": () => honors.map(([k, v]) => `[ok] ${k} — ${v}`),
  "education.txt": () => [
    education.degree,
    `${education.school} · ${education.when}`,
    [`CGPA ${education.cgpa.toFixed(2)} / ${education.scale.toFixed(2)} · ${education.honors}`, "t-hi"],
    ...[...education.coursework, ...education.mathematics].map(([k, v]) => `  ${k.padEnd(40, ".")} ${v}`),
  ],
  "contact.txt": () => [
    `email    ${profile.email}`,
    `phone    ${profile.phone}`,
    `github   ${profile.github}`,
    `scholar  ${profile.scholar}`,
    `linkedin ${profile.linkedin}`,
  ],
  "cv.pdf": () => [["cv.pdf: binary file — try `open cv`", "t-dim"]],
};

const LINKS = {
  github: profile.github,
  scholar: profile.scholar,
  linkedin: profile.linkedin,
  cv: profile.cv,
  arxiv: "https://arxiv.org/abs/2610.07883",
  email: `mailto:${profile.email}`,
};

const sectionIds = sections.flatMap((s) => [s.id, s.label, s.key]);
const findSection = (arg) => sections.find((s) => s.id === arg || s.label === arg || s.key === arg);

export const COMMANDS = {
  help: {
    desc: "list commands",
    run: () => [
      ["commands", "t-amber"],
      ...Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([k, c]) => `  ${(k + (c.usage ? " " + c.usage : "")).padEnd(22)} ${c.desc}`),
      "",
      ["tip: <tab> completes, ↑/↓ walks history, esc closes. 1–7 jump sections outside the shell.", "t-dim"],
    ],
  },
  whoami: {
    desc: "who is this",
    run: () => [[profile.name, "t-hi"], `${profile.role} · ${profile.location}`, profile.status],
  },
  ls: {
    desc: "list sections and files",
    run: () => [
      [sections.map((s) => `${s.label}/`).join("  "), "t-amber"],
      Object.keys(FILES).join("  "),
    ],
  },
  cd: {
    usage: "<section>",
    desc: "jump to a section",
    args: () => sectionIds,
    run: ([arg], ctx) => {
      if (!arg || arg === "~" || arg === "/") return ctx.scrollTo("whoami"), [];
      const s = findSection(arg.replace(/\/$/, ""));
      if (!s) return [[`cd: ${arg}: no such section — try ls`, "t-alert"]];
      ctx.scrollTo(s.id);
      ctx.close();
      return [];
    },
  },
  cat: {
    usage: "<file>",
    desc: "print a file",
    args: () => Object.keys(FILES),
    run: ([f]) => (FILES[f] ? FILES[f]() : [[`cat: ${f || "(nothing)"}: no such file — try ls`, "t-alert"]]),
  },
  papers: {
    desc: "list publications",
    run: () =>
      publications.map((p) => [
        `[${p.id}] ${p.title.split(":")[0].padEnd(16).slice(0, 16)} ${p.status.padEnd(13)} ${p.year} · open ${p.slug}`,
        p.status === "under review" ? "t-hi" : "",
      ]),
  },
  projects: {
    desc: "list projects",
    run: () => projects.map((p) => `${p.state.padEnd(5)} ${p.name.padEnd(20)} ${p.stack.padEnd(28)} open ${p.slug}`),
  },
  rover: {
    desc: "drive the Mars rover sim",
    run: (_, ctx) => {
      ctx.scrollTo("log");
      ctx.close();
      return [];
    },
  },
  log: {
    desc: "experience, newest first",
    run: () => experience.map((e) => `${e.hash}  ${e.when.padEnd(22)} ${e.title}`),
  },
  open: {
    usage: "<name>",
    desc: "open a paper, project or link",
    args: () => [...Object.keys(LINKS), ...publications.map((p) => p.slug), ...projects.map((p) => p.slug)],
    run: ([arg], ctx) => {
      if (!arg) return [["usage: open <name>  (e.g. open revar3r, open github)", "t-dim"]];
      if (LINKS[arg]) {
        if (arg === "cv" || arg === "email") window.location.href = LINKS[arg];
        else window.open(LINKS[arg], "_blank", "noopener");
        return [[`opening ${arg}…`, "t-dim"]];
      }
      if (findWork(arg)) {
        ctx.close();
        ctx.navigate(`/work/${arg}`);
        return [];
      }
      return [[`open: ${arg}: not found — try papers or projects`, "t-alert"]];
    },
  },
  skills: { desc: "print skills.conf", run: () => FILES["skills.conf"]() },
  education: { desc: "print the transcript", run: () => FILES["education.txt"]() },
  honors: { desc: "print honors.log", run: () => FILES["honors.log"]() },
  contact: { desc: "how to reach me", run: () => FILES["contact.txt"]() },
  cv: {
    desc: "download the CV",
    run: () => {
      const a = document.createElement("a");
      a.href = profile.cv;
      a.download = "Sammam_Mahdi_CV.pdf";
      a.click();
      return [["downloading CV.pdf…", "t-dim"]];
    },
  },
  portrait: { desc: "ascii self-portrait", run: () => portraitSmall.split("\n").map((l) => [l, "t-amber"]) },
  crt: {
    usage: "on|off",
    desc: "toggle CRT effects",
    args: () => ["on", "off"],
    run: ([v], ctx) => {
      if (v !== "on" && v !== "off") return [["usage: crt on|off", "t-dim"]];
      ctx.setCrt(v === "on");
      return [[`crt ${v}`, "t-dim"]];
    },
  },
  theme: {
    usage: "[amber|green|ice]",
    desc: "swap the phosphor",
    args: () => THEME_ORDER,
    run: ([t], ctx) => {
      if (!t) return [[`tubes: ${THEME_ORDER.map((k) => `${k} (${THEMES[k].tube})`).join(" · ")} — current: ${ctx.theme}`, "t-dim"]];
      if (!THEMES[t]) return [[`theme: no tube called ${t}`, "t-alert"]];
      ctx.setTheme(t);
      return [[`phosphor → ${t} (${THEMES[t].tube})`, "t-dim"]];
    },
  },
  date: { desc: "local time in Dhaka", run: () => [new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) + " (Dhaka)"] },
  echo: { usage: "<text>", desc: "print text", run: (args) => [args.join(" ")] },
  history: { desc: "command history", run: (_, ctx) => ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`) },
  clear: { desc: "clear the screen", run: (_, ctx) => (ctx.clear(), []) },
  exit: { desc: "close the shell", run: (_, ctx) => (ctx.close(), []) },
  sudo: {
    hidden: true,
    run: () => [["sammam is not in the sudoers file. This incident will be reported.", "t-alert"]],
  },
  hire: {
    hidden: true,
    run: () => {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio")}`;
      return [["opening your mail client — thanks for reaching out.", "t-hi"]];
    },
  },
  rm: { hidden: true, run: () => [["rm: refusing to remove a portfolio that took this long to build", "t-alert"]] },
  // secret: the visitor dashboard (PIN-protected)
  stats: {
    hidden: true,
    run: (_, ctx) => {
      ctx.close();
      ctx.navigate("/analytics");
      return [];
    },
  },
  vim: { hidden: true, run: () => [["you can check out any time you like, but you can never leave. (try exit)", "t-dim"]] },
};

export function complete(input) {
  const parts = input.split(/\s+/);
  if (parts.length <= 1) {
    const hits = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(parts[0]));
    return { hits, apply: (h) => h + " " };
  }
  const cmd = COMMANDS[parts[0]];
  const pool = cmd?.args?.() || [];
  const last = parts[parts.length - 1];
  const hits = [...new Set(pool)].filter((a) => a.startsWith(last));
  return { hits, apply: (h) => [...parts.slice(0, -1), h].join(" ") };
}

export function run(line, ctx) {
  const [name, ...args] = line.trim().split(/\s+/);
  if (!name) return [];
  const cmd = COMMANDS[name];
  if (!cmd) return [[`${name}: command not found — type help`, "t-alert"]];
  return cmd.run(args, ctx);
}
