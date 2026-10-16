/**
 * Single source of truth for the site. Content mirrors Sammam_Mahdi_CV.pdf
 * (Oct 2026); links were extracted from the CV's own hyperlinks.
 * Images live in public/projects and are phosphor-tinted at render time.
 */

export const profile = {
  name: "Sammam Mahdi",
  handle: "sammam",
  role: "Computer Vision & Machine Learning Researcher",
  location: "Dhaka, Bangladesh",
  email: "sammam.mahdi@gmail.com",
  phone: "+880 1822926571",
  github: "https://github.com/SammamMahdi",
  linkedin: "https://www.linkedin.com/in/sammam-mahdi-4886b6426/",
  scholar: "https://scholar.google.com/citations?user=we1H7_0AAAAJ&hl=en",
  cv: "/CV.pdf",
  status: "Seeking PhD positions · Fall 2027",
  tagline:
    "I work across computer vision and machine learning — 3D reconstruction and perception, uncertainty and explainable AI, healthcare, assistive technology, robotics and multimodal agents.",
  interests: [
    "3D computer vision & reconstruction",
    "Uncertainty & trustworthy AI",
    "Explainable AI for healthcare",
    "Assistive technology & HCI",
    "Robotics & edge AI",
    "Multimodal agents (LLM / VLM)",
    "Media forensics",
  ],
};

export const links = [
  { label: "github", href: profile.github },
  { label: "scholar", href: profile.scholar },
  { label: "linkedin", href: profile.linkedin },
  { label: "email", href: `mailto:${profile.email}` },
];

/* ── publications ─────────────────────────────────────────────────────── */
const ME = "S. Mahdi";

