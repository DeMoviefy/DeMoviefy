import { type ReactNode } from "react";

import Footer from "src/core/components/Footer";
import Header from "src/core/components/Header";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-page-canvas min-h-dvh bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div>
        <Header />
            <main className="px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
