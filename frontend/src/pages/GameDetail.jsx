import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { ABCDigitGame, CricketGame, GoldenSpinGame, GreenYellowRedGame, PokerGame, RummyGame } from "../components/games/GameViews";
import "./GamePages.css";

const FALLBACK_CONFIG = {
  GREEN_YELLOW_RED: { numbers: Array.from({ length: 10 }, (_, number) => ({ number, color: ["GREEN", "YELLOW", "RED"][number % 3] })) },
  ABC_DIGIT: { divisions: ["A", "B", "C"], digits: Array.from({ length: 10 }, (_, digit) => digit) },
  DIGIT_ABC: { divisions: ["A", "B", "C"], digits: Array.from({ length: 10 }, (_, digit) => digit) },
  GOLDEN_SPIN: { numbers: Array.from({ length: 10 }, (_, number) => number) },
  RUMMY: { minAmount: 50, maxAmount: 5000 }, RUMMY_DEMO: { minAmount: 50, maxAmount: 5000 },
  POKER: { options: ["PAIR", "HIGH CARD", "FLUSH"] }, POKER_DEMO: { options: ["PAIR", "HIGH CARD", "FLUSH"] },
  CRICKET: { categories: ["INTERNATIONAL", "T20", "IPL"] },
};

const GAME_COMPONENTS = { GREEN_YELLOW_RED: GreenYellowRedGame, ABC_DIGIT: ABCDigitGame, DIGIT_ABC: ABCDigitGame, GOLDEN_SPIN: GoldenSpinGame, POKER: PokerGame, POKER_DEMO: PokerGame, RUMMY: RummyGame, RUMMY_DEMO: RummyGame, CRICKET: CricketGame };

function LoadingState() { return <div className="page-content"><section className="game-state-card"><span className="game-state-spinner" aria-hidden="true" /><h2>Loading game</h2><p>Fetching the latest game configuration.</p></section></div>; }
function ErrorState({ message }) { const navigate = useNavigate(); return <div className="page-content"><section className="game-state-card error"><h2>Game not found</h2><p>{message || "This game is unavailable or disabled."}</p><button type="button" className="game-submit-button" onClick={() => navigate(-1)}>Back to games</button></section></div>; }

export default function GameDetail() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setGame(null); setStatus("loading"); setError("");
    API.get(`/games/${encodeURIComponent(slug)}`).then((response) => { if (!active) return; const nextGame = response.data?.data; if (!nextGame) throw new Error("Game not found"); setGame(nextGame); setStatus("ready"); }).catch((requestError) => { if (!active) return; setError(requestError.response?.data?.message || "This game is unavailable or disabled."); setStatus("error"); });
    return () => { active = false; };
  }, [slug]);
  const config = useMemo(() => game ? { ...(FALLBACK_CONFIG[game.gameType] || {}), ...(game.configuration || {}) } : null, [game]);
  if (status === "loading") return <LoadingState />;
  if (status === "error" || !game || !config) return <ErrorState message={error} />;
  const GameComponent = GAME_COMPONENTS[game.gameType];
  if (!GameComponent) return <ErrorState message={`The game type ${game.gameType} is not supported yet.`} />;
  return <div className="page-content game-page"><GameComponent game={game} config={config} /></div>;
}
