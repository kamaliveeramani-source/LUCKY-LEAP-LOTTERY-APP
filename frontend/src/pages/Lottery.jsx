import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API, { getAuthToken } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useWallet } from "../context/WalletContext";
import LotteryCard from "../components/LotteryCard";
import LotteryListState from "../components/LotteryListState";

function formatPrize(value) {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeValue);
}

function formatCurrency(value) {
  return `₹${formatPrize(value)}`;
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
  }, []);

  const getLotteries = async () => {
    setLotteryStatus("loading");
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
      setLotteries([]);
      setLotteryStatus("error");
    }
  };

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

  const visibleLotteries = lotteries;

  return (
    <div className="page-content lottery-mobile-page">
      <header className="lottery-page-heading">
        <div>
          <p className="lottery-page-kicker">Lucky Horse Lotteries</p>
          <h1>State Lottery</h1>
          <p>Choose a draw and play with live jackpot and next-draw details.</p>
        </div>
      </header>

      <LotteryListState status={lotteryStatus} onRetry={getLotteries} pageGrid>
        <div className="lottery-mobile-grid">
          {visibleLotteries.map((lottery, index) => {
            return (
              <LotteryCard
                key={lottery.id ?? `lottery-${index}`}
                lottery={lottery}
                variantIndex={index}
                onClick={() => navigate(`/lotterygame?lotteryId=${lottery.id}`)}
              />
            );
          })}
        </div>
      </LotteryListState>

      {gameConfigs.length > 0 && (
        <section className="lottery-game-configs" aria-labelledby="kerala-game-configs-title">
          <div className="lottery-mobile-section-header">
            <h2 id="kerala-game-configs-title">Kerala Lottery Games</h2>
          </div>
          <div className="lottery-game-config-grid">
            {gameConfigs.map((game) => (
              <article className="lottery-game-config-card" key={game.id}>
                <h3>{game.name}</h3>
                <div className="lottery-game-config-row"><span>Ticket Price</span><strong>{formatCurrency(game.ticketPrice)}</strong></div>
                <div className="lottery-game-config-row"><span>Winning</span><strong>{formatCurrency(game.mainWinning)}</strong></div>
                {game.bcWinning !== null && game.bcWinning !== undefined && <div className="lottery-game-config-row"><span>BC</span><strong>{formatCurrency(game.bcWinning)}</strong></div>}
                {game.cWinning !== null && game.cWinning !== undefined && <div className="lottery-game-config-row"><span>C</span><strong>{formatCurrency(game.cWinning)}</strong></div>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Lottery;