/**
 * SCOUT's knowledge: keyword intents answered only from the portfolio data.
 * Each answer may carry an action the UI performs (scroll, open a demo, ...).
 */
import { profile, publications, education, skills, honors, experience } from "@/data/portfolio";

const pub = (slug) => publications.find((p) => p.slug === slug);
const firstAuthor = publications.filter((p) => p.position === "first author").map((p) => p.title.split(":")[0]);

export const SUGGESTIONS = [
  "who is Sammam?",
  "best paper?",
  "open to a PhD?",
  "show me a demo",
  "the rover?",
  "how do I reach him?",
];

/** Lines SCOUT says once, the first time each section scrolls into view. */
export const SECTION_TIPS = {
  research: "Try “align Sim(3)” under key research interests — six runs snap into one.",
  publications: "Every paper has a live figure. The face mesh is his own face.",
  log: "There’s a Mars rover in here. Click the view, then W A S D.",
  projects: "Open any row; the details unfold in place.",
  system: "3.92 out of 4.00. I double-checked.",
  contact: "Ask me “how do I reach him?” and I’ll open the mail form.",
};

// Ordered from specific to general: the first match wins.
const INTENTS = [
  {
    k: /(phd|ph\.d|doctor|admission|supervis|grad school|fall 2027|student)/,
    a: () => ({
      text: `Yes — ${profile.status.replace("Seeking", "seeking").replace(" · ", " for ")}. B.Sc. CSE from ${education.school.split(",")[0]}, CGPA ${education.cgpa.toFixed(2)}/${education.scale.toFixed(2)} with Highest Distinction; IELTS 7.5. First-author work: ${firstAuthor.join(" and ")}.`,
      action: { type: "scroll", id: "contact", label: "go to contact" },
    }),
  },
  {
    k: /\b(best|top|favou?rite|main|flagship)\b|revar|uncertain|gauge/,
    a: () => {
      const p = pub("revar3r");
      return {
        text: `ReVar3R — first author, under review (arXiv:2610.07883). ${p.tldr.split(". With")[0]}.`,
        action: { type: "lab", tab: "revar3r", label: "open the ReVar3R demo" },
      };
    },
  },
  {
    k: /(camdet|camera|intrinsic|monocular|metric|3d detect)/,
    a: () => ({ text: pub("camdet").tldr, action: { type: "lab", tab: "camdet", label: "open the CAMDet demo" } }),
  },
  {
    k: /stroke|\bface\b|mesh|landmark|asymmetr/,
    a: () => ({ text: `${pub("stroke-detection").venue}. ${pub("stroke-detection").tldr}`, action: { type: "scroll", id: "publications", label: "see the face-mesh figure" } }),
  },
  {
    k: /gesture|\bhand\b|keyboard|\bmouse\b|bangla|lstm/,
    a: () => ({ text: pub("gesture-keyboard").tldr, action: { type: "scroll", id: "publications", label: "see the hand figure" } }),
  },
  {
    k: /(sleep|ppg|photopleth|wearable)/,
    a: () => ({ text: `${pub("sleep-4stage").tldr} ${pub("sleep-stage-ml").tldr}`, action: { type: "scroll", id: "publications", label: "see the sleep figures" } }),
  },
  {
    k: /(dristee|thesis|blind|assistive|navigation)/,
    a: () => ({ text: "DRISTEE is his A+ undergraduate thesis, funded by BRAC’s RSGI: one RGB camera → metric 3D detections + SLAM → a walkable map with spoken guidance.", action: { type: "lab", tab: "dristee", label: "open the DRISTEE map" } }),
  },
  {
    k: /(rover|mars|mongol|urc|robot|yolo|jetson)/,
    a: () => {
      const e = experience.find((x) => x.sim === "rover");
      return { text: `${e.title.split("—")[0].trim()}: ${e.note}. He trained YOLOv8 detectors for the Jetson and earlier built ROS control. There’s a drivable sim in the log.`, action: { type: "scroll", id: "log", label: "drive the rover" } };
    },
  },
  {
    k: /\b(cv|resume|résumé|pdf)\b/,
    a: () => ({ text: "Here’s the CV.", action: { type: "cv", label: "download CV.pdf" } }),
  },
  {
    k: /(contact|email|mail|reach|hire|talk|message|phone)/,
    a: () => ({ text: `${profile.email} is fastest. The contact section also has a form.`, action: { type: "scroll", id: "contact", label: "open the contact form" } }),
  },
  {
    k: /(shell|terminal|command|console|hack)/,
    a: () => ({ text: "Press ` anywhere (or the >_ button) for the shell. Try `help`, `cat papers.bib`, `portrait`.", action: { type: "shell", label: "open the shell" } }),
  },
  {
    k: /(cgpa|gpa|grade|education|degree|university|brac|ielts)/,
    a: () => ({ text: `${education.degree}, ${education.school} (${education.when.toLowerCase()}): CGPA ${education.cgpa.toFixed(2)}/${education.scale.toFixed(2)}, ${education.honors}. IELTS Academic 7.5.`, action: { type: "scroll", id: "system", label: "open the transcript" } }),
  },
  {
    k: /(award|honou?r|prize|achievement)/,
    a: () => ({ text: honors.slice(0, 4).map(([k]) => k).join(" · "), action: { type: "scroll", id: "system", label: "see honors.log" } }),
  },
  {
    k: /(skill|stack|tool|language|python|pytorch|framework)/,
    a: () => ({ text: skills.slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(" · "), action: { type: "scroll", id: "system", label: "see skills.conf" } }),
  },
  {
    k: /\b(joke|fun|funny|bored|lol)\b/,
    a: () => ({ text: "Why did the point cloud need a gauge-fix? It kept changing its frame of mind." }),
  },
  {
    k: /(who are you|what are you|scout|your name)/,
    a: () => ({ text: "SCOUT — a survey drone written in three.js for this site. I read the same data the page does, so I won’t make things up." }),
  },
  {
    k: /(paper|publication|publish|journal|conference)/,
    a: () => ({
      text: `${publications.length} papers: ${publications.filter((p) => p.status === "under review").length} under review (ReVar3R, CAMDet) and ${publications.filter((p) => p.status !== "under review").length} peer-reviewed, including a Q1 journal paper in IEEE Access.`,
      action: { type: "scroll", id: "publications", label: "show the papers" },
    }),
  },
  {
    k: /\b(demo|demos|lab|interactive|play|3d)\b/,
    a: () => ({ text: "His key research interests come with three live 3D demos: ReVar3R’s gauge alignment, CAMDet’s focal-length trap, and the DRISTEE navigation map.", action: { type: "lab", tab: "revar3r", label: "show me" } }),
  },
  {
    k: /(who|about|tell me|sammam|introduce|him\b)/,
    a: () => ({ text: `${profile.name} — ${profile.role}, ${profile.location}. ${profile.tagline} ${profile.status}.` }),
  },
  {
    k: /^(hi|hello|hey|yo|salam|assalam)\b/,
    a: () => ({ text: "Hello! I’m SCOUT, this site’s survey drone. Ask me about Sammam’s research, papers, the rover, or how to reach him." }),
  },
];

export function answer(q) {
  const s = q.toLowerCase().trim();
  if (!s) return null;
  const hit = INTENTS.find((i) => i.k.test(s));
  return hit ? hit.a() : { text: "I only know about Sammam’s work. Try: research, papers, PhD, rover, demo, or contact." };
}
