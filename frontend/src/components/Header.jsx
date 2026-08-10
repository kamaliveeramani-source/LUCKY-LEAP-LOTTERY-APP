import AppLogo from "./AppLogo";

function Header({ onMenuClick, onNotificationsClick, onSearchClick }) {
  const userName = localStorage.getItem("userName") || "Player";

  return (
    <header className="fixed-app-header">
      <div className="header-left">
        <button type="button" className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <AppLogo compact className="header-logo" />
        <div className="header-greeting">
          <div className="header-greeting-main">Hi, {userName} 👋</div>
          <div className="header-greeting-sub">Good Luck Today!</div>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="icon-btn header-action-btn" onClick={onNotificationsClick} aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="icon-btn header-action-btn" onClick={onSearchClick} aria-label="Search">
          🔍
        </button>
      </div>
    </header>
  );
}

export default Header;
