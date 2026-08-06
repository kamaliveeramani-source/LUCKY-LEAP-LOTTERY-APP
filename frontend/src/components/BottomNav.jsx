import { Link, useLocation } from "react-router-dom";

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/home" className={isActive("/home") ? "active" : ""}>
        🏠
        <br />
        Home
      </Link>

      <Link to="/lottery" className={isActive("/lottery") ? "active" : ""}>
        🎲
        <br />
        Lottery
      </Link>

      <Link to="/wallet" className={isActive("/wallet") ? "active" : ""}>
        💰
        <br />
        Wallet
      </Link>

      <Link to="/my-games" className={isActive("/my-games") ? "active" : ""}>
        🎮
        <br />
        My Games
      </Link>

      <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
        👤
        <br />
        Profile
      </Link>
    </nav>
  );
}

export default BottomNav;
