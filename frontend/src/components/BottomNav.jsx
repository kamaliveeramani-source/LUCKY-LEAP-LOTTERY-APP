import { Link, useLocation } from "react-router-dom";

function NavIcon({ type }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Zm14 4.5h3v3h-3a1.5 1.5 0 1 1 0-3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "add") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 20V10M12 20V4M18 20v-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems = [
  { path: "/home", icon: "home", label: "Home" },
  { path: "/wallet", icon: "wallet", label: "Wallet" },
  { path: "/results", icon: "results", label: "Results" },
];

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/wallet") {
      return location.pathname === "/wallet" && !location.search.includes("mode=add");
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  const renderLink = (item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`bottom-nav-link ${isActive(item.path) ? "active" : ""}`}
    >
      <span className="bottom-nav-icon" aria-hidden="true">
        <NavIcon type={item.icon} />
      </span>
      <span className="bottom-nav-label">{item.label}</span>
    </Link>
  );

  const fabActive = location.pathname === "/wallet" && location.search.includes("mode=add");

  return (
    <nav className="bottom-nav bottom-nav-ref" aria-label="Main navigation">
      <div className="bottom-nav-items">
        {renderLink(navItems[0])}
        {renderLink(navItems[1])}
        <div className="bottom-nav-fab-slot">
          <Link
            to="/wallet?mode=add"
            className={`bottom-nav-fab ${fabActive ? "active" : ""}`}
            aria-label="Add Cash"
          >
            <span className="bottom-nav-icon" aria-hidden="true">
              <NavIcon type="add" />
            </span>
          </Link>
          <span className="bottom-nav-fab-label">Add Cash</span>
        </div>
        {renderLink(navItems[2])}
      </div>
    </nav>
  );
}

export default BottomNav;
