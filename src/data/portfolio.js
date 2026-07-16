import {
  Brain,
  Eye,
  ShieldCheck,
  Accessibility,
  HeartPulse,
  Layers,
  Zap,
  Boxes,
  Network,
  Atom,
  MessagesSquare,
  Bot,
  Cpu,
  Terminal,
  Globe,
  GraduationCap,
  School,
  Users,
  BookOpen,
  Trophy,
  Medal,
  Star,
  Award,
} from "lucide-react";

/**
 * Single source of truth for portfolio content.
 * Components read from here; nothing below is fetched at runtime.
 *
 * Image convention: every entry points at a file in public/projects/.
 * `.png` entries are real screenshots and paper figures; `.svg` entries are
 * generated architecture schematics (see scripts that produced them) standing
 * in until a real figure exists. A missing file falls back to a gradient card
 * (see ProjectImage), so the grid never shows a broken image.
 */

export const profile = {
  name: "Sammam Mahdi",
  role: "Computer Vision Researcher & Software Engineer",
  location: "Dhaka, Bangladesh",
  email: "sammam.mahdi@gmail.com",
  phone: "+880 1822926571",
  github: "https://github.com/SammamMahdi",
  linkedin: "https://www.linkedin.com/in/sammam-mahdi-290937170/",
  scholar: "https://scholar.google.com/citations?user=we1H7_0AAAAJ&hl=en",
  orcid: "https://orcid.org/0009-0005-7202-2692",
  cv: "/CV.pdf",
  citations: 29,
  publicationCount: 4,
  cgpa: "3.92 / 4.00",
  cgpaValue: "3.92",
  honors: "Highest Distinction",
  /** Short line under the name — a sentence, not a keyword list. */
  headline:
    "I build perception systems that people can trust, and ship the software that carries them.",
  /** The proper introduction. Prose, written to be read. */
  intro: [
    "I am a Computer Science graduate from BRAC University, where I finished with a 3.92 CGPA and Highest Distinction. Over the last two years I have published four peer-reviewed IEEE papers, led weekly recitations for more than a hundred students as a Teaching Assistant in Data Structures & Algorithms, and spent two seasons building the vision stack for a Mars rover team that competed in Utah.",
    "My research sits where 3D perception meets trustworthy AI. My thesis, DRISTEE, is an agentic assistive vision system for the visually impaired: depth-based detection and dense metric SLAM feeding a real-time speech interface. Alongside it I work on deepfake detection grounded in physical invariants rather than generator artifacts, and on medical models small enough to run at the edge without losing calibration.",
    "The other half of my work is engineering. I like the part where an idea has to survive contact with real users, so I ship: a 3D WebGL platformer, a learning platform with real-time proctoring, a telemedicine system, and a file system written from scratch in C. Research is where I ask the question; engineering is where I find out whether the answer holds.",
  ],
};

/** Education — newest first. Grades are the point here, so they lead. */
export const education = [
  {
    icon: GraduationCap,
    degree: "B.Sc. in Computer Science and Engineering",
    institution: "BRAC University",
    location: "Dhaka, Bangladesh",
    duration: "Graduated June 2026",
    status: "Graduated",
    grade: "3.92",
    gradeLabel: "CGPA / 4.00",
    honors: ["Highest Distinction", "Multiple Dean's List Awards"],
    coursework: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming",
      "Operating Systems",
      "Database Systems",
      "Computer Networks",
      "Machine Learning",
      "Computer Vision",
      "Software Engineering",
    ],
  },
  {
    icon: School,
    degree: "International Advanced Levels (IAL)",
    institution: "Academia · Edexcel",
    duration: "2019 – 2021",
    status: "Completed",
    grade: "A",
    gradeLabel: "Average Grade",
  },
  {
    icon: School,
    degree: "International General Certificate of Secondary Education (IGCSE)",
    institution: "Academia · Edexcel",
    duration: "2018 – 2019",
    status: "Completed",
    grade: "A",
    gradeLabel: "Average Grade",
  },
];

