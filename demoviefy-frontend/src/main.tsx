import { createRoot, type Root } from "react-dom/client";
import { ErrorBoundary } from "src/core/components/ErrorBoundary";
import  App  from "src/app/App"

import "src/index.css";
import { StrictMode } from "react";
import "src/i18n";
import i18n from "src/i18n";


function StartupScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="app-shell">
      <section className="surface crash-panel">
        <span className="eyebrow">{i18n.t("startup")}</span>
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </div>
  );
}

function FatalStartupScreen({ errorMessage }: { errorMessage: string }) {
  return (
    <div className="app-shell">
      <section className="surface crash-panel">
        <span className="eyebrow">{i18n.t("startup")}</span>
        <h1>{i18n.t("frontendLoadError")}</h1>
        <p>{i18n.t("frontendLoadErrorDescription")}</p>
        <code>{errorMessage}</code>
        <div className="action-row action-row-start">
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            {i18n.t("reloadPage")}
          </button>
        </div>
      </section>
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root não encontrado no index.html.");
}

const root = createRoot(rootElement);

function renderFatal(rootInstance: Root, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : i18n.t("unknownStartupError");
  console.error("DeMoviefy startup error:", error);
  rootInstance.render(<FatalStartupScreen errorMessage={errorMessage} />);
}

window.addEventListener("error", (event) => {
  // Browsers report ResizeObserver's deferred-layout warning as a window error.
  // It is not a startup failure and must not replace the running application.
  if (event.message === "ResizeObserver loop completed with undelivered notifications.") {
    event.preventDefault();
    return;
  }
  renderFatal(root, event.error ?? new Error(event.message));
});

window.addEventListener("unhandledrejection", (event) => {
  renderFatal(root, event.reason);
});

root.render(
  <StartupScreen
    title={i18n.t("loadingDashboard")}
    message={i18n.t("preparingInterface")}
  />,
);

try {
  root.render(
    <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  renderFatal(root, error);
}
