import logo from "../assets/luckyleap.png.jpeg";

function AppLogo({ compact = false, headerBrand = false, className = "" }) {
  const logoSize = headerBrand ? 34 : compact ? 42 : 72;

  return (
    <div className={`app-logo ${compact ? "compact" : ""} ${headerBrand ? "header-brand-logo" : ""} ${className}`.trim()}>
      <img
        src={logo}
        alt="Lucky Leap logo"
        className="app-logo-image"
        width={logoSize}
        height={logoSize}
        decoding="sync"
        loading="eager"
      />
      {!compact && !headerBrand && (
        <div className="app-logo-text">
          <div className="app-logo-name">Lucky Leap</div>
          <div className="app-logo-tag">Play, win, leap ahead</div>
        </div>
      )}
      {headerBrand ? (
        <div className="app-logo-text">
          <div className="app-logo-name">Lucky Leap</div>
        </div>
      ) : null}
    </div>
  );
}

export default AppLogo;