export const publications = [
  {
    id: "U1",
    slug: "revar3r",
    status: "under review",
    title: "ReVar3R: Gauge-Aware Perturbation Uncertainty for Feed-Forward 3D Reconstruction",
    authors: [ME, "F. B. Salim", "R. B. Rabbani", "A. N. Zereen"],
    position: "first author",
    venue: "Under review at a top-tier ML conference · arXiv:2610.07883",
    year: 2026,
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2610.07883" }],
    tldr:
      "Showed in closed form that run-to-run similarity-frame (Sim(3)) variation contaminates training-free perturbation uncertainty from frozen feed-forward 3D models, and that aligning runs before taking variance removes it. With no retraining and no labels, this lowers sparsification error (AUSE) below the models' built-in confidence in 11 of 18 backbone–dataset conditions (15 of 18 with held-out fusion), across VGGT, MASt3R and π³ on six datasets.",
    contribution:
      "Conceived the problem, derived the closed-form gauge-contamination result, designed the estimator, and ran all experiments across VGGT, MASt3R and π³.",
  },
  {
    id: "U2",
    slug: "camdet",
    status: "under review",
    title: "CAMDet: Camera-Agnostic Monocular Metric 3D Object Detection with Learned Intrinsic Feature Conditioning",
    authors: ["R. U. Karim", ME, "A. Samin", "S. M. Tabassum", "R. B. Rabbani", "A. N. Zereen"],
    position: "second author",
    venue: "Under review at IEEE Transactions on Image Processing",
    year: 2026,
    links: [],
    tldr:
      "A single-stage DINOv2-DETR detector conditioned on camera intrinsics (FiLM). On sensors held out from training, it beats a Cube R-CNN-style virtual-depth control by 6.3 AP3D@0.25 (SUN RGB-D), and one checkpoint runs unmodified from a desktop GPU to a Jetson Orin Nano.",
    contribution: "Co-designed the detection pipeline with the first author and ran the experiments and ablations.",
  },
  {
    id: "J1",
    slug: "stroke-detection",
    status: "published",
    title: "Optimizing Stroke Recognition with MediaPipe and Machine Learning: An Explainable AI Approach for Facial Landmark Analysis",
    authors: ["R. U. Karim", ME, "A. Samin", "A. N. Zereen", "M. Abdullah-Al-Wadud", "J. Uddin"],
    position: "second author",
    venue: "IEEE Access · Q1 journal · vol. 13, pp. 32636–32660",
    year: 2025,
    links: [
      { label: "DOI", href: "https://doi.org/10.1109/ACCESS.2025.3550577" },
      { label: "code", href: "https://github.com/SammamMahdi/Stroke-Detection" },
    ],
    tldr: "Built the XAI pipeline (228 facial landmarks) and the Multimodal Voting Classifier (RF + XGBoost + CatBoost) — 94.75% accuracy, 96.5% recall.",
    figure: "/projects/stroke.png",
  },
  {
    id: "C1",
    slug: "gesture-keyboard",
    status: "published",
    title: "Vision-based Hand Gesture Virtual Keyboard-Mouse Framework with Bilingual Next-word Prediction",
    authors: [ME, "R. U. Karim", "T. Sujat", "S. M. Tabassum", "A. Samin", "A. N. Zereen"],
    position: "first author",
    venue: "23rd Intl. Joint Conf. on Computer Science and Software Engineering (JCSSE), Bangkok",
    year: 2026,
    links: [
      { label: "DOI", href: "https://doi.org/10.1109/JCSSE68839.2026.11596610" },
      { label: "code", href: "https://github.com/SammamMahdi/Hand_Gesture_BSC12" },
    ],
    tldr:
      "Touchless text entry: MediaPipe hand landmarks encoded geometrically for nine static gestures (≥97.4% accuracy, <0.03 ms each, up to 37.7 FPS), with two-layer LSTMs for English and Bangla next-word prediction.",
    figure: "/projects/hand-gesture.png",
  },
  {
    id: "C2",
    slug: "sleep-4stage",
    status: "published",
    title: "Improved Photoplethysmography-Based Four-Stage Sleep Classification with Explainable AI-Driven Machine Learning",
    authors: ["T. Ferdous", "R. U. Karim", "A. Samin", ME, "A. N. Zereen"],
    position: "fourth author",
    venue: "IEEE ICEACE",
    year: 2024,
    links: [
      { label: "DOI", href: "https://doi.org/10.1109/ICEACE63551.2024.10898853" },
      { label: "code", href: "https://github.com/SammamMahdi/Sleep-Detection" },
    ],
    tldr: "Four-stage sleep staging from PPG signals, with explainable AI exposing which physiological features drive each decision.",
  },
  {
    id: "C3",
    slug: "sleep-stage-ml",
    status: "published",
    title: "Machine Learning Approaches in Photoplethysmography-Based Sleep Stage Classification",
    authors: ["T. Ferdous", "R. U. Karim", "A. Samin", ME, "H. Tasnim", "A. N. Zereen"],
    position: "fourth author",
    venue: "IEEE ICEACE",
    year: 2024,
    links: [
      { label: "DOI", href: "https://doi.org/10.1109/ICEACE63551.2024.10898858" },
      { label: "code", href: "https://github.com/SammamMahdi/Sleep-Detection" },
    ],
    tldr: "A comparison of machine-learning families for PPG-based sleep staging on low-cost wearable signals.",
  },
];

export const ME_NAME = ME;

