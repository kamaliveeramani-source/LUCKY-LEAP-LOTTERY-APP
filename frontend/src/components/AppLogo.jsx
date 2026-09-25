import logo from "../assets/thumbi-logo.png";

function AppLogo({ compact = false, headerBrand = false, className = "" }) {
  const logoSize = headerBrand ? 34 : compact ? 42 : 72;

  return (
    <div className={`app-logo ${compact ? "compact" : ""} ${headerBrand ? "header-brand-logo" : ""} ${className}`.trim()}>
      <img
        src={logo}
        alt="Lucky Horse Lotteries logo"
        className="app-logo-image"
        width={logoSize}
        height={logoSize}
        decoding="sync"
        loading="eager"
      />
      {!compact && !headerBrand && (
        <div className="app-logo-text">
          <div className="app-logo-name">LUCKY HORSE</div>
          <div className="app-logo-subname">LOTTERIES</div>
          <div className="app-logo-tag">Play safe. Play legal.</div>
        </div>
      )}
      {headerBrand ? (
        <div className="app-logo-text app-logo-header-text">
          <div className="app-logo-name">LUCKY HORSE</div>
          <div className="app-logo-subname">LOTTERIES</div>
        </div>
      ) : null}
    </div>
  );
}

export default AppLogo;
