import LotteryCard from "../components/LotteryCard";
import LotteryListState from "../components/LotteryListState";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import API, { getAuthToken } from "../services/api";
import { useWallet } from "../context/WalletContext";

function formatShortDate(dateString) {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString) {
  if (!dateString) return "TBD";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Lottery() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState([]);
  const [lotteryStatus, setLotteryStatus] = useState("loading");
  const { refreshWallet } = useWallet();
  const { notify } = useNotification();

  const token = getAuthToken();

  useEffect(() => {
    refreshWallet();
    getLotteries();
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
      console.log(err);
      setLotteries([]);
      setLotteryStatus("error");
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
      navigate(`/lotterygame?lotteryId=${selectedLotteryId}`, { replace: true });
    }
  }, [selectedLotteryId, navigate]);

  const displayedLotteries = lotteries;

  return (
    <div className="page-content">
      <div className="text-center page-intro">
        <div className="badge-pill">Lottery</div>
        <h2 className="page-title">State Lotteries</h2>
        <p className="text-muted" style={{ margin: 0 }}>Browse draws and place your bets.</p>
      </div>
      <LotteryListState status={lotteryStatus} onRetry={getLotteries} pageGrid>
        <div className="lottery-card-grid-premium lottery-page-grid">
          {displayedLotteries.map((lottery, index) => (
            <LotteryCard
              key={lottery.id}
              lottery={lottery}
              variantIndex={index}
              onClick={() => navigate(`/lotterygame?lotteryId=${lottery.id}`)}
              actionLabel="Play Now"
            />
          ))}
        </div>
      </LotteryListState>
    </div>
  );
}

export default Lottery;