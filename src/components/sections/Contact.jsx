import { lazy, Suspense, useState } from "react";
import { profile } from "@/data/portfolio";
import { SectionHead, Window, ExtLink } from "@/components/term/Term";
import { useInView } from "@/hooks/useTerm";

const ENDPOINT = "https://formspree.io/f/myzjvlay";

const CHANNELS = [
  ["email", profile.email, `mailto:${profile.email}`],
  ["phone", profile.phone, `tel:${profile.phone.replace(/\s/g, "")}`],
  ["github", "SammamMahdi", profile.github],
  ["scholar", "Google Scholar", profile.scholar],
  ["linkedin", "sammam-mahdi", profile.linkedin],
  ["orcid", "0009-0005-7202-2692", "https://orcid.org/0009-0005-7202-2692"],
  ["location", profile.location, null],
];

const field =
  "w-full border border-[var(--t-faint)] bg-[var(--t-deep)] px-3 py-2 text-[0.9rem] text-[var(--t-hi)] placeholder:text-[var(--t-faint)] focus:border-[var(--t-amber)] focus:outline-none";

const Globe = lazy(() => import("@/components/viz/Globe"));

function LazyGlobe() {
  const [ref, near] = useInView({ once: true, rootMargin: "600px 0px" });
  const wait = (
    <Window title="ping dhaka">
      <div className="h-[340px]" />
    </Window>
  );
  return <div ref={ref}>{near ? <Suspense fallback={wait}><Globe /></Suspense> : wait}</div>;
}

export function Contact() {
  const [state, setState] = useState("idle"); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setState("sent");
      window.dispatchEvent(new Event("contact:sent")); // the globe flies a packet to Dhaka
    } catch {
      setState("error");
    }
  };

  return (
    <section id="contact" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="contact" title="Contact" cmd={`mail -s "hello" ${profile.handle}`}>
          <p>Open to PhD positions for Fall 2027, research collaborations, and ML engineering roles. Email is fastest.</p>
        </SectionHead>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Window title="compose" bodyClassName="p-5">
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] t-dim">
                from (name)
                <input name="name" required autoComplete="name" className={field} placeholder="Ada Lovelace" />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] t-dim">
                reply-to (email)
                <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@university.edu" />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] t-dim">
                body
                <textarea name="message" required rows={6} className={`${field} resize-y`} placeholder="Hi Sammam, …" />
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-term is-primary" disabled={state === "sending"}>
                  {state === "sending" ? "sending…" : "send ⏎"}
                </button>
                <p className="m-0 text-[0.8rem]" role="status" aria-live="polite">
                  {state === "sent" && <span className="t-amber">250 OK — message queued. I’ll reply soon.</span>}
                  {state === "error" && (
                    <span className="t-alert">
                      550 delivery failed — please email {profile.email} directly.
                    </span>
                  )}
                </p>
              </div>
            </form>
          </Window>

          <div className="grid content-start gap-6">
            <LazyGlobe />
            <Window title="channels" bodyClassName="p-5">
              <ul className="m-0 list-none space-y-2.5 p-0 text-[0.9rem]">
                {CHANNELS.map(([k, label, href]) => (
                  <li key={k} className="dotted-row">
                    <span className="t-dim">{k}</span>
                    <span className="leader" />
                    {href ? <ExtLink href={href}>{label}</ExtLink> : <span className="t-hi">{label}</span>}
                  </li>
                ))}
              </ul>
              <a href={profile.cv} download className="btn-term mt-6 w-full justify-center">
                ↓ download CV (pdf)
              </a>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--t-line)] py-10 text-[0.78rem]">
      <div className="container flex flex-wrap items-center justify-between gap-4 t-dim">
        <p className="m-0">
          © {new Date().getFullYear()} {profile.name} <span className="t-faint">·</span> built with React + three.js
        </p>
        <p className="m-0 flex flex-wrap items-center gap-3">
          <span>
            <span className="kbd">`</span> shell
          </span>
          <span>
            <span className="kbd">1</span>–<span className="kbd">7</span> sections
          </span>
          <span className="t-faint">— end of transmission —</span>
        </p>
      </div>
    </footer>
  );
}
