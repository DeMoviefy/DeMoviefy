import { NavLink } from "react-router-dom";

import demoviefyLight from "src/assets/DeMoviefy-Dark.png"

type HeaderProps = {
  themeLabel: string;
  onToggleTheme: () => void;
};

export default function Header({ }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-24 w-full items-center justify-between px-8 lg:px-12">
        <NavLink to="/">
          <img
            src={demoviefyLight}
            alt="DeMoviefy"
            className="h-18 w-auto"
          />
        </NavLink>

        <nav>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `text-base transition ${isActive
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
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