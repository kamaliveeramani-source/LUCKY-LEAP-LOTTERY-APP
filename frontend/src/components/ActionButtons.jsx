import { useNavigate } from "react-router-dom";

function ActionButtons() {
  const navigate = useNavigate();

  const actions = [
    { id: "deposit", label: "Deposit", icon: "💳", className: "deposit", path: "/add-cash" },
    { id: "withdraw", label: "Withdraw", icon: "💸", className: "withdraw", path: "/wallet?mode=withdraw" },
    { id: "transfer", label: "Transfer", icon: "↔", className: "transfer", path: "/wallet?mode=transfer" },
    { id: "bets", label: "My Bets", icon: "🎯", className: "bets", path: "/lotterygame" },
  ];

  return (
    <div className="action-buttons-grid">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`action-btn-tile ${action.className}`}
          onClick={() => navigate(action.path)}
        >
          <span className="action-btn-tile-icon" aria-hidden="true">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default ActionButtons;
