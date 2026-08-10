import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: "🎟", label: "Buy Lottery", path: "/lottery" },
  { icon: "🎯", label: "My Bets", path: "/lotterygame" },
  { icon: "🎫", label: "My Tickets", path: "/dashboard" },
  { icon: "💰", label: "Wallet", path: "/wallet" },
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
            <span className="quick-menu-tile-icon" aria-hidden="true">{item.icon}</span>
            <span className="quick-menu-tile-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuList;
