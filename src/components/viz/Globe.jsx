import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { Window } from "@/components/term/Term";

const DHAKA = { lat: 23.81, lon: 90.41 };
// time zone → a representative city; anything else falls back to the UTC offset
const TZ = {
  "America/New_York": [40.71, -74.01, "New York"], "America/Toronto": [43.65, -79.38, "Toronto"],
  "America/Chicago": [41.88, -87.63, "Chicago"], "America/Denver": [39.74, -104.99, "Denver"],
  "America/Los_Angeles": [34.05, -118.24, "Los Angeles"], "America/Vancouver": [49.28, -123.12, "Vancouver"],
  "America/Phoenix": [33.45, -112.07, "Phoenix"], "America/Mexico_City": [19.43, -99.13, "Mexico City"],
  "America/Sao_Paulo": [-23.55, -46.63, "São Paulo"], "America/Bogota": [4.71, -74.07, "Bogotá"],
  "Europe/London": [51.51, -0.13, "London"], "Europe/Dublin": [53.35, -6.26, "Dublin"],
  "Europe/Paris": [48.86, 2.35, "Paris"], "Europe/Berlin": [52.52, 13.4, "Berlin"],
  "Europe/Amsterdam": [52.37, 4.9, "Amsterdam"], "Europe/Zurich": [47.38, 8.54, "Zürich"],
  "Europe/Madrid": [40.42, -3.7, "Madrid"], "Europe/Rome": [41.9, 12.5, "Rome"],
  "Europe/Stockholm": [59.33, 18.07, "Stockholm"], "Europe/Helsinki": [60.17, 24.94, "Helsinki"],
  "Europe/Istanbul": [41.01, 28.98, "Istanbul"], "Europe/Moscow": [55.76, 37.62, "Moscow"],
  "Africa/Cairo": [30.04, 31.24, "Cairo"], "Africa/Lagos": [6.52, 3.38, "Lagos"],
  "Africa/Johannesburg": [-26.2, 28.05, "Johannesburg"], "Africa/Nairobi": [-1.29, 36.82, "Nairobi"],
  "Asia/Dubai": [25.2, 55.27, "Dubai"], "Asia/Riyadh": [24.71, 46.68, "Riyadh"], "Asia/Qatar": [25.29, 51.53, "Doha"],
  "Asia/Karachi": [24.86, 67.0, "Karachi"], "Asia/Kolkata": [28.61, 77.21, "Delhi"], "Asia/Calcutta": [22.57, 88.36, "Kolkata"],
  "Asia/Kathmandu": [27.72, 85.32, "Kathmandu"], "Asia/Dhaka": [23.81, 90.41, "Dhaka"],
  "Asia/Bangkok": [13.76, 100.5, "Bangkok"], "Asia/Singapore": [1.35, 103.82, "Singapore"],
  "Asia/Kuala_Lumpur": [3.14, 101.69, "Kuala Lumpur"], "Asia/Jakarta": [-6.2, 106.85, "Jakarta"],
  "Asia/Shanghai": [31.23, 121.47, "Shanghai"], "Asia/Hong_Kong": [22.32, 114.17, "Hong Kong"],
  "Asia/Taipei": [25.03, 121.57, "Taipei"], "Asia/Seoul": [37.57, 126.98, "Seoul"], "Asia/Tokyo": [35.68, 139.69, "Tokyo"],
  "Australia/Sydney": [-33.87, 151.21, "Sydney"], "Australia/Melbourne": [-37.81, 144.96, "Melbourne"],
  "Australia/Perth": [-31.95, 115.86, "Perth"], "Pacific/Auckland": [-36.85, 174.76, "Auckland"],
};

function guessVisitor() {
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    /* ignore */
  }
  const hit = TZ[tz];
  const off = -new Date().getTimezoneOffset() / 60;
  if (hit) return { lat: hit[0], lon: hit[1], label: hit[2], off, exact: true };
  return { lat: 25, lon: Math.max(-179, Math.min(179, off * 15)), label: `UTC${off >= 0 ? "+" : ""}${off}`, off, exact: false };
}

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false });

function greatCircleKm(a, b) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export default function Globe() {
  const reduced = useReducedMotion();
  const visitor = useMemo(guessVisitor, []);
  const local = visitor.label === "Dhaka";
  const [now, setNow] = useState(() => new Date());
  const [pinged, setPinged] = useState(false);
  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) =>
    import("@/three/GlobeScene").then(({ GlobeScene }) => new GlobeScene(canvas, { reducedMotion: reduced, visitor: local ? null : visitor }))
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    const sent = () => stageRef.current?.fire();
    window.addEventListener("contact:sent", sent);
    return () => {
      clearInterval(id);
      window.removeEventListener("contact:sent", sent);
    };
  }, [stageRef]);

  const km = greatCircleKm(visitor, DHAKA);
  const rtt = ((2 * km) / 200000) * 1000; // light in fibre ≈ 200,000 km/s
  const dh = 6 - visitor.off;
  const hour = Number(fmt.format(now).slice(0, 2));
  const night = hour < 6 || hour >= 19;

  return (
    <Window
      title="ping dhaka"
      right={
        !local && (
          <button
            type="button"
            className="btn-term is-sm"
            onClick={() => {
              stageRef.current?.fire();
              setPinged(true);
            }}
          >
            ▶ ping
          </button>
        )
      }
    >
      <div ref={wrapRef} className="relative h-[260px] bg-[var(--t-deep)]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="3D globe with Dhaka and your approximate location. Drag to rotate."
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
        />
        {status !== "ready" && <div className="absolute inset-0 flex items-center justify-center text-xs t-dim">loading globe…</div>}
        <div className="pointer-events-none absolute left-3 top-2 text-[0.65rem] uppercase tracking-[0.14em] t-dim">
          live day / night · drag to spin
        </div>
      </div>
      <div className="space-y-1 border-t border-[var(--t-line)] px-3 py-2 text-[0.75rem]">
        <div className="flex justify-between">
          <span className="t-dim">Dhaka now</span>
          <span className="tabular-nums t-hi">
            {fmt.format(now)} <span className="t-dim">· {night ? "night" : "day"}</span>
          </span>
        </div>
        {local ? (
          <div className="t-amber">You’re in Dhaka too — no packet needed.</div>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="t-dim">you, roughly</span>
              <span className="t-text">
                {visitor.label}
                {dh !== 0 && <span className="t-dim"> · Dhaka is {Math.abs(dh)} h {dh > 0 ? "ahead" : "behind"}</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="t-dim">distance</span>
              <span className="tabular-nums t-text">
                {Math.round(km).toLocaleString()} km{" "}
                {pinged && <span className="t-amber">· rtt ≥ {Math.round(rtt)} ms</span>}
              </span>
            </div>
          </>
        )}
        <div className="pt-1 text-[0.66rem] t-faint">
          {visitor.exact ? "Location guessed from your time zone only." : "Location guessed from your UTC offset only."} The ping’s
          floor is light in fibre over the great-circle distance and back.
        </div>
      </div>
    </Window>
  );
}
