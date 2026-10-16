import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { LabScene } from "@/three/LabScene";
import { sampleScene, buildEnsemble, detections, CAMERAS, TRAIN_FOV } from "@/three/labData";
import { Window, Readout, ExtLink } from "@/components/term/Term";
import { SparsePlot } from "./SparsePlot";
import { DristeeMap } from "./DristeeMap";

const TABS = [
  { id: "revar3r", tag: "ReVar3R", label: "3D uncertainty" },
  { id: "camdet", tag: "CAMDet", label: "metric 3D perception" },
  { id: "dristee", tag: "DRISTEE", label: "assistive navigation" },
];

const cm = (m) => `${(m * 100).toFixed(1)} cm`;

/** Footer strip: what the paper actually reports, next to what this demo is (and is not). */
function Footnote({ label, children, to, href, note }) {
  return (
    <div className="grid border-t border-[var(--t-line)] text-[0.8rem] leading-relaxed md:grid-cols-[1.45fr_1fr]">
      <div className="bg-[var(--t-ghost)] p-4 md:border-r md:border-[var(--t-line)]">
        <div className="mb-1 text-[0.65rem] uppercase tracking-[0.18em] t-amber">{label}</div>
        <p className="m-0 t-text">{children}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 text-xs">
          {href && <ExtLink href={href}>arXiv</ExtLink>}
          {to && (
            <Link to={to} className="link-term">
              details →
            </Link>
          )}
        </div>
      </div>
      <p className="m-0 p-4 text-[0.74rem] t-dim">
        <span className="t-amber">about this demo › </span>
        {note}
      </p>
    </div>
  );
}

