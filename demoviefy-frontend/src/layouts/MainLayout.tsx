import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import Footer from "src/core/components/Footer";
import Header from "src/core/components/Header";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isVideo = pathname.startsWith("/video/");

  return (
    <div className={isHome || isVideo ? "min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100" : ""}>
      <div>
        <Header />
            <main className="px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
