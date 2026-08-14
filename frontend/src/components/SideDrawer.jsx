import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLogo from "./AppLogo";
import "./SideDrawer.css";

function DrawerIcon({ type }) {
  const props = { viewBox: "0 0 24 24", "aria-hidden": true };
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" };

  switch (type) {
    case "home":
      return <svg {...props}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" {...stroke} /></svg>;
    case "lottery":
      return <svg {...props}><path d="M7 4h10v16l-5-3-5 3V4Z" {...stroke} /></svg>;
    case "wallet":
      return <svg {...props}><path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Zm14 4.5h3v3h-3a1.5 1.5 0 1 1 0-3Z" {...stroke} /></svg>;
    case "add-cash":
      return <svg {...props}><path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "games":
      return <svg {...props}><path d="M8 9h2M14 9h2M9.5 12.5h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M7.5 6.5h9a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-1.2l-2.3 2.3a1 1 0 0 1-1.7-.7V17.5H7.5a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4Z" {...stroke} /></svg>;
    case "promotions":
      return <svg {...props}><path d="M12 3l2.2 4.5L19 8.3l-3.5 3.4.8 4.9L12 14.8 7.7 16.6l.8-4.9L5 8.3l4.8-.8L12 3Z" {...stroke} /></svg>;
    case "about":
      return <svg {...props}><circle cx="12" cy="12" r="8.5" {...stroke} /><path d="M12 10v5M12 8h.01" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
    case "language":
      return <svg {...props}><circle cx="12" cy="12" r="8.5" {...stroke} /><path d="M3 12h18M12 3.5a14 14 0 0 1 0 17M12 3.5a14 14 0 0 0 0 17" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="3" {...stroke} /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  }
}

const menuItems = [
  { icon: "home", label: "Home", path: "/home" },
  { icon: "lottery", label: "Lottery", path: "/lottery" },
  { icon: "wallet", label: "Wallet", path: "/wallet" },
  { icon: "add-cash", label: "Add Cash", path: "/add-cash" },
  { icon: "games", label: "My Games", path: "/my-games" },
  { icon: "promotions", label: "Promotions", path: "/promotions" },
  { icon: "about", label: "About Us", path: "/about" },
  { icon: "language", label: "Language", path: "/language-settings" },
  { icon: "settings", label: "Settings", path: "/settings" },
];

function SideDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const isActivePath = (path) => {
    if (path === "/lottery") return pathname.startsWith("/lottery");
    if (path === "/language-settings") return pathname === "/language" || pathname === "/language-settings";
    if (path === "/") return pathname === "/";
    return pathname === path;
  };

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }

    if (mounted) {
      setClosing(true);
      const timeout = window.setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 300);
      return () => window.clearTimeout(timeout);
    }
  }, [open, mounted]);

  if (!mounted) return null;

  const drawerClass = ["side-drawer", open && !closing ? "side-drawer-enter" : "side-drawer-exit"].filter(Boolean).join(" ");

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="side-drawer-backdrop" onClick={onClose}>
      <aside className={drawerClass} onClick={(event) => event.stopPropagation()}>
        <div className="side-drawer-inner">
          <div className="side-drawer-top">
            <div className="side-drawer-brand">
              <AppLogo compact />
            </div>
            <button type="button" className="side-drawer-close" onClick={onClose} aria-label="Close menu">
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="side-drawer-menu">
            {menuItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={`side-drawer-item ${isActivePath(item.path) ? "active" : ""}`}
                onClick={() => handleNavigate(item.path)}
              >
                <span className="side-drawer-item-icon">
                  <DrawerIcon type={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="side-drawer-support">
            <div className="side-drawer-support-title">Support</div>
            <a className="side-drawer-support-link" href="mailto:support@luckyleap.com">
              support@luckyleap.com
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SideDrawer;
