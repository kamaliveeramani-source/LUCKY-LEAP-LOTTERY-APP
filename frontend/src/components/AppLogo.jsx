import logo from "../assets/luckyleap.png.jpeg";

function AppLogo({ compact = false, className = "" }) {
  return (
    <div className={`app-logo ${compact ? "compact" : ""} ${className}`.trim()}>
      <img src={logo} alt="Lucky Leap logo" className="app-logo-image" />
      {!compact && (
        <div className="app-logo-text">
          <div className="app-logo-name">Lucky Leap</div>
          <div className="app-logo-tag">Play, win, leap ahead</div>
        </div>
      )}
    </div>
  );
}

export default AppLogo;