/* ── experience, rendered as a git log ────────────────────────────────── */
export const experience = [
  {
    hash: "r3v4r3r",
    branch: "research",
    head: true,
    title: "Research Assistant — Dr. Aniqua Nusrat Zereen's group",
    org: "CSE, BRAC University",
    when: "2024 — present",
    note: "undergraduate researcher from 2024 · Undergraduate Research Assistant since Nov 2025",
    bullets: [
      ["ReVar3R [U1]", "first author — conceived the problem, derived the closed-form gauge-contamination result, designed the estimator, and ran all experiments across VGGT, MASt3R and π³."],
      ["CAMDet [U2]", "second author — co-designed the detection pipeline and ran the experiments and ablations."],
      ["DRISTEE", "undergraduate thesis, first author, grade A+, RSGI-funded: a six-module assistive agent for blind and low-vision users driven by one RGB camera."],
      ["Cervical cancer screening", "contributed to and supervised an edge-deployable cytology classifier; guided implementation and evaluation."],
      ["Co-authored", "journal and conference papers on explainable facial-landmark analysis and physiological-signal classification [J1, C2, C3]."],
    ],
  },
  {
    hash: "t4dsa25",
    branch: "teaching",
    sim: "graphs",
    title: "Teaching Assistant — Data Structures & Algorithms",
    org: "CSE Department, BRAC University",
    when: "Jan 2025 — May 2026",
    bullets: [
      ["Recitations", "led weekly sessions for 100+ students on complexity analysis, graph algorithms, and dynamic programming; designed problem sets, evaluated assessments, and held one-on-one consultations."],
      ["Mentoring", "mentored a team of undergraduate researchers — reviewed weekly progress, guided experiments, and coordinated toward publication."],
    ],
  },
  {
    hash: "m0ng2l5",
    branch: "robotics",
    title: "BRACU Mongol Tori — AI/ML core team",
    org: "Mars rover · University Rover Challenge, Utah, USA",
    when: "2024 — 2025",
    note: "team ranked 8th globally at URC 2025",
    sim: "rover",
    bullets: [["Perception", "trained YOLOv8 detectors for real-time object perception under outdoor variability; optimized them for on-device inference on NVIDIA Jetson."]],
  },
  {
    hash: "c7rl0s4",
    branch: "robotics",
    title: "BRACU Mongol Tori — Control team",
    org: "Mars rover · University Rover Challenge, Utah, USA",
    when: "2023 — 2024",
    bullets: [["Control", "developed the rover's ROS control systems — teleoperation and motion control for manual and autonomous navigation."]],
  },
  {
    hash: "b5c3926",
    branch: "main",
    title: "B.Sc. in Computer Science and Engineering",
    org: "BRAC University",
    when: "graduated Jun 2026",
    note: "CGPA 3.92 / 4.00 · Highest Distinction",
    bullets: [],
  },
];

