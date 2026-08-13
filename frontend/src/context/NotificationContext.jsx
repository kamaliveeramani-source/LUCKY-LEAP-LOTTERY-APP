import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((type, message, title) => {
    const id = Date.now() + Math.random();
    const toast = { id, type: type || "info", message, title };
    setToasts((t) => [toast, ...t].slice(0, 6));
    // auto-remove after 4s
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const d = e.detail || {};
      notify(d.type || "info", d.message || "", d.title);
    };
    window.addEventListener("ll-notify", handler);
    return () => window.removeEventListener("ll-notify", handler);
  }, [notify]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={{ position: "fixed", zIndex: 1050, left: 0, right: 0, bottom: 18, pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, maxWidth: 520, margin: "0 auto", padding: "0 12px" }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              style={{
                pointerEvents: "auto",
                minWidth: 260,
                width: "100%",
                background: "var(--surface)",
                color: "var(--text)",
                borderRadius: 12,
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                padding: "12px 14px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                borderLeft: `4px solid ${t.type === "success" ? "#7c3aed" : t.type === "error" ? "#ef4444" : t.type === "warning" ? "#f59e0b" : "#3b82f6"}`,
              }}
            >
              <div style={{ flex: 1 }}>
                {t.title ? <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div> : null}
                <div style={{ fontSize: "0.95rem" }}>{t.message}</div>
              </div>
              <button onClick={() => remove(t.id)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export default NotificationContext;
