import { Link, useLocation } from "react-router-dom";
import { sections } from "@/data/portfolio";

export default function NotFound({ path }) {
  const { pathname } = useLocation();
  const where = path || pathname;
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-xl text-sm">
        <p className="font-display text-[6rem] leading-none t-hi glow-strong">404</p>
        <p className="mt-4 t-text">
          <span className="t-amber">sammam@lab</span>
          <span className="t-faint">:~$ </span>cd {where}
        </p>
        <p className="t-alert">bash: cd: {where}: No such file or directory</p>
        <p className="mt-4 t-dim">did you mean one of these?</p>
        <ul className="mt-1 list-none space-y-0.5 p-0">
          {sections.map((s) => (
            <li key={s.id}>
              <Link to={`/#${s.id}`} className="link-term">
                ~/{s.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link to="/" className="btn-term is-primary">
            cd ~
          </Link>
        </p>
      </div>
    </main>
  );
}
