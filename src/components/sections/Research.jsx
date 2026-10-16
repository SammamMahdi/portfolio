import { lazy, Suspense } from "react";
import { profile } from "@/data/portfolio";
import { SectionHead, Window } from "@/components/term/Term";

const LabViewport = lazy(() => import("@/components/viz/LabViewport"));

function LabLoading() {
  return (
    <Window title="key research interests">
      <div className="flex h-[440px] items-center justify-center text-sm t-dim lg:h-[520px]">
        loading demos<span className="cursor" aria-hidden="true" />
      </div>
    </Window>
  );
}

export function Research() {
  return (
    <section id="research" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="research" title="Research" cmd="cat research/statement.md">
          <p>
            My work spans computer vision and machine learning in several directions:{" "}
            <span className="t-hi">3D reconstruction and metric perception</span>,{" "}
            <span className="t-hi">uncertainty estimation</span>,{" "}
            <span className="t-hi">explainable AI for healthcare</span> — from facial images to physiological signals and
            cytology — <span className="t-hi">assistive interfaces</span>, <span className="t-hi">robot perception</span>,{" "}
            <span className="t-hi">multimodal agents</span> and <span className="t-hi">media forensics</span>.
          </p>
          <p className="mt-3 t-dim">My key research interests, live below — and every paper further down has its own demo.</p>
        </SectionHead>

        <ul className="mb-8 flex flex-wrap gap-2" aria-label="Research interests">
          {profile.interests.map((x) => (
            <li key={x} className="chip is-on">
              {x}
            </li>
          ))}
        </ul>

        <Suspense fallback={<LabLoading />}>
          <LabViewport />
        </Suspense>
      </div>
    </section>
  );
}
