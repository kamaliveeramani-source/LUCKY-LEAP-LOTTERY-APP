import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./GamePages.css";

function GameLobbyIcon({ type }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" };

  switch (type) {
    case "lottery":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h10v16l-5-3-5 3V4Z" {...stroke} />
        </svg>
      );
    case "timer":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="7" {...stroke} />
          <path d="M12 10v4l2 2M9 3h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "fire":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3s-4 5-4 9a4 4 0 0 0 8 0c0-4-4-9-4-9Z" {...stroke} />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l2.2 4.5L19 8.3l-3.5 3.4.8 4.9L12 14.8 7.7 16.6l.8-4.9L5 8.3l4.8-.8L12 3Z" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" {...stroke} />
        </svg>
      );
  }
}

function GameVisual({ game }) {
  const type = String(game.gameType || "").toUpperCase();
  if (type === "GREEN_YELLOW_RED") {
    const numbers = game.configuration?.numbers || [];
    return <div className="catalogue-visual colour-balls" aria-hidden="true">{(numbers.length ? numbers.slice(0, 5) : [0, 1, 2, 3, 4]).map((option, index) => <i key={option.number ?? index} className={String(option.color || ["green", "yellow", "red"][index % 3]).toLowerCase()}>{option.number ?? index}</i>)}</div>;
  }
  if (type === "GOLDEN_SPIN") return <div className="catalogue-visual golden-visual" aria-hidden="true"><i>✦</i></div>;
  if (type === "CRICKET") return <div className="catalogue-visual cricket-visual" aria-hidden="true"><i>●</i><b>╱</b></div>;
  if (type === "ABC_DIGIT" || type === "DIGIT_ABC") return <div className="catalogue-visual abc-visual" aria-hidden="true"><i>A</i><i>B</i><i>C</i></div>;
  if (type === "RUMMY") return <div className="catalogue-visual card-visual" aria-hidden="true"><i>♥</i><i>♦</i><i>♣</i></div>;
  if (type === "POKER") return <div className="catalogue-visual poker-visual" aria-hidden="true"><i>♠</i><b>●</b></div>;
  return <GameLobbyIcon type={game.gameType} />;
}

function extractGames(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.games)) return payload.games;
  return [];
}

const gameSlugFallbacks = { ABC_DIGIT: "abc-digit", DIGIT_ABC: "abc-digit", POKER: "poker", POKER_DEMO: "poker", GOLDEN_SPIN: "golden-spin", GREEN_YELLOW_RED: "green-yellow-red", RUMMY: "rummy", RUMMY_DEMO: "rummy", CRICKET: "cricket" };

function MyGames() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/games")
      .then((response) => {
        const catalogue = extractGames(response.data);
        setGames(catalogue.filter((game) => !game.status || String(game.status).toUpperCase() === "ACTIVE"));
      })
      .catch(() => setError("Games are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-content game-page">
      <section className="quick-play-grid">
        {loading && <div className="catalogue-state">Loading games...</div>}
        {error && <div className="catalogue-state error">{error}</div>}
        {!loading && !error && games.length === 0 && <div className="catalogue-state">No games are available right now.</div>}
        {games.map((game, index) => (
          <article key={game.id} className={`quick-play-card game-card-${String(game.gameType || "game").toLowerCase()}`} style={{ "--card-index": index }}>
            <div className="quick-play-card-top">
              <div className="quick-play-image game-card-visual">
                {(game.image || game.imageUrl) ? <img src={game.image || game.imageUrl} alt={`${game.name} artwork`} /> : <GameVisual game={game} />}
              </div>
              {game.featured && <span className="game-badge live">Featured</span>}
            </div>
            <div className="quick-play-card-body">
              <h3>{game.name}</h3>
            </div>
            <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate(`/game/${game.slug || gameSlugFallbacks[String(game.gameType || "").toUpperCase()] || String(game.gameType || "game").toLowerCase()}`)}>Explore</button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default MyGames;
