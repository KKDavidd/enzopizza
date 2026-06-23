import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import "./index.css";

// Surface otherwise-silent startup crashes as visible text instead
// of a blank page.
window.addEventListener("error", (e) => {
  console.error("window.onerror:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("unhandledrejection:", e.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
