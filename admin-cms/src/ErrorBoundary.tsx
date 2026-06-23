// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Minimal error boundary so a crash shows a readable message on
// screen instead of a blank page. Safe to keep permanently.
// ============================================================

import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null; info: string | null };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info: info.componentStack ?? null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-screen">
          <h1>Admin app hiba</h1>
          <p><strong>Üzenet:</strong> {this.state.error.message || "(üres üzenet)"}</p>
          <p><strong>Típus:</strong> {this.state.error.name}</p>
          <p><strong>Stack:</strong></p>
          <pre>{this.state.error.stack}</pre>
          {this.state.info && (
            <>
              <p><strong>Komponens stack:</strong></p>
              <pre>{this.state.info}</pre>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
