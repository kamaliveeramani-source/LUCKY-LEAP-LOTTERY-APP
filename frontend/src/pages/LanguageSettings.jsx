import { useNavigate } from "react-router-dom";

function LanguageSettings() {
  const navigate = useNavigate();

  return (
      <div className="page-content">
        <div className="home-section-title">
          <div className="section-label">Choose Language</div>
          <div className="section-note">Switch the app language for a better experience.</div>
        </div>

        <div className="lottery-section">
          {[
            { label: "English", hint: "Default" },
            { label: "हिन्दी", hint: "Hindi" },
            { label: "தமிழ்", hint: "Tamil" },
            { label: "മലയാളം", hint: "Malayalam" },
          ].map((item) => (
            <button key={item.label} type="button" className="home-game-pill" style={{ width: "100%", justifyContent: "space-between" }}>
              <span>{item.label}</span>
              <small style={{ opacity: 0.75 }}>{item.hint}</small>
            </button>
          ))}
        </div>
      </div>
  );
}

export default LanguageSettings;
