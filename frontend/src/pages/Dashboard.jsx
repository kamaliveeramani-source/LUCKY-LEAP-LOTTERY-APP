import ThemeToggle from "../components/ThemeToggle";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import WalletCard from "../components/WalletCard";
import { useWallet } from "../context/WalletContext";
import ActionButtons from "../components/ActionButtons";
import MenuList from "../components/MenuList";
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
    lotteryName: "Maharashtra Jackpot",
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
    try {
      const res = await API.get("/lottery/all");
      const apiLotteries = Array.isArray(res.data.data) ? res.data.data : [];
      setLotteries([...apiLotteries, ...defaultStateLotteries]);
    } catch (err) {
      console.log(err);
      setLotteries(defaultStateLotteries);
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
    <div className="page-content">
      <div className="top-row">
        <div>
          <div className="badge-pill">Dashboard</div>
          <h2 className="page-title" style={{ marginTop: "12px" }}>Hi, {greeting.name}</h2>
          <p className="text-muted" style={{ margin: "6px 0 0" }}>
            {greeting.date} • {greeting.time}
          </p>
        </div>

        <div className="flex-stack">
          <ThemeToggle />
          <button className="btn btn-secondary-custom logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <WalletCard wallet={wallet} refreshWallet={refreshWallet} loading={walletLoading} error={walletError} />
      <ActionButtons />
      <MenuList />

      <h3 className="section-title">🎲 Available Lotteries</h3>

      <div className="home-card-grid">
        {lotteries.map((lottery) => (
          <div key={lottery.id} className="home-card" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)" }}>
            <div>
              <div className="home-card-title">{lottery.lotteryName}</div>
              <div className="home-card-jackpot">₹ {lottery.firstPrize}</div>
              <div className="home-card-subtitle">
                Ticket ₹{lottery.ticketPrice} • {lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString() : "Draw Soon"}
              </div>
            </div>
            <div className="home-card-options">
              <button
                className="btn btn-sm btn-outline-light"
                style={{ minWidth: "110px" }}
                onClick={() => navigate(`/lottery?lotteryId=${lottery.id}`)}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">🎫 My Tickets</h3>

      {tickets.length === 0 ? (
        <div className="card-panel card-panel-strong">
          <p className="text-muted" style={{ margin: 0 }}>No tickets purchased yet.</p>
        </div>
      ) : (
        <div className="home-card-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card-panel card-panel-strong">
              <div className="home-card-title">{ticket.ticketNumber}</div>
              <p className="text-muted" style={{ margin: "6px 0 10px" }}>
                {ticket.Lottery?.lotteryName || "Unknown Lottery"}
              </p>
              <div className="d-flex justify-content-between align-items-center" style={{ gap: "10px" }}>
                <span>{ticket.Lottery?.drawDate ? new Date(ticket.Lottery.drawDate).toLocaleDateString() : "-"}</span>
                <span className="badge-pill" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                  {ticket.Lottery?.winnerTicketId === ticket.id ? "Won" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;