/** Teaching Experience — mirrors the CV section of the same name. */
export const teachingExperience = [
  {
    icon: Users,
    role: "Teaching Assistant — Data Structures & Algorithms",
    org: "CSE Department, BRAC University",
    duration: "Jan 2025 – May 2026",
    highlights: [
      "Mentored 100+ undergraduate students; led weekly recitations covering algorithm complexity, graph algorithms, and dynamic programming.",
      "Conducted problem-solving sessions, evaluated assessments, and prepared supplementary explainer materials and worked examples.",
    ],
  },
  {
    icon: BookOpen,
    role: "Private Tutor — O-Level & A-Level",
    org: "Independent",
    duration: "3 years",
    highlights: [
      "Taught O-Level and A-Level students across mathematics and computer science, building study plans around each student's gaps.",
    ],
  },
];

/** Teaching Interests & Courses Able to Teach — mirrors the CV section. */
export const teachingInterests = [
  {
    icon: Terminal,
    area: "Programming & Foundations",
    courses: [
      "C",
      "C++",
      "Java",
      "Python",
      "Object-Oriented Programming",
      "Data Structures & Algorithms",
    ],
  },
  {
    icon: Cpu,
    area: "Systems",
    courses: ["Operating Systems", "Database Systems (intro)"],
  },
  {
    icon: Brain,
    area: "AI & Data",
    courses: [
      "Introduction to Artificial Intelligence",
      "Machine Learning",
      "Computer Vision",
      "Deep Learning",
    ],
  },
];

/** Technical Skills — grouped exactly as the CV groups them. */
export const technicalSkills = [
  {
    icon: Brain,
    category: "Deep Learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "Hugging Face Transformers",
      "Mamba-2",
      "MViTv2",
      "BYOL-A",
      "SHAP",
      "GradCAM",
    ],
  },
  {
    icon: Eye,
    category: "Computer Vision",
    items: [
      "OpenCV",
      "MediaPipe",
      "YOLOv5 / v8",
      "CAMDet",
      "AdaFace",
      "RetinaFace",
      "Pixtral-12B",
      "CLAHE",
      "SLAM",
    ],
  },
  {
    icon: Bot,
    category: "Robotics / Embedded",
    items: ["ROS / ROS2", "Arduino", "NVIDIA Jetson (Nano, Xavier NX)", "Gazebo"],
  },
  {
    icon: Terminal,
    category: "Systems & Dev",
    items: [
      "C",
      "C++",
      "Python (Expert)",
      "JavaScript",
      "SQL",
      "Linux",
      "Git",
      "Docker",
      "LaTeX",
    ],
  },
  {
    icon: Globe,
    category: "Web & Full-Stack",
    items: [
      "MERN Stack",
      "React",
      "Vite",
      "TypeScript",
      "Three.js",
      "Firebase",
      "PHP",
      "MySQL",
    ],
  },
];

/** Honors & Awards — mirrors the CV list. */
export const awards = [
  {
    icon: Medal,
    title: "Highest Distinction & Dean's List",
    detail:
      "Multiple semesters — BRAC University; CGPA 3.92/4.00.",
    type: "Academic",
  },
  {
    icon: Star,
    title: "Daily Star & Edexcel High Achievers' Award",
    detail:
      "National recognition for O-Level / A-Level performance, Bangladesh.",
    type: "Academic",
    year: "2019 & 2022",
  },
  {
    icon: Trophy,
    title: "HULT Prize Semi-Finalist",
    detail:
      "Competitive international social-entrepreneurship competition, at BRAC University.",
    type: "Competition",
    year: "2023",
  },
  {
    icon: Award,
    title: "National Mathematical Olympiad Participant",
    detail: "Selected among top school-level competitors.",
    type: "Competition",
    year: "2016",
  },
  {
    icon: Award,
    title: "Duke of Edinburgh Bronze Award",
    detail: "Leadership and community service.",
    type: "Achievement",
    year: "2023",
  },
];


/** Shown prominently — the headline ask. */
export const phdStatement = {
  headline: "Seeking PhD positions for Fall 2027",
  body: "I am actively looking for PhD offers and funded research positions in computer vision, trustworthy AI, and 3D perception. Four peer-reviewed IEEE publications, an agentic assistive-vision thesis, and two years of applied research experience — I am ready to commit to a doctoral program and would welcome conversations with prospective advisors.",
  openTo: [
    "PhD offers (fully funded)",
    "Research assistantships",
    "Pre-doctoral / visiting research roles",
    "Research collaborations",
  ],
};

