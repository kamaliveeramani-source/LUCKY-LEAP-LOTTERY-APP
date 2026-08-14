import { useNavigate } from "react-router-dom";

function ActionIcon({ type }) {
  if (type === "deposit") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12M8 11l4 4 4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "withdraw") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21V9M8 13l4-4 4 4M5 5h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "transfer") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 8h10M7 16h10M4 12h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M17 8l3 4-3 4M7 16l-3-4 3-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ActionButtons() {
  const navigate = useNavigate();

  const actions = [
    { id: "deposit", label: "Deposit", icon: "deposit", path: "/wallet?mode=add" },
    { id: "withdraw", label: "Withdraw", icon: "withdraw", path: "/wallet?mode=withdraw" },
    { id: "transfer", label: "Transfer", icon: "transfer", path: "/wallet?mode=transfer" },
    { id: "bets", label: "My Bets", icon: "bets", path: "/lotterygame" },
  ];

  return (
    <div className="action-buttons-grid">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`action-btn-tile ${action.id}`}
          onClick={() => navigate(action.path)}
        >
          <span className="action-btn-tile-icon" aria-hidden="true">
            <ActionIcon type={action.icon} />
          </span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default ActionButtons;
