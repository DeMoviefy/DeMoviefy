import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "src/i18n";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || i18n.t("uiError"),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("DeMoviefy UI error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <section className="surface crash-panel">
            <span className="eyebrow">{i18n.t("interface")}</span>
            <h1>{i18n.t("uiError")}</h1>
            <p>{i18n.t("uiErrorDescription")}</p>
            <code>{this.state.errorMessage}</code>
            <div className="action-row action-row-start">
              <button type="button" className="primary-button" onClick={this.handleReload}>
                {i18n.t("reloadPage")}
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
