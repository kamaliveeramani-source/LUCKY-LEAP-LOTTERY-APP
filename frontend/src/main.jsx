import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme } from "./theme";
import { NotificationProvider } from "./context/NotificationContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./styles/Components.css";
import "./styles/Auth.css";
import "./styles/Dashboard.css";

applyTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
);