/* ── projects table ───────────────────────────────────────────────────── */
export const projects = [
  {
    slug: "icea-deepfake",
    group: "research",
    state: "RUN",
    name: "ICEA",
    full: "Invariant-Counterfactual Evidence Accumulation",
    stack: "deepfake forensics",
    summary:
      "Deepfake detection from violations of physical and human invariants rather than generator-specific artifacts, aiming to generalize to unseen generators; a dual-encoder backbone with a counterfactual violation classifier for forensic attribution.",
    image: "/projects/research-deepfake-icea.svg",
    links: [],
  },
  {
    slug: "edge-agent",
    group: "research",
    state: "RUN",
    name: "Edge-Native Agent",
    full: "Edge-Native Multimodal Agent for Assistive Perception",
    stack: "agents · LLM/VLM · RAG",
    summary:
      "An agentic system — planner/router, tool use, vector memory, multi-LLM/VLM integration, retrieval — with a structured evaluation harness and anti-fabrication guardrails. Reduced cloud vision calls by over 95%.",
    links: [],
  },
  {
    slug: "dristee",
    group: "research",
    state: "DONE",
    badge: "grade A+",
    name: "DRISTEE",
    full: "Undergraduate thesis · RSGI-funded",
    stack: "metric 3D · SLAM · VLM",
    summary:
      "A six-module assistive agent for blind and low-vision users driven by one RGB camera: CAMDet metric 3D detections fused with MASt3R-SLAM into a metric traversability map for path planning with spoken guidance, plus VLM scene description, face recognition, OCR, and voice interaction.",
    image: "/projects/research-dristee.svg",
    links: [],
  },
  {
    slug: "cervical-cancer",
    group: "research",
    state: "RUN",
    badge: "supervisor",
    name: "Cervical screening",
    full: "Edge-deployable cytology classifier",
    stack: "distillation · calibration",
    summary:
      "Contributed to and supervised a research group building an edge-deployable cytology classifier — knowledge distillation (EfficientNet-B4 → B0) on SIPaKMeD, tuned for calibration and external generalization (Herlev, APACC, HiCervix).",
    image: "/projects/research-cervical-cancer.svg",
    links: [{ label: "code", href: "https://github.com/SammamMahdi/Cervical-Cancer" }],
  },
  {
    slug: "weheal",
    group: "engineering",
    state: "DONE",
    badge: "1st runner-up",
    name: "WeHeal",
    full: "Telemedicine & hospital management",
    stack: "MERN",
    summary:
      "Telemedicine platform — appointment booking, video consultations, prescriptions, an emergency flow, and a bilingual (Bangla/English) AI chatbot — on a React SPA + Node/Express REST API with role-based access. 1st Runner-up, Software Engineering Showcase (200+ teams).",
    image: "/projects/weheal.png",
    links: [
      { label: "code", href: "https://github.com/SammamMahdi/WeHeal-final" },
      { label: "live", href: "https://weheal-frontend.onrender.com/" },
    ],
  },
  {
    slug: "skillwise",
    group: "engineering",
    state: "DONE",
    badge: "3rd runner-up",
    name: "SkillWise",
    full: "AI-powered e-learning & anti-cheat",
    stack: "CV + MERN",
    summary:
      "E-learning platform with real-time MediaPipe proctoring and CV-based course recommendation (upload a résumé, get matched courses). 3rd Runner-up, Software Engineering Showcase (200+ teams).",
    image: "/projects/skillwise.png",
    links: [{ label: "code", href: "https://github.com/SammamMahdi/SkillWise" }],
  },
  {
    slug: "journaling-fs",
    group: "engineering",
    state: "DONE",
    name: "Journaling FS",
    full: "Metadata journaling file system",
    stack: "C · operating systems",
    summary:
      "Crash-consistent journaling file system with an mkfs image builder and a 16-block write-ahead journal (DATA/COMMIT records) with crash-recovery replay.",
    image: "/projects/se-filesystem.svg",
    links: [{ label: "code", href: "https://github.com/SammamMahdi/CSE321_Project" }],
  },
  {
    slug: "die-again",
    group: "engineering",
    state: "DONE",
    name: "Die Again",
    full: "3D troll platformer",
    stack: "three.js · react · tauri",
    summary:
      "Real-time 3D WebGL platformer (react-three-fiber, 10 levels) with Firebase auth and Firestore leaderboards; shipped as a Vercel web app and a cross-platform Tauri (Rust) desktop build.",
    image: "/projects/dieagain.png",
    links: [
      { label: "code", href: "https://github.com/SammamMahdi/Die-Again-Troll-Game" },
      { label: "live", href: "https://die-again-troll-game.vercel.app/" },
    ],
  },
  {
    slug: "matrimonial-hub",
    group: "engineering",
    state: "DONE",
    name: "Matrimonial Hub",
    full: "Matchmaking platform",
    stack: "PHP · MySQL",
    summary:
      "Matchmaking platform with an explainable weighted compatibility engine and match-gated chat; hardened by design (bcrypt, prepared statements, CSRF tokens, per-action authorization) on a hand-rolled MVC.",
    image: "/projects/matrimonial.png",
    links: [{ label: "code", href: "https://github.com/SammamMahdi/matrimonial-hub" }],
  },
  {
    slug: "librobot",
    group: "engineering",
    state: "DONE",
    name: "LibroBot",
    full: "RFID library automation robot",
    stack: "Arduino · C++",
    summary:
      "Autonomous book-retrieval robot with a master (line-follower) / slave (book-selector) architecture over serial, RFID localization, and DC motor control.",
    image: "/projects/se-librobot.svg",
    links: [{ label: "code", href: "https://github.com/SammamMahdi/LIBRO-BOT-CSE461" }],
  },
];

