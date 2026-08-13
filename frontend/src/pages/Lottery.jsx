import LotteryCard from "../components/LotteryCard";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import API from "../services/api";
import { useWallet } from "../context/WalletContext";

const defaultStateLotteries = [
  {
    id: "state-nagaland",
    lotteryName: "Nagaland Morning",
    ticketPrice: 120,
    firstPrize: 960000,
    secondPrize: 55000,
    thirdPrize: 11000,
    drawDate: "2026-08-04T13:00:00",
  },
  {
    id: "state-sthree",
    lotteryName: "Sthree Sakthi",
    ticketPrice: 100,
    firstPrize: 960000,
    secondPrize: 53000,
    thirdPrize: 10500,
    drawDate: "2026-08-04T15:00:00",
  },
  {
    id: "state-nagaland-day",
    lotteryName: "Nagaland Day",
    ticketPrice: 110,
    firstPrize: 960000,
    secondPrize: 54000,
    thirdPrize: 10800,
    drawDate: "2026-08-04T18:00:00",
  },
  {
    id: "state-nagaland-evening",
    lotteryName: "Nagaland Evening",
    ticketPrice: 115,
    firstPrize: 960000,
    secondPrize: 56000,
    thirdPrize: 11200,
    drawDate: "2026-08-04T20:00:00",
  },
  {
    id: "state-karunya-plus",
    lotteryName: "Karunya Plus",
    ticketPrice: 90,
    firstPrize: 960000,
    secondPrize: 52000,
    thirdPrize: 10400,
    drawDate: "2026-08-06T15:00:00",
  },
  {
    id: "state-suvarna-keralam",
    lotteryName: "Suvarna Keralam",
    ticketPrice: 95,
    firstPrize: 960000,
    secondPrize: 54000,
    thirdPrize: 10600,
    drawDate: "2026-08-07T15:00:00",
  },
  {
    id: "state-karunya",
    lotteryName: "Karunya",
    ticketPrice: 100,
    firstPrize: 960000,
    secondPrize: 55000,
    thirdPrize: 10800,
    drawDate: "2026-08-08T15:00:00",
  },
  {
    id: "state-samrudhi",
    lotteryName: "Samrudhi",
    ticketPrice: 110,
    firstPrize: 960000,
    secondPrize: 56000,
    thirdPrize: 11000,
    drawDate: "2026-08-09T15:00:00",
  },
  {
    id: "state-bhagyathara",
    lotteryName: "Bhagyathara",
    ticketPrice: 125,
    firstPrize: 960000,
    secondPrize: 58000,
    thirdPrize: 11500,
    drawDate: "2026-08-10T15:00:00",
  },
  {
    id: "state-win-win",
    lotteryName: "Win Win",
    ticketPrice: 130,
    firstPrize: 960000,
    secondPrize: 59000,
    thirdPrize: 11800,
    drawDate: "2026-08-11T15:00:00",
  },
];

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
  const { refreshWallet } = useWallet();
  const { notify } = useNotification();

  const token = localStorage.getItem("token");

  useEffect(() => {
    refreshWallet();
    getLotteries();
  }, []);

  const getWallet = async () => {
    if (!token) return;

    // wallet now managed by WalletContext; refreshWallet called on mount instead
  };

  const getLotteries = async () => {
    try {
      const res = await API.get("/lottery/all");
      const apiLotteries = Array.isArray(res.data.data) ? res.data.data : [];
      const mergedLotteries = [...apiLotteries];

      defaultStateLotteries.forEach((defaultLottery) => {
        if (!mergedLotteries.some((lottery) => String(lottery.id) === String(defaultLottery.id))) {
          mergedLotteries.push(defaultLottery);
        }
      });

      setLotteries(mergedLotteries.length ? mergedLotteries : defaultStateLotteries);
    } catch (err) {
      console.log(err);
      setLotteries(defaultStateLotteries);
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
  const selectedLottery = selectedLotteryId
    ? lotteries.find((lottery) => String(lottery.id) === selectedLotteryId) ||
      defaultStateLotteries.find((lottery) => String(lottery.id) === selectedLotteryId)
    : null;
  const isDetailsPage = Boolean(selectedLotteryId && selectedLottery);
  const displayedLotteries = isDetailsPage ? [selectedLottery] : lotteries;

  return (
      <div className="page-content">
        {selectedLotteryId && !selectedLottery ? (
          <div className="card-panel card-panel-strong" style={{ marginBottom: "16px" }}>
            <p className="text-muted" style={{ margin: 0 }}>
              Lottery not found. Please select a different draw.
            </p>
          </div>
        ) : null}

        {isDetailsPage ? (
          <div className="lottery-detail-card card-panel card-panel-strong">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
              <div>
                <div className="badge-pill" style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)", color: "#fff" }}>
                  {selectedLottery.lotteryName}
                </div>
                <h3 style={{ margin: "16px 0 8px", fontSize: "1.9rem" }}>₹ {selectedLottery.firstPrize.toLocaleString()}</h3>
                <p className="text-muted" style={{ margin: 0 }}>
                  Ticket ₹{selectedLottery.ticketPrice} • {formatShortDate(selectedLottery.drawDate)} • {formatTime(selectedLottery.drawDate)}
                </p>
              </div>
              <button type="button" className="btn btn-outline-primary" onClick={() => navigate("/lottery")}>Back to list</button>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="card-panel card-panel-strong" style={{ padding: "16px" }}>
                  <small className="text-muted">Ticket Price</small>
                  <div style={{ marginTop: "8px", fontSize: "1.35rem", fontWeight: 700 }}>₹ {selectedLottery.ticketPrice}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card-panel card-panel-strong" style={{ padding: "16px" }}>
                  <small className="text-muted">Draw Time</small>
                  <div style={{ marginTop: "8px", fontSize: "1.35rem", fontWeight: 700 }}>{formatTime(selectedLottery.drawDate)}</div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <div className="card-panel card-panel-strong" style={{ padding: "16px" }}>
                  <small className="text-muted">Second Prize</small>
                  <div style={{ marginTop: "8px", fontSize: "1.2rem", fontWeight: 700 }}>₹ {selectedLottery.secondPrize.toLocaleString()}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="card-panel card-panel-strong" style={{ padding: "16px" }}>
                  <small className="text-muted">Third Prize</small>
                  <div style={{ marginTop: "8px", fontSize: "1.2rem", fontWeight: 700 }}>₹ {selectedLottery.thirdPrize.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="btn btn-gradient-primary btn-pill w-100"
                style={{ height: "52px" }}
                onClick={() => navigate(`/lotterygame?lotteryId=${selectedLottery.id}`)}
              >
                Place Bet
              </button>
            </div>
          </div>
        ) : (
          <div className="lottery-card-grid-premium">
            {displayedLotteries.map((lottery) => (
              <LotteryCard
                key={lottery.id}
                lottery={lottery}
                onClick={() => navigate(`/lottery?lotteryId=${lottery.id}`)}
                actionLabel="See Details"
              />
            ))}
          </div>
        )}
      </div>
  );
}

export default Lottery;