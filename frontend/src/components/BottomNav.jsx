import { Link, useLocation } from "react-router-dom";

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5L12 5l8 6.5V18a2 2 0 0 1-2 2h-3v-7H9v7H6a2 2 0 0 1-2-2v-6.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Zm0 0h14.5m-12 5h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 18V9m7 9V5m7 13v-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm-7 7c.6-2.7 3.2-4.6 7-4.6s6.4 1.9 7 4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { path: "/home", icon: <IconHome />, label: "Home" },
  { path: "/wallet", icon: <IconWallet />, label: "Wallet" },
  { path: "/add-cash", icon: <IconPlus />, label: "Add Cash", highlight: true },
  { path: "/results", icon: <IconChart />, label: "Results" },
];

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/add-cash") {
      return location.pathname === "/add-cash";
    }
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav emerald-bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-link ${item.highlight ? "highlight" : ""} ${isActive(item.path) ? "active" : ""}`}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
