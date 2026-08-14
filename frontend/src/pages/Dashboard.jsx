import ThemeToggle from "../components/ThemeToggle";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import WalletCard from "../components/WalletCard";
import { useWallet } from "../context/WalletContext";
import ActionButtons from "../components/ActionButtons";
import MenuList from "../components/MenuList";
import LotteryCard from "../components/LotteryCard";
import LotteryListState from "../components/LotteryListState";
import TicketCard from "../components/TicketCard";
import { addNotification } from "../services/notificationService";
import { useNotification } from "../context/NotificationContext";

const defaultStateLotteries = [
  {
    id: "state-kerala",
    lotteryName: "Kerala State Lottery",
    ticketPrice: 100,
    firstPrize: 1500000,
    secondPrize: 75000,
    thirdPrize: 15000,
    drawDate: "2026-08-12T19:00:00",
  },
  {
    id: "state-mumbai",
    lotteryName: "Maharashtra Mega",
    ticketPrice: 120,
    firstPrize: 1800000,
    secondPrize: 90000,
    thirdPrize: 20000,
    drawDate: "2026-08-12T20:00:00",
  },
  {
    id: "state-tamilnadu",
    lotteryName: "Tamil Nadu Lucky Draw",
    ticketPrice: 90,
    firstPrize: 1300000,
    secondPrize: 60000,
    thirdPrize: 12000,
    drawDate: "2026-08-13T18:30:00",
  },
  {
    id: "state-karnataka",
    lotteryName: "Karnataka Mega",
    ticketPrice: 110,
    firstPrize: 1400000,
    secondPrize: 70000,
    thirdPrize: 14000,
    drawDate: "2026-08-13T20:30:00",
  },
  {
    id: "state-nagaland",
    lotteryName: "Nagaland Festival Draw",
    ticketPrice: 80,
    firstPrize: 1200000,
    secondPrize: 55000,
    thirdPrize: 11000,
    drawDate: "2026-08-14T19:30:00",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { wallet, loading: walletLoading, error: walletError, refreshWallet } = useWallet();

  const [lotteries, setLotteries] = useState([]);
  const [lotteryStatus, setLotteryStatus] = useState("loading");
  const [tickets, setTickets] = useState([]);
  const [greeting, setGreeting] = useState({ name: "Player", time: "", date: "" });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    refreshWallet();
    getLotteries();
    getMyTickets();
    updateGreeting();
  }, []);

  const updateGreeting = () => {
    const name = localStorage.getItem("userName") || "Player";
    const now = new Date();
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const time = now.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    setGreeting({ name, time, date });
  };

  const getLotteries = async () => {
    setLotteryStatus("loading");
    try {
      const res = await API.get("/lottery/all");
      const apiLotteries = Array.isArray(res.data.data) ? res.data.data : [];
      const merged = [...apiLotteries, ...defaultStateLotteries];
      if (!merged.length) {
        setLotteries([]);
        setLotteryStatus("empty");
        return;
      }
      setLotteries(merged);
      setLotteryStatus("success");
    } catch (err) {
      console.log(err);
      setLotteries([]);
      setLotteryStatus("error");
    }
  };

  const getMyTickets = async () => {
    try {
      const res = await API.get("/ticket/mytickets", { headers: { Authorization: `Bearer ${token}` } });
      setTickets(res.data.tickets);
    } catch (err) {
      console.log(err);
    }
  };

  const { notify } = useNotification();

  const buyTicket = async (lotteryId, lotteryName) => {
    try {
      const res = await API.post(
        "/ticket/buy",
        { lotteryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notify("success", res.data.message || "Ticket purchased successfully");
      addNotification("Ticket Purchased", `You bought a ticket for ${lotteryName}.`);
      await refreshWallet();
      getMyTickets();
    } catch (err) {
      notify("error", err.response?.data?.message || "Purchase Failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="page-content dashboard-page">
      <div className="dashboard-top-row">
        <div className="dashboard-greeting">
          <span className="dashboard-badge">Dashboard</span>
          <h2 className="dashboard-greeting-name">Hi, {greeting.name}</h2>
          <p className="dashboard-greeting-meta">{greeting.date} • {greeting.time}</p>
        </div>

        <div className="dashboard-top-actions">
          <ThemeToggle />
          <button type="button" className="btn btn-secondary-custom dashboard-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <WalletCard wallet={wallet} refreshWallet={refreshWallet} loading={walletLoading} error={walletError} />
      <ActionButtons />
      <MenuList />

      <div className="section-header-row">
        <h3>Available Lotteries</h3>
      </div>

      <LotteryListState status={lotteryStatus} onRetry={getLotteries}>
        <div className="lottery-card-grid-premium">
          {lotteries.map((lottery) => (
            <LotteryCard
              key={lottery.id}
              lottery={lottery}
              actionLabel="Buy Ticket"
              onClick={() => navigate(`/lottery?lotteryId=${lottery.id}`)}
              onActionClick={() => buyTicket(lottery.id, lottery.lotteryName)}
            />
          ))}
        </div>
      </LotteryListState>

      <div className="section-header-row">
        <h3>My Tickets</h3>
      </div>

      {tickets.length === 0 ? (
        <div className="ticket-empty-state">
          <div className="ticket-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M5 8h14v3a2 2 0 0 1 0 4v3H5v-3a2 2 0 0 0 0-4V8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-muted" style={{ margin: 0 }}>No tickets purchased yet.</p>
          <button
            type="button"
            className="btn btn-gradient-primary btn-pill"
            style={{ marginTop: "16px" }}
            onClick={() => navigate("/lottery")}
          >
            Browse Lotteries
          </button>
        </div>
      ) : (
        <div className="ticket-cards-grid">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
