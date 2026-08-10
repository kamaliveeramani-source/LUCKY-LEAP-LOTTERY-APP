import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/home", icon: "🏠", label: "Home" },
  { path: "/lottery", icon: "🎲", label: "Lottery", matchPrefix: true },
  { path: "/wallet", icon: "💰", label: "Wallet" },
  { path: "/my-games", icon: "🎮", label: "Games" },
  { path: "/dashboard", icon: "👤", label: "Profile" },
];

function BottomNav() {
  const location = useLocation();

  const isActive = (path, matchPrefix) =>
    matchPrefix ? location.pathname.startsWith(path) : location.pathname === path;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-link ${isActive(item.path, item.matchPrefix) ? "active" : ""}`}
        >
          <span className="bottom-nav-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default BottomNav;