/** The engineering half of the story — deliberately distinct from research. */
export const engineeringStatement = {
  headline: "I ship production software, not just papers",
  body: "Research is where I ask the questions; engineering is where I make them real. I build and ship full-stack products end to end — 3D WebGL games, MERN learning platforms with real-time proctoring, PHP/MySQL systems with hand-rolled auth, and embedded robotics on ROS and Arduino. The same rigour I bring to an ablation table I bring to a deploy: typed boundaries, real error states, and software that survives contact with actual users.",
  strengths: [
    "Full-stack product delivery (React, Node, MongoDB, PHP/MySQL)",
    "Real-time 3D & WebGL (Three.js, react-three-fiber)",
    "Computer vision in production (MediaPipe, YOLO, OpenCV)",
    "Embedded & robotics (ROS/ROS2, Arduino, Jetson)",
  ],
};

/**
 * Research interests. `core` entries come from the CV; `emerging` are the
 * newer directions — 3DGS first, per current focus.
 */
export const researchInterests = [
  {
    icon: Boxes,
    title: "3D Gaussian Splatting & Neural Rendering",
    blurb:
      "Real-time radiance-field reconstruction as a perception substrate — using 3DGS for dense, metric, editable scene representations that assistive and robotic systems can actually reason over on-device.",
    emerging: true,
  },
  {
    icon: Eye,
    title: "3D Vision & SLAM",
    blurb:
      "Dense metric mapping, depth-aware detection, and spatial understanding — the backbone of my DRISTEE thesis (CAMDet + MASt3R-SLAM).",
  },
  {
    icon: ShieldCheck,
    title: "Trustworthy & Explainable AI",
    blurb:
      "Models that can be interrogated, not just benchmarked. SHAP/GradCAM interpretability pipelines over clinical and forensic decisions.",
  },
  {
    icon: Brain,
    title: "Deepfake Detection & Media Forensics",
    blurb:
      "Physics-grounded detection that targets violations of human invariants rather than generator-specific artifacts, for generalization to unseen synthetic media.",
  },
  {
    icon: Accessibility,
    title: "Assistive Technology & Accessibility",
    blurb:
      "Perception systems built for the visually impaired — low-latency, context-aware, and designed around the person rather than the benchmark.",
  },
  {
    icon: HeartPulse,
    title: "Applied Machine Learning for Healthcare",
    blurb:
      "Stroke screening, sleep staging, and cervical cytology — cost-effective, non-invasive diagnostics that hold up under external validation.",
  },
  {
    icon: MessagesSquare,
    title: "Multimodal & Vision–Language Models",
    blurb:
      "VLM-driven scene-text reading and grounded interaction (Pixtral-12B), fusing vision, language, and speech into one perception loop.",
    emerging: true,
  },
  {
    icon: Bot,
    title: "Agentic & Embodied Perception",
    blurb:
      "Modular agentic pipelines where perception, memory, and action compose — moving from single-shot inference toward systems that decide what to look at next.",
    emerging: true,
  },
  {
    icon: Network,
    title: "Federated & Privacy-Preserving Learning",
    blurb:
      "Head-level proximal aggregation under non-IID clients, keeping sensitive medical data on-device while still learning across institutions.",
    emerging: true,
  },
  {
    icon: Atom,
    title: "Quantum Machine Learning",
    blurb:
      "Quantum attention transformers, barren-plateau diagnostics, and quantum-to-quantum distillation for communication-efficient federated learning.",
    emerging: true,
  },
  {
    icon: Layers,
    title: "Representation & Self-Supervised Learning",
    blurb:
      "Learning transferable structure without labels — BYOL-A style objectives and invariance-driven representations.",
  },
  {
    icon: Zap,
    title: "Efficient, Real-Time Deep Learning",
    blurb:
      "Knowledge distillation, quantization, and edge deployment — models that run on a Jetson, not just an A100.",
  },
];

/**
 * Peer-reviewed, published.
 * Order is deliberate: the first-author JCSSE paper sits last, per request.
 */
