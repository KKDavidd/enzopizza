// Firebase must be initialized before any component mounts.
// This explicit import guarantees the module runs first.
import "./lib/firebase";

import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import "./index.css";

window.addEventListener("error", (e) => {
  console.error("window.onerror:", e.error || e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("unhandledrejection:", e.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
