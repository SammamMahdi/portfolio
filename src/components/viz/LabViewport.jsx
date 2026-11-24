import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { LabScene } from "@/three/LabScene";
import { sampleScene, buildEnsemble, detections, CAMERAS, TRAIN_FOV } from "@/three/labData";
import { I3D, interveneScene, separability } from "@/three/labExtra";
import { LAYERS, COST, CUTOFF, keysRead } from "@/data/lmsa";
import { Window, Readout, ExtLink } from "@/components/term/Term";
import { SparsePlot } from "./SparsePlot";
import { DristeeMap } from "./DristeeMap";

const TABS = [
  { id: "revar3r", tag: "ReVar3R", label: "3D uncertainty" },
  { id: "camdet", tag: "CAMDet", label: "metric 3D perception" },
  { id: "dristee", tag: "DRISTEE", label: "assistive navigation" },
  { id: "lmsa", tag: "LMSA", label: "faster 3D attention" },
  { id: "intervene3d", tag: "Intervene3D", label: "knowing when to abstain" },
];
const POV_TABS = ["camdet", "intervene3d"];
const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

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
  const [layer, setLayer] = useState(1);
  const [playing, setPlaying] = useState(!reduced);
  const [nViews, setNViews] = useState(32);
  const [range, setRange] = useState(I3D.ranges[0]);
  const [move, setMove] = useState(0);

  const iSc = useMemo(() => interveneScene(), []);
  const sepNow = separability(iSc, move);
  const sepBest = separability(iSc, range);

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
  useEffect(() => { stageRef.current?.setLmsaLayer(layer); }, [layer, status, stageRef]);
  useEffect(() => { stageRef.current?.setInterMove(move); }, [move, status, stageRef]);
  useEffect(() => { stageRef.current?.setInterRange(range); }, [range, status, stageRef]);
  // the layer sweep plays on its own until the user takes over
  useEffect(() => {
    if (tab !== "lmsa" || !playing) return;
    const id = setInterval(() => setLayer((l) => (l + 1) % 24), 1300);
    return () => clearInterval(id);
  }, [tab, playing]);

  // paper cards further down can open a tab here
  // switching tabs drops back to the orbit view
  const pick = (id) => {
    setTab(id);
    if (!POV_TABS.includes(id)) setPov(false);
  };
  useEffect(() => {
    const open = (e) => {
      if (!TABS.some((t) => t.id === e.detail)) return;
      setTab(e.detail);
      if (!POV_TABS.includes(e.detail)) setPov(false);
    };
    window.addEventListener("lab:open", open);
    return () => window.removeEventListener("lab:open", open);
  }, []);

  const mode = align ? "aligned" : "raw";
  const overlay = {
    revar3r: align ? `K=${ens.K} runs · registered to run 0` : `K=${ens.K} runs · each in its own Sim(3) gauge`,
    camdet: pov ? `through ${cam.label.toLowerCase()} camera · ${cam.fov}°` : `world view · ${cam.label.toLowerCase()} camera selected`,
    lmsa: `global layer ${layer} · ${LAYERS[layer].kind === "exact" ? "matching · exact attention" : `diffuse · ${LAYERS[layer].hubs} shared hubs`}`,
    intervene3d: pov ? `through the moved camera · ${move >= 0 ? "+" : "−"}${Math.abs(move * 100).toFixed(1)} cm` : "world view · screen on the wall, corridor behind it",
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
              onClick={() => pick(t.id)}
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
            {tab === "lmsa" && (
              <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 text-[0.65rem]">
                <span className="t-alert">● query &amp; its view</span>
                <span className="t-hi">● keys it reads</span>
                <span className="t-dim">● keys it skips</span>
              </div>
            )}
            {tab === "intervene3d" && (
              <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 text-[0.65rem]">
                <span className="t-hi">● screen (H_E)</span>
                <span className="t-amber">● real corridor (H_D)</span>
                <span className="t-alert">▬ disagreement</span>
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

          {tab === "lmsa" && (
            <>
              <h3 className="text-base t-hi">Not every layer needs every view.</h3>
              <p className="mt-2 leading-relaxed t-text">
                A 3D reconstruction transformer lets every token look at every token in every view, which gets slow as views
                pile up. Most layers only need the gist of the other views, so LMSA lets them read their own view plus a few
                hundred shared <span className="t-hi">hub</span> keys. A handful of layers match the same point across views;
                those keep <span className="t-hi">exact</span> attention. One statistic, fixed in advance, tells them apart.
              </p>
              <div className="mt-4">
                <div className="flex h-12 items-end gap-[2px]" role="group" aria-label="Global layer">
                  {LAYERS.map((L) => (
                    <button
                      key={L.l}
                      type="button"
                      aria-label={`layer ${L.l}`}
                      aria-pressed={layer === L.l}
                      onClick={() => {
                        setPlaying(false);
                        setLayer(L.l);
                      }}
                      className="relative flex-1 cursor-pointer"
                      style={{ height: `${(Math.min(L.stat, 2.6) / 2.6) * 100}%` }}
                    >
                      <span
                        className={`absolute inset-0 ${L.kind === "exact" ? "bg-[var(--t-hi)]" : "bg-[var(--t-amber)]"} ${layer === L.l ? "opacity-100" : "opacity-40"}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="relative -mt-[calc(3rem*0.577)] h-0 border-t border-dashed border-[var(--t-alert)]" aria-hidden="true" />
                <div className="mt-[calc(3rem*0.577)] flex justify-between text-[0.65rem] t-faint">
                  <span>layer 0</span>
                  <span className="t-alert">cut-off {CUTOFF}</span>
                  <span>23</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn-term is-sm" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
                  {playing ? "❚❚ pause" : "▶ play layers"}
                </button>
                {COST.map((c) => (
                  <button key={c.n} type="button" className="btn-term is-sm" aria-pressed={nViews === c.n} onClick={() => setNViews(c.n)}>
                    N={c.n}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-1">
                <Readout k="this layer" v={LAYERS[layer].kind === "exact" ? <span className="t-hi">matching · exact</span> : <span className="t-amber">diffuse · {LAYERS[layer].hubs} hubs</span>} />
                <Readout k={`keys per query · dense, N=${nViews}`} v={fmtK(nViews * 1041)} />
                <Readout k="keys per query · LMSA, this layer" v={<span className="t-hi">≈{fmtK(keysRead(LAYERS[layer], nViews))}</span>} />
                {(() => {
                  const c = COST.find((x) => x.n === nViews);
                  return <Readout k="GFLOP per token · dense → LMSA" v={`${c.dense} → ${c.lmsa}`} />;
                })()}
              </div>
              <p className="mt-3 text-[0.72rem] t-faint">
                In the 3D view, hubs are drawn at about one in twenty; in a matching layer the bright rays point to the cameras
                that see the same point.
              </p>
            </>
          )}

          {tab === "intervene3d" && (
            <>
              <h3 className="text-base t-hi">Same image. Is it a screen or a real corridor?</h3>
              <p className="mt-2 leading-relaxed t-text">
                From the starting camera, a <span className="t-hi">screen</span> showing a corridor and a{" "}
                <span className="t-amber">real corridor</span> give the same pixels. Move the camera and they shift by
                different amounts. Intervene3D picks the move that separates the explanations most; if no allowed move
                separates them enough, it <span className="t-alert">abstains</span> instead of guessing.
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Allowed motion">
                {I3D.ranges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="btn-term is-sm"
                    aria-pressed={range === r}
                    onClick={() => {
                      setRange(r);
                      setMove((m) => Math.max(-r, Math.min(r, m)));
                    }}
                  >
                    allowed ±{(r * 100).toFixed(0)} cm
                  </button>
                ))}
                <button type="button" className="btn-term is-sm" onClick={() => setMove(range)}>
                  ★ best move
                </button>
                <button type="button" className="btn-term is-sm" aria-pressed={pov} onClick={() => setPov((p) => !p)}>
                  ◉ look through it
                </button>
              </div>
              <label className="mt-4 block text-[0.72rem] t-dim">
                camera move: {move >= 0 ? "+" : "−"}
                {Math.abs(move * 100).toFixed(1)} cm
                <input
                  type="range"
                  min={-range}
                  max={range}
                  step={range / 50}
                  value={move}
                  onChange={(e) => setMove(parseFloat(e.target.value))}
                  className="mt-1 block w-full accent-[var(--t-amber)]"
                />
              </label>
              <div className="mt-3 space-y-1">
                <Readout k="separability now" v={`${sepNow.toFixed(1)} px`} />
                <Readout k="best allowed move" v={`${sepBest.toFixed(1)} px`} />
                <Readout k="threshold τ" v={`${I3D.tau} px`} />
                <Readout
                  k="decision"
                  v={sepBest >= I3D.tau ? <span className="t-hi">answer: screen · first surface at the panel</span> : <span className="t-alert">abstain</span>}
                />
              </div>
              <p className="mt-3 text-[0.78rem] leading-relaxed t-dim">
                {sepBest >= I3D.tau
                  ? "The red streaks on the screen show where the real corridor would now appear. They are long enough to rule it out."
                  : "Within ±2 cm the two explanations stay within a few pixels of each other, so any answer would be a guess. Allow a bigger move."}
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
      {tab === "lmsa" && (
        <Footnote
          label="from the paper"
          href="https://arxiv.org/abs/2611.23554"
          to="/work/lmsa"
          note="the six views, the point cloud and the hub picks were made for this page; layer roles, hub counts, key counts and costs follow the paper."
        >
          Training-free. On 13 unseen low-overlap scenes with 32 views, LMSA stays within 1.4 AUC@5 of dense attention
          (AVGGT loses 10.3, SAF3R 4.5); with 100 views it stays within 1.9 while the aggregator runs 2.0× faster. Under
          review at CVPR.
        </Footnote>
      )}
      {tab === "intervene3d" && (
        <Footnote
          label="from the paper"
          href="https://arxiv.org/abs/2611.26056"
          to="/work/intervene3d"
          note="toy geometry with two hypotheses; the pixel threshold and room were made for this page. The paper also models mirrors and glass panes."
        >
          Without abstention the method answers confidently on 76.4% of unresolvable synthetic scenes; with it, on none. On
          real displays, one executed camera move cuts the median surface error of twelve depth networks by 31.5%. Under
          review at ICLR.
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
