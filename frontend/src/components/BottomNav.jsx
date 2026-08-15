import { Link, useLocation } from "react-router-dom";

function NavIcon({ type }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 10.75 12 4.5l8 6.25V20a1.25 1.25 0 0 1-1.25 1.25H15v-6.5H9v6.5H5.25A1.25 1.25 0 0 1 4 20v-9.25Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 8.25A2.25 2.25 0 0 1 6.25 6h11.5A2.25 2.25 0 0 1 20 8.25V9h1a2.25 2.25 0 0 1 2.25 2.25v6.5A2.25 2.25 0 0 1 20.75 20H4V8.25Zm15.75 4.5h-3.25a1.75 1.75 0 1 0 0 3.5H19.75v-3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (type === "add") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11.25 5.25h1.5v6h6v1.5h-6v6h-1.5v-6h-6v-1.5h6v-6Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="12" width="3.75" height="8" rx="1.1" fill="currentColor" />
      <rect x="10.125" y="8" width="3.75" height="12" rx="1.1" fill="currentColor" />
      <rect x="15.75" y="4.5" width="3.75" height="15.5" rx="1.1" fill="currentColor" />
    </svg>
  );
}

const navItems = [
  { path: "/home", icon: "home", label: "Home" },
  { path: "/wallet", icon: "wallet", label: "Wallet" },
  { path: "/wallet?mode=add", icon: "add", label: "Add Cash", isAddCash: true },
  { path: "/results", icon: "results", label: "Results" },
];

function BottomNav() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.isAddCash) {
      return location.pathname === "/wallet" && location.search.includes("mode=add");
    }
    if (item.path === "/wallet") {
      return location.pathname === "/wallet" && !location.search.includes("mode=add");
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="bottom-nav bottom-nav-ref" aria-label="Main navigation">
      <div className="bottom-nav-items">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-link ${item.isAddCash ? "bottom-nav-link--add" : ""} ${
              isActive(item) ? "active" : ""
            }`}
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <NavIcon type={item.icon} />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