export const publications = [
  {
    slug: "stroke-detection",
    title:
      "Optimizing Stroke Recognition with MediaPipe and Machine Learning: An Explainable AI Approach for Facial Landmark Analysis",
    authors:
      "RU Karim, S. Mahdi, A Samin, AN Zereen, M Abdullah-Al-Wadud, J Uddin",
    venue: "IEEE Access",
    extra: "vol. 13, pp. 32636–32660 · Impact Factor 3.9",
    year: "2025",
    authorPosition: "2nd Author",
    citations: 24,
    image: "/projects/stroke.png",
    paperUrl: "https://ieeexplore.ieee.org/abstract/document/10924203",
    codeUrl: "https://github.com/SammamMahdi/Stroke-Detection",
    doi: "10.1109/ACCESS.2025.3550577",
    doiUrl: "https://doi.org/10.1109/ACCESS.2025.3550577",
    description:
      "A cost-effective, non-invasive screening tool that detects stroke-related facial asymmetry from a single photograph. MediaPipe Face Mesh extracts 468 landmarks reduced to 228 key points across 29 anatomical regions, normalized against nose tip and inter-eye distance for an invariant geometric signature.",
    contribution:
      "Engineered the XAI interpretability pipeline using feature importance over 228 MediaPipe facial landmarks; co-designed the Multimodal Voting Classifier (RF + XGBoost + CatBoost) achieving 94.75% accuracy on stroke/non-stroke classification.",
    highlights: [
      "94.75% accuracy · 96.5% recall on the stroke class (misses only 7 of 201 stroke faces)",
      "XAI converged on clinical anatomy — cheek and mouth droop — without explicit instruction",
    ],
    tags: ["Explainable AI", "MediaPipe", "Healthcare", "Ensemble Learning"],
  },
  {
    slug: "sleep-4stage",
    title:
      "Improved Photoplethysmography-Based Four-Stage Sleep Classification with Explainable AI-Driven Machine Learning",
    authors: "T Ferdous, RU Karim, A Samin, S. Mahdi, AN Zereen",
    venue: "IEEE 2nd Intl. Conf. on Electrical, Automation and Computer Engineering (ICEACE)",
    location: "Changchun, China",
    year: "2024",
    authorPosition: "4th Author",
    image: "/projects/pub-sleep-4stage.svg",
    paperUrl: "https://ieeexplore.ieee.org/abstract/document/10898853",
    doi: "10.1109/ICEACE63551.2024.10898853",
    doiUrl: "https://doi.org/10.1109/ICEACE63551.2024.10898853",
    description:
      "Four-stage sleep classification from photoplethysmography signals, pairing improved feature engineering with explainable AI so clinicians can see which physiological signals drive each staging decision.",
    tags: ["Explainable AI", "Signal Processing", "Healthcare", "PPG"],
  },
  {
    slug: "sleep-stage-ml",
    title:
      "Machine Learning Approaches in Photoplethysmography-Based Sleep Stage Classification",
    authors: "T Ferdous, RU Karim, A Samin, S. Mahdi, H Tasnim, AN Zereen",
    venue: "IEEE 2nd Intl. Conf. on Electrical, Automation and Computer Engineering (ICEACE)",
    location: "Changchun, China",
    year: "2024",
    authorPosition: "4th Author",
    image: "/projects/pub-sleep-stage-ml.svg",
    paperUrl: "https://ieeexplore.ieee.org/abstract/document/10898858",
    doi: "10.1109/ICEACE63551.2024.10898858",
    doiUrl: "https://doi.org/10.1109/ICEACE63551.2024.10898858",
    description:
      "A comparative study of machine learning approaches for sleep stage classification from PPG signals — establishing which model families transfer best to low-cost wearable sensing.",
    tags: ["Machine Learning", "Signal Processing", "Healthcare", "PPG"],
  },
  {
    slug: "gesture-keyboard",
    title:
      "Vision-based Hand Gesture Virtual Keyboard-Mouse Framework with Bilingual Next-word Prediction",
    authors:
      "Sammam Mahdi, RU Karim, T Sujat, SM Tabassum, A Samin, AN Zereen",
    venue: "23rd Intl. Joint Conference on Computer Science and Software Engineering (JCSSE)",
    location: "Bangkok, Thailand",
    year: "2026",
    authorPosition: "1st Author",
    isFirstAuthor: true,
    image: "/projects/hand-gesture.png",
    paperUrl: "https://ieeexplore.ieee.org/abstract/document/11596610",
    doi: "10.1109/JCSSE68839.2026.11596610",
    doiUrl: "https://doi.org/10.1109/JCSSE68839.2026.11596610",
    description:
      "Touchless human–computer interaction for accessibility, without the usual costs. Existing gesture keyboards are held back by limited vocabularies, sensitivity to illumination, heavy compute, and weak multilingual support. This modular, non-probabilistic pipeline pairs real-time geometric encoding of MediaPipe hand landmarks with two-layer LSTM networks for next-word prediction in English and Bangla, mapping recognized gestures onto a unified keyboard-and-mouse interface for both key and pointer actions.",
    highlights: [
      "Nine static gestures classified at ≥97.4% accuracy with under 0.03 ms latency per gesture, sustaining up to 37.7 FPS",
      "LSTM next-word prediction above 97% accuracy at perplexity below 1.15",
      "Character error rate of 3.43% for English and 8.34% for Bangla",
      "Every component runs sequentially in real time, with a lightweight monitor logging frame rate, latency, and resource usage",
      "Cross-platform statistical analysis confirms consistent usability and resource efficiency across hardware",
    ],
    tags: [
      "Computer Vision",
      "HCI",
      "Gesture Recognition",
      "MediaPipe",
      "LSTM",
      "Multilingual NLP",
      "Accessibility",
    ],
  },
];

