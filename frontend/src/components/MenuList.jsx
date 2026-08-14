import { useNavigate } from "react-router-dom";

function MenuIcon({ type }) {
  if (type === "lottery") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10v16l-5-3-5 3V4Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "bets") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "tickets") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14v3a2 2 0 0 1 0 4v3H5v-3a2 2 0 0 0 0-4V8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Zm14 4.5h3v3h-3a1.5 1.5 0 1 1 0-3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

const menuItems = [
  { icon: "lottery", label: "Buy Lottery", path: "/lottery" },
  { icon: "bets", label: "My Bets", path: "/lotterygame" },
  { icon: "tickets", label: "My Tickets", path: "/dashboard" },
  { icon: "wallet", label: "Wallet", path: "/wallet" },
];

function MenuList() {
  const navigate = useNavigate();

  return (
    <div>
      <h5 className="quick-menu-heading">Quick Menu</h5>
      <div className="quick-menu-grid">
        {menuItems.map((item) => (
          <button
            key={item.path}
            type="button"
            className="quick-menu-tile"
            onClick={() => navigate(item.path)}
          >
            <span className="quick-menu-tile-icon" aria-hidden="true">
              <MenuIcon type={item.icon} />
            </span>
            <span className="quick-menu-tile-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuList;