/* ── education, skills, honors ────────────────────────────────────────── */
export const education = {
  degree: "B.Sc. in Computer Science and Engineering",
  school: "BRAC University, Dhaka",
  when: "Graduated June 2026",
  cgpa: 3.92,
  scale: 4,
  honors: "Highest Distinction · Vice-Chancellor's List",
  coursework: [
    ["Data Structures", "A+"],
    ["Introduction to Robotics", "A+"],
    ["Algorithms", "A"],
    ["Artificial Intelligence", "A"],
    ["Computer Graphics", "A"],
    ["Numerical Methods", "A"],
    ["Operating Systems", "A"],
  ],
  mathematics: [
    ["Calculus II", "A+"],
    ["Complex Variables & Laplace Transforms", "A+"],
    ["Calculus I", "A"],
    ["Linear Algebra & Fourier Analysis", "A"],
    ["Statistics & Probability", "A"],
    ["Discrete Mathematics", "A"],
  ],
  extra: [
    ["IELTS Academic", "7.5 overall · Oct 2026"],
    ["Edexcel A-Levels & IGCSE", "average grade A · 2021 / 2019"],
  ],
};

export const skills = [
  ["3d_vision", "Feed-forward 3D foundation models (VGGT, MASt3R, π³), Sim(3) registration, monocular metric depth, 3D object detection"],
  ["uncertainty", "Perturbation ensembles, sparsification metrics (AUSE), isotonic calibration, paired statistical testing"],
  ["ml_vision", "PyTorch, TensorFlow, Hugging Face Transformers, DINOv2, scikit-learn, XGBoost, OpenCV, MediaPipe, YOLOv5/v8, SHAP, Grad-CAM"],
  ["genai_agents", "LLMs, VLMs, RAG pipelines, agent tool use, evaluation harnesses"],
  ["systems", "Linux, Git, Docker, ROS, NVIDIA Jetson (edge inference)"],
  ["languages", "Python, C, C++, Java, JavaScript, SQL"],
  ["web", "React, Node.js / Express, MongoDB, PHP / MySQL, three.js"],
];

export const honors = [
  ["Highest Distinction & Vice-Chancellor's List", "BRAC University — graduation; VC's List across multiple semesters"],
  ["Research Seed Grant Initiative (RSGI)", "competitive research grant, BRAC University, for the DRISTEE thesis project"],
  ["Globally ranked 8th — University Rover Challenge 2025", "The Mars Society · Team BRACU Mongol Tori"],
  ["1st & 3rd Runner-up — Software Engineering Showcase", "WeHeal (1st) and SkillWise (3rd), out of 200+ teams"],
  ["HULT Prize Semi-Finalist", "international social-entrepreneurship competition"],
  ["The Daily Star Award", "national recognition for outstanding O/A-Level results, Bangladesh"],
  ["Edexcel High Achievers' Award", "top performance in Edexcel International examinations"],
  ["The Duke of Edinburgh's International Award", "Bronze"],
];

/* ── navigation + lookup ──────────────────────────────────────────────── */
export const sections = [
  { id: "whoami", label: "whoami", key: "1" },
  { id: "system", label: "education", key: "2" },
  { id: "research", label: "research", key: "3" },
  { id: "publications", label: "papers", key: "4" },
  { id: "log", label: "experience", key: "5" },
  { id: "projects", label: "projects", key: "6" },
  { id: "contact", label: "contact", key: "7" },
];

/** Anything with a slug can be opened at /work/:slug. */
export const findWork = (slug) =>
  publications.find((p) => p.slug === slug) || projects.find((p) => p.slug === slug) || null;