/** Active research — not yet published. */
export const researchProjects = [
  {
    slug: "dristee",
    title: "DRISTEE — Agentic Assistive Vision System",
    subtitle: "Undergraduate Thesis",
    period: "2025 – 2026",
    status: "Thesis · Ongoing",
    funding: "Funded by the Research Seed Grant Initiative, BRAC University",
    image: "/projects/research-dristee.svg",
    description:
      "A modular agentic perception pipeline for the visually impaired, combining depth-based 3D object detection (CAMDet), MASt3R-SLAM dense metric mapping, and real-time scene understanding with contextual interaction.",
    highlights: [
      "Multimodal integration: VLM-based OCR (Pixtral-12B) for scene-text and document reading",
      "Face recognition via AdaFace + RetinaFace",
      "Low-latency speech interface with semantic caching for responsive, context-aware navigation",
    ],
    tags: ["3D Vision", "SLAM", "Agentic AI", "Assistive Tech", "VLM"],
  },
  {
    slug: "icea-deepfake",
    title: "ICEA — Invariant-Counterfactual Evidence Accumulation",
    subtitle: "Deepfake Detection",
    period: "2025 – present",
    status: "Ongoing",
    image: "/projects/research-deepfake-icea.svg",
    description:
      "A physics-grounded deepfake detection framework that identifies violations of five human invariant laws rather than generator-specific artifacts, enabling generalization to unseen synthetic media.",
    highlights: [
      "Dual-encoder backbone with a Counterfactual Violation Classifier",
      "Multi-label forensic attribution with grounded explainability",
    ],
    tags: ["Deepfake Detection", "Media Forensics", "Explainability"],
  },
  {
    slug: "cervical-cancer",
    title: "Two-Tier Cervical Cancer Screening",
    subtitle: "Edge-Deployable Cytology Classifier",
    period: "Ongoing",
    status: "Ongoing",
    image: "/projects/research-cervical-cancer.svg",
    codeUrl: "https://github.com/SammamMahdi/Cervical-Cancer",
    description:
      "A lightweight, edge-deployable cytology classifier built via knowledge distillation — EfficientNet-B4 (teacher) distilled into EfficientNet-B0 (student), trained on SIPaKMeD across 5 classes.",
    highlights: [
      "Optimizes for external generalization, calibration, and edge efficiency over headline internal accuracy",
      "Cross-dataset evaluation against Herlev, APACC, and HiCervix at binary and 3-class levels",
      "Honest scope: does not detect HSIL or glandular lesions; earlier 97.11% figure flagged as a leaky split",
    ],
    tags: ["Knowledge Distillation", "Medical Imaging", "Edge AI", "Calibration"],
  },
  {
    slug: "fedqat",
    title: "FedQAT-Head — Federated Quantum Attention Transformer",
    subtitle: "Head-Level Aggregation",
    period: "Ongoing",
    status: "Ongoing",
    image: "/projects/research-fedqat.svg",
    codeUrl: "https://github.com/SammamMahdi/FEDQAT",
    description:
      "Per-attention-head proximal aggregation for non-IID federated quantum learning, combining quantum circuits with transformer attention across heterogeneous clients.",
    highlights: [
      "QFedProx-Attention: head-level aggregation for heterogeneous quantum clients",
      "Attention-Head Distillation (AHD): quantum-to-quantum transfer via Gram-matrix alignment — 30–44% payload reduction",
      "Barren-plateau diagnostics across circuit depth, qubit count, head count, and data heterogeneity",
      "Evaluated on MNIST, Fashion-MNIST, MedMNIST PathMNIST, and SST-2",
    ],
    tags: ["Federated Learning", "Quantum ML", "PennyLane", "PyTorch"],
  },
  {
    slug: "mongol-tori",
    title: "BRACU Mongol Tori — Mars Rover",
    subtitle: "AI / ML Contributor",
    period: "2023 – 2025",
    status: "Completed",
    image: "/projects/mongoltori.jpg",
    link: "https://www.bracu-mongoltori.com/about",
    description:
      "Two-time participant in the University Rover Challenge (URC) in Utah, USA, contributing to the Control, AI, and Autonomous Systems teams of BRAC University's Mars rover.",
    highlights: [
      "Designed and trained YOLOv8 models for real-time detection of bottles, mallets, and keyboard keys under outdoor lighting variability",
      "Optimized models for on-device inference on NVIDIA Jetson",
      "Contributed to control systems and autonomous navigation & perception modules",
    ],
    tags: ["YOLOv8", "Robotics", "Edge Inference", "NVIDIA Jetson", "ROS"],
  },
];

