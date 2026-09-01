import { type JSX } from "react";

export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800">
      <div className="w-full px-8 py-6 text-sm text-slate-500 lg:px-12">
        Copyright &copy; DeMoviefy {year}
      </div>
    </footer>
  );
}