import AppLogo from "./AppLogo";

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function Header({ onMenuClick, onNotificationsClick, onSearchClick }) {
  return (
    <header className="fixed-app-header">
      <div className="header-left">
        <button type="button" className="icon-btn menu-toggle" onClick={onMenuClick} aria-label="Open menu">
          <IconMenu />
        </button>
        <AppLogo headerBrand className="header-logo" />
      </div>

      <div className="header-actions">
        <button type="button" className="icon-btn header-action-btn header-bell-btn" onClick={onNotificationsClick} aria-label="Notifications">
          <IconBell />
        </button>
        <button type="button" className="icon-btn header-action-btn header-profile-btn" onClick={onSearchClick} aria-label="Profile">
          <IconUser />
        </button>
      </div>
    </header>
  );
}

export default Header;