/** Shipped software. */
export const softwareProjects = [
  {
    slug: "die-again",
    title: "Die Again — 3D Troll Platformer",
    subtitle: "Computer Graphics & Game Design",
    image: "/projects/dieagain.png",
    codeUrl: "https://github.com/SammamMahdi/Die-Again-Troll-Game",
    liveUrl: "https://die-again-troll-game.vercel.app/",
    description:
      "A 3D platformer where dying is the puzzle. Ten themed levels, each built around a mechanic designed to deceive — progress comes from understanding hazards through repeated failure rather than reflexes.",
    highlights: [
      "Real-time WebGL rendering with Three.js, react-three-fiber, and post-processing",
      "Hardcore (3 tries/level), Practice, and Echo Dimension modes with medal tiers and 40+ achievements",
      "Firebase auth + Firestore global leaderboards with cross-device sync and offline play",
      "Procedural Web Audio synthesis — zero bundled audio files",
      "Ships as a Vercel web build and a ~13 MB Tauri 2 Windows desktop app",
    ],
    tags: ["Three.js", "React", "WebGL", "Firebase", "Tauri"],
  },
  {
    slug: "skillwise",
    title: "SkillWise — AI-Powered E-Learning & Anti-Cheat",
    subtitle: "MERN + Computer Vision",
    image: "/projects/skillwise.png",
    codeUrl: "https://github.com/SammamMahdi/SkillWise",
    description:
      "A comprehensive learning platform with an AI proctoring module that uses MediaPipe facial-landmark detection to flag academic dishonesty in real time.",
    highlights: [
      "3rd Runner-up, Software Engineering Showcase — out of 200+ teams",
      "React client + Node/Express API, with Zego integration for real-time communication",
      "Real-time proctoring via MediaPipe facial-landmark tracking",
    ],
    award: "3rd Runner-up · SWE Showcase (200+ teams)",
    tags: ["MERN", "MediaPipe", "Computer Vision", "React", "Node.js"],
  },
  {
    slug: "weheal",
    title: "WeHeal — Telemedicine & Hospital Management",
    subtitle: "Full-Stack Healthcare Platform",
    image: "/projects/weheal.png",
    codeUrl: "https://github.com/SammamMahdi/WeHeal-final",
    liveUrl: "https://weheal-frontend.onrender.com/",
    description:
      "A hospital management platform built around remote care: patients connect with licensed doctors online, book appointments, and receive consultations and prescriptions from home — with video-call scheduling built into the appointment flow.",
    highlights: [
      "Video-call scheduling for remote doctor consultations",
      "Appointment booking alongside a separate, prominent emergency pathway",
      "Bilingual English / বাংলা interface with light and dark themes",
      "Client–server split with independently deployed frontend and backend services",
    ],
    tags: ["JavaScript", "Full-Stack", "Healthcare", "Video Calling", "Telemedicine"],
  },
  {
    slug: "matrimonial-hub",
    title: "Matrimonial Hub — Matchmaking Platform",
    subtitle: "PHP · MySQL · Zero Dependencies",
    image: "/projects/matrimonial.png",
    codeUrl: "https://github.com/SammamMahdi/matrimonial-hub",
    description:
      "A matchmaking web application where users build profiles, declare partner preferences, discover matches with explainable compatibility scoring, send connection requests, and chat once matched.",
    highlights: [
      "Weighted matching algorithm that scores only on mutually declared, published fields — and explains every score",
      "Connection requests with accept / decline / withdraw, plus chat gated to matched members with read receipts",
      "Admin console: member directory, status filtering, activation/suspension, live activity metrics",
      "Security by construction: bcrypt hashing, prepared statements, CSRF tokens, session-fixation prevention, per-action authorization",
      "PHP 8.1+ and MySQL with no Composer and no framework — every dependency hand-rolled",
    ],
    tags: ["PHP", "MySQL", "Security", "Full-Stack"],
  },
  {
    slug: "journaling-fs",
    title: "Metadata Journaling File System",
    subtitle: "C · Operating Systems",
    image: "/projects/se-filesystem.svg",
    codeUrl: "https://github.com/SammamMahdi/CSE321_Project",
    description:
      "Crash-consistent metadata updates for a VSFS-like file system, written from scratch in C. Metadata changes are logged to an append-only journal before they ever touch their home locations, so a crash mid-update can never leave the file system half-written.",
    highlights: [
      "16-block append-only journal with headers, DATA records (full 4 KB block images), and COMMIT records",
      "A create command logs inode-bitmap, inode-table, and directory-entry changes to the journal without applying them — the on-disk metadata still reads the old state",
      "An install command replays committed transactions to their home locations, then clears the journal",
      "85-block image: superblock, journal space, bitmaps, inode table, and data blocks",
      "Ships with a validator that checks file-system consistency at any point",
    ],
    tags: ["C", "Operating Systems", "File Systems", "Crash Consistency", "Journaling"],
  },
  {
    slug: "librobot",
    title: "LibroBot — RFID Library Automation Robot",
    subtitle: "Embedded Robotics",
    image: "/projects/se-librobot.svg",
    codeUrl: "https://github.com/SammamMahdi/LIBRO-BOT-CSE461",
    description:
      "An autonomous book-retrieval robot using RFID localization and DC motor control for embedded library automation.",
    highlights: [
      "RFID-based localization for shelf-level book identification",
      "Arduino + ROS motor control stack",
    ],
    tags: ["Arduino", "ROS", "Robotics", "Embedded"],
  },
];

/**
 * Flat index over everything that has a detail page.
 * Cards link to /work/<slug>; the detail route reads back through findWork.
 * Slugs must stay unique across all three collections — assertUniqueSlugs
 * below fails loudly at import time rather than silently 404-ing a card.
 */
export const allWork = [
  ...publications.map((p) => ({ ...p, kind: "publication", kindLabel: "Publication" })),
  ...researchProjects.map((p) => ({ ...p, kind: "research", kindLabel: "Research" })),
  ...softwareProjects.map((p) => ({ ...p, kind: "software", kindLabel: "Project" })),
];

const seen = new Set();
for (const w of allWork) {
  if (seen.has(w.slug)) throw new Error(`Duplicate work slug: ${w.slug}`);
  seen.add(w.slug);
}

export const findWork = (slug) => allWork.find((w) => w.slug === slug);
