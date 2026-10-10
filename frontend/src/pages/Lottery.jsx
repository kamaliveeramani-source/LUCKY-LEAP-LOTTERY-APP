import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API, { getAuthToken } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import LotteryCard from "../components/LotteryCard";
import LotteryListState from "../components/LotteryListState";
import "./Lottery.css";

function formatPrize(value) {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeValue);
}

function formatCurrency(value) {
  return `₹${formatPrize(value)}`;
}

function GameIcon({ value }) {
  const label = String(value || "ABC").trim();
  if (label.toUpperCase() === "ABC") {
    return <span className="home-game-icon home-game-icon--abc"><b>A</b><b>B</b><b>C</b></span>;
  }
  return <span className="home-game-icon">{label}</span>;
}

function Lottery() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState([]);
  const [gameConfigs, setGameConfigs] = useState([]);
  const [lotteryStatus, setLotteryStatus] = useState("loading");
  const { refreshWallet } = useWallet();
  const { notify } = useNotification();

  const token = getAuthToken();

  useEffect(() => {
    refreshWallet();
    getLotteries();
    getGameConfigs();
    const refreshSchedules = () => {
      if (document.visibilityState === "visible") getLotteries(true);
    };
    const refreshTimer = window.setInterval(refreshSchedules, 30000);
    window.addEventListener("focus", refreshSchedules);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshSchedules);
    };
  }, []);

  const getLotteries = async (quiet = false) => {
    if (!quiet) setLotteryStatus("loading");
    try {
      const res = await API.get("/lottery/all");
      const apiLotteries = Array.isArray(res.data.data) ? res.data.data : [];

      if (!apiLotteries.length) {
        setLotteries([]);
        setLotteryStatus("empty");
        return;
      }

      setLotteries(apiLotteries);
      setLotteryStatus("success");
    } catch (err) {
      console.error(err);
      if (!quiet) {
        setLotteries([]);
        setLotteryStatus("error");
      }
    }
  };

  useEffect(() => {
    const nextDraw = lotteries
      .map((lottery) => Date.parse(lottery?.drawDate))
      .filter((timestamp) => Number.isFinite(timestamp) && timestamp > Date.now())
      .sort((left, right) => left - right)[0];
    if (!nextDraw) return undefined;

    const delay = Math.min(nextDraw - Date.now() + 1000, 2147483647);
    const timer = window.setTimeout(() => getLotteries(true), Math.max(1000, delay));
    return () => window.clearTimeout(timer);
  }, [lotteries]);

  const getGameConfigs = async () => {
    try {
      const res = await API.get("/lottery/games");
      setGameConfigs(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setGameConfigs([]);
    }
  };

  const buyTicket = async (lotteryId) => {
    try {
      const res = await API.post(
        "/ticket/buy",
        { lotteryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notify("success", res.data.message || "Ticket purchased successfully");
      await refreshWallet();
    } catch (err) {
      notify("error", err.response?.data?.message || "Purchase failed");
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const selectedLotteryId = searchParams.get("lotteryId");

  useEffect(() => {
    if (selectedLotteryId) {
      navigate(`/lotterygame?lotteryId=${selectedLotteryId}`);
    }
  }, [selectedLotteryId, navigate]);

  const visibleLotteries = useMemo(() => {
    return [...lotteries]
      .filter((lottery) => {
        if (!lottery?.drawDate) return false;
        const drawStamp = Date.parse(lottery.drawDate);
        return Number.isFinite(drawStamp) && drawStamp > Date.now();
      })
      .sort((left, right) => Date.parse(left.drawDate) - Date.parse(right.drawDate));
  }, [lotteries]);
  const orderedGames = [...gameConfigs].sort((left, right) =>
    (Number(left.displayOrder) || Number.MAX_SAFE_INTEGER) - (Number(right.displayOrder) || Number.MAX_SAFE_INTEGER) || Number(left.id) - Number(right.id)
  );
  const playGame = () => {
    if (lotteries[0]?.id) navigate(`/lotterygame?lotteryId=${lotteries[0].id}`);
    else navigate("/lottery");
  };

  return (
    <div className="page-content lottery-mobile-page lottery-listing-page">
      <section className="lottery-draws-section" aria-labelledby="lottery-draws-title">
        <header className="lottery-draws-heading">
          <div className="lottery-draws-heading__title-wrap">
            <h2 id="lottery-draws-title">Lottery Draws</h2>
            <span className="lottery-draws-heading__underline" aria-hidden="true" />
          </div>
          <button type="button" className="lottery-draws-view-all" onClick={() => navigate("/lotterygame")}>View All <span aria-hidden="true">›</span></button>
        </header>
        <LotteryListState status={lotteryStatus} onRetry={getLotteries} pageGrid>
          <div className="lottery-mobile-grid lottery-page-grid">
            {visibleLotteries.length ? visibleLotteries.map((lottery, index) => (
              <LotteryCard
                key={lottery.id ?? `lottery-${index}`}
                lottery={lottery}
                variantIndex={index}
                variant="catalog"
                onClick={() => navigate(`/lotterygame?lotteryId=${lottery.id}`)}
              />
            )) : (
              <div className="lottery-empty-state">No upcoming draws at the moment.</div>
            )}
          </div>
        </LotteryListState>
      </section>

      <section className="lottery-games-section" aria-labelledby="kerala-game-configs-title">
        <header className="lottery-listing-heading">
          <div className="lottery-listing-title">
            <svg className="lottery-listing-title__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.1 7.2h9.8a4.5 4.5 0 0 1 4.4 3.6l.7 3.3a2.7 2.7 0 0 1-4.4 2.6l-2.2-1.9H8.6l-2.2 1.9A2.7 2.7 0 0 1 2 14.1l.7-3.3a4.5 4.5 0 0 1 4.4-3.6Zm.2 2.5a.8.8 0 0 0-.8.8v.6h-.6a.8.8 0 1 0 0 1.6h.6v.6a.8.8 0 1 0 1.6 0v-.6h.6a.8.8 0 1 0 0-1.6h-.6v-.6a.8.8 0 0 0-.8-.8Zm8.4 1.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.5 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
            </svg>
            <h1 id="kerala-game-configs-title">Kerala Lottery Games</h1>
          </div>
          <label className="home-game-region lottery-game-region">
            <span className="lottery-game-region__label">Lottery region</span>
            <svg className="lottery-game-region__icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.25a5 5 0 0 0-5 5c0 3.4 5 8.5 5 8.5s5-5.1 5-8.5a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" fill="currentColor" /></svg>
            <select aria-label="Lottery region" defaultValue="Kerala">
              <option>Kerala</option>
            </select>
            <b aria-hidden="true">⌄</b>
          </label>
        </header>

        {orderedGames.length > 0 && (
          <div className="home-game-grid lottery-game-grid">
            {orderedGames.map((game) => (
              <article className={`home-game-card home-game-card--${game.buttonTheme || "purple"}`} key={game.id}>
                <div className="home-game-card__corner" aria-hidden="true" />
                <div className="home-game-card__title-row">
                  <GameIcon value={game.icon} />
                  <h3>{game.name}{game.subtitle && <><br /><span>{game.subtitle}</span></>}</h3>
                </div>
                <div className="home-game-stats">
                  <div><span><b aria-hidden="true">▤</b>Ticket Price</span><strong>{formatCurrency(game.ticketPrice)}</strong></div>
                  <div><span><b aria-hidden="true">♜</b>Winning</span><strong>{formatCurrency(game.mainWinning)}</strong></div>
                  {game.bcWinning !== null && game.bcWinning !== undefined && <div><span><b aria-hidden="true">☆</b>BC</span><strong>{formatCurrency(game.bcWinning)}</strong></div>}
                  {game.cWinning !== null && game.cWinning !== undefined && <div><span><b aria-hidden="true">☆</b>C</span><strong>{formatCurrency(game.cWinning)}</strong></div>}
                </div>
                <div className="home-game-card__actions">
                  <button type="button" onClick={playGame}>Play Now <span aria-hidden="true">→</span></button>
                  <button type="button" className="home-game-card__arrow" aria-label={`Play ${game.name}`} onClick={playGame}>›</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Lottery;