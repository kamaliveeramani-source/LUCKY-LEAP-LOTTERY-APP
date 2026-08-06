import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLogo from "./AppLogo";
import "./SideDrawer.css";

const menuItems = [
  { icon: "🏠", label: "Home", path: "/home" },
  { icon: "🎟", label: "Lottery", path: "/lottery" },
  { icon: "💰", label: "Wallet", path: "/wallet" },
  { icon: "🎮", label: "My Games", path: "/my-games" },
  { icon: "🎁", label: "Promotions", path: "/promotions" },
  { icon: "ℹ", label: "About Us", path: "/about" },
  { icon: "🌐", label: "Language", path: "/language-settings" },
  { icon: "⚙", label: "Settings", path: "/settings" },
];

function SideDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const isActivePath = (path) => {
    if (path === "/lottery") return pathname.startsWith("/lottery");
    if (path === "/language") return pathname === "/language" || pathname === "/language-settings";
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
            <button type="button" className="side-drawer-close" onClick={onClose}>
              ✕
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
                <span className="side-drawer-item-icon">{item.icon}</span>
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