export default function LabViewport() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState("revar3r");
  const [align, setAlign] = useState(false);
  const [seed, setSeed] = useState(3);
  const [camId, setCamId] = useState("normal");
  const [pov, setPov] = useState(false);
  const [roomSeed, setRoomSeed] = useState(1);

  const scene = useMemo(() => sampleScene(1), []);
  const ens = useMemo(() => buildEnsemble(scene, { seed }), [scene, seed]);
  const cam = CAMERAS.find((c) => c.id === camId);
  const dets = useMemo(() => detections(cam), [cam]);

  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) => {
    const s = new LabScene(canvas, { reducedMotion: reduced, onPovExit: () => setPov(false) });
    s.setGtCloud(scene.gt);
    return s;
  });

  useEffect(() => { stageRef.current?.setEnsemble(ens); }, [ens, status, stageRef]);
  useEffect(() => { stageRef.current?.setAlign(align); }, [align, status, stageRef]);
  useEffect(() => { if (tab !== "dristee") stageRef.current?.setDemo(tab); }, [tab, status, stageRef]);
  useEffect(() => { stageRef.current?.setCamera(camId); }, [camId, status, stageRef]);
  useEffect(() => { stageRef.current?.setPov(pov); }, [pov, status, stageRef]);

  // paper cards further down can open a tab here
  useEffect(() => {
    const open = (e) => TABS.some((t) => t.id === e.detail) && setTab(e.detail);
    window.addEventListener("lab:open", open);
    return () => window.removeEventListener("lab:open", open);
  }, []);

  const mode = align ? "aligned" : "raw";
  const overlay = {
    revar3r: align ? `K=${ens.K} runs · registered to run 0` : `K=${ens.K} runs · each in its own Sim(3) gauge`,
    camdet: pov ? `through ${cam.label.toLowerCase()} camera · ${cam.fov}°` : `world view · ${cam.label.toLowerCase()} camera selected`,
  }[tab];

  return (
    <Window
      id="lab"
      title="key research interests"
      right={
        <div role="tablist" aria-label="Demo" className="flex flex-wrap justify-end gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className="btn-term is-sm"
            >
              {t.label} <span className="opacity-60">· {t.tag}</span>
            </button>
          ))}
        </div>
      }
    >
      <div className="grid lg:grid-cols-[1.45fr_1fr]">
        {/* viewport */}
        <div className="relative min-w-0 border-b border-[var(--t-line)] lg:border-b-0 lg:border-r">
          <div ref={wrapRef} className={`relative h-[360px] bg-[var(--t-deep)] sm:h-[440px] lg:h-full lg:min-h-[500px] ${tab === "dristee" ? "hidden" : ""}`}>
            <canvas
              ref={canvasRef}
              tabIndex={0}
              aria-label="Interactive 3D research demo. Drag or use the arrow keys to orbit."
              className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--t-amber)] active:cursor-grabbing"
            />
            <div className="pointer-events-none absolute left-3 top-2 text-[0.65rem] uppercase tracking-[0.16em] t-dim">{overlay}</div>
            <div className="pointer-events-none absolute bottom-2 right-3 text-[0.65rem] t-faint">
              {status === "failed" ? "webgl unavailable" : status === "loading" ? "loading…" : "drag to orbit"}
            </div>
            {tab === "camdet" && (
              <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 text-[0.65rem]">
                <span className="t-dim">┄ ground truth</span>
                <span className="t-alert">▬ intrinsics-blind</span>
                <span className="t-amber">▬ intrinsics-conditioned</span>
              </div>
            )}
            {tab === "revar3r" && (
              <div className="pointer-events-none absolute bottom-2 left-3 flex items-center gap-2 text-[0.65rem] t-dim">
                <span>low spread</span>
                <span className="h-1.5 w-16 bg-gradient-to-r from-[var(--t-lo)] via-[var(--t-amber)] to-[var(--t-hi)]" />
                <span>high</span>
              </div>
            )}
          </div>
          {tab === "dristee" && (
            <div className="p-4 sm:p-5">
              <DristeeMap seed={roomSeed} />
            </div>
          )}
        </div>

        {/* panel */}
        <div className="min-w-0 p-5 text-sm">
          {tab === "revar3r" && (
            <>
              <h3 className="text-base t-hi">Is the model unsure — or just in a different frame?</h3>
              <p className="mt-2 leading-relaxed t-text">
                Run a frozen 3D model several times under small input perturbations and the per-point spread is a free
                uncertainty estimate. But every run comes back in its own similarity frame — rotated, scaled, shifted — so
                raw spread mostly measures that gauge. ReVar3R aligns the runs first.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-term is-sm" aria-pressed={!align} onClick={() => setAlign(false)}>
                  raw runs
                </button>
                <button type="button" className="btn-term is-sm" aria-pressed={align} onClick={() => setAlign(true)}>
                  align Sim(3)
                </button>
                <button type="button" className="btn-term is-sm" onClick={() => setSeed((s) => s + 1)}>
                  ↻ re-roll
                </button>
              </div>
              <div className="mt-4 space-y-1">
                <Readout k="true noise σ (mean)" v={cm(ens.meanSigma)} />
                <Readout k="spread · raw" v={<span className={align ? "t-dim" : "t-alert"}>{cm(ens.meanRaw)}</span>} />
                <Readout k="spread · aligned" v={<span className={align ? "t-hi" : "t-dim"}>{cm(ens.meanAligned)}</span>} />
                <Readout k="AUSE · raw → aligned" v={`${ens.raw_.ause.toFixed(3)} → ${ens.aligned_.ause.toFixed(3)}`} />
              </div>
              <div className="mt-3">
                <SparsePlot raw={ens.raw_} aligned={ens.aligned_} mode={mode} />
                <p className="mt-1 text-[0.68rem] t-faint">
                  error left after dropping the most-uncertain points first; shaded gap to the dashed oracle = AUSE (lower is better)
                </p>
              </div>
            </>
          )}

          {tab === "camdet" && (
            <>
              <h3 className="text-base t-hi">Same pixels, different lens, different distance.</h3>
              <p className="mt-2 leading-relaxed t-text">
                A telephoto makes things look close; a wide lens makes them look far. A detector that ignores the camera
                intrinsics guesses range from apparent size, so its boxes slide along the viewing ray whenever the focal
                length differs from training. CAMDet conditions its features on the intrinsics.
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Camera">
                {CAMERAS.map((c) => (
                  <button key={c.id} type="button" className="btn-term is-sm" aria-pressed={camId === c.id} onClick={() => setCamId(c.id)}>
                    {c.label.toLowerCase()} {c.fov}°
                  </button>
                ))}
                <button type="button" className="btn-term is-sm" aria-pressed={pov} onClick={() => setPov((p) => !p)}>
                  ◉ look through it
                </button>
              </div>
              <table className="mt-4 w-full text-left text-[0.8rem] tabular-nums">
                <thead>
                  <tr className="text-[0.65rem] uppercase tracking-[0.12em] t-dim">
                    <th className="pb-1 font-normal">object</th>
                    <th className="pb-1 text-right font-normal">true</th>
                    <th className="pb-1 text-right font-normal t-alert">blind</th>
                    <th className="pb-1 text-right font-normal t-amber">cond.</th>
                  </tr>
                </thead>
                <tbody>
                  {dets.map((d) => (
                    <tr key={d.name} className="border-t border-[var(--t-line)]">
                      <td className="py-1 t-text">{d.name}</td>
                      <td className="py-1 text-right t-hi">{d.z.toFixed(2)} m</td>
                      <td className="py-1 text-right t-alert">{d.blind.z.toFixed(2)} m</td>
                      <td className="py-1 text-right t-amber">{d.cond.z.toFixed(2)} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[0.78rem] leading-relaxed t-dim">
                {camId === "normal"
                  ? `At the training focal length (${TRAIN_FOV}°) both agree — the failure only shows on a new camera.`
                  : pov
                    ? "From the camera, the orange and amber boxes cover the same pixels. The image alone cannot tell them apart."
                    : `Blind ranges are off by ×${(dets[0].blind.z / dets[0].z).toFixed(2)} on this lens. Try “look through it”.`}
              </p>
            </>
          )}

          {tab === "dristee" && (
            <>
              <h3 className="text-base t-hi">One RGB camera, turned into a walkable map.</h3>
              <p className="mt-2 leading-relaxed t-text">
                DRISTEE fuses CAMDet’s metric 3D detections with MASt3R-SLAM into a metric traversability map, plans a path
                around obstacles, and speaks short guidance. It also describes scenes with a VLM, recognises faces, reads text,
                and takes voice commands.
              </p>
              <p className="mt-3 text-[0.78rem] t-dim">Click any free cell to send the user somewhere else.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn-term is-sm" onClick={() => setRoomSeed((s) => s + 1)}>
                  ↻ new room
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {tab === "revar3r" && (
        <Footnote
          label="from the paper"
          href="https://arxiv.org/abs/2610.07883"
          to="/work/revar3r"
          note="a small simulation written for this page (≈1.5k points, 6 runs). The numbers in the panel come from the toy, not the paper."
        >
          Training-free and label-free, gauge-aligned variance gets lower AUSE than the models’ built-in confidence in 11 of
          18 backbone–dataset conditions (15 of 18 with held-out fusion) across VGGT, MASt3R and π³ on six datasets.
        </Footnote>
      )}
      {tab === "camdet" && (
        <Footnote
          label="from the paper"
          to="/work/camdet"
          note="an illustration of the failure mode. “Conditioned” boxes carry small synthetic residuals; nothing here is model output."
        >
          On sensors held out from training, CAMDet beats a Cube R-CNN-style virtual-depth control by 6.3 AP3D@0.25 on SUN
          RGB-D, and one checkpoint runs unmodified from a desktop GPU to a Jetson Orin Nano. Under review at IEEE TIP.
        </Footnote>
      )}
      {tab === "dristee" && (
        <Footnote
          label="the thesis"
          to="/work/dristee"
          note="schematic. The room, planner and wording were written for this page; it is not recorded sensor data."
        >
          Undergraduate thesis, first author, grade A+, funded by BRAC University’s Research Seed Grant Initiative (RSGI).
        </Footnote>
      )}
    </Window>
  );
}
