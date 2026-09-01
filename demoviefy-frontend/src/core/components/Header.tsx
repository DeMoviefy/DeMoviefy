import { NavLink } from "react-router-dom";

import demoviefyLight from "src/assets/DeMoviefy-Dark.png"

type HeaderProps = {
  themeLabel: string;
  onToggleTheme: () => void;
};

export default function Header({ }: HeaderProps) {
  return (<header className="border-b border-slate-800">
    <div className="mx-auto flex h-20 w-full items-center justify-between px-8 lg:px-12">
      <NavLink to="/">
        <img
          src={demoviefyLight}
          alt="DeMoviefy"
          className="h-14 w-auto"
        />
      </NavLink>

      <nav>
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `text-sm transition ${isActive
              ? "text-white"
              : "text-slate-400 hover:text-white"
            }`
          }
        >
          Upload
        </NavLink>
      </nav>
    </div>
  </header>
  );
}