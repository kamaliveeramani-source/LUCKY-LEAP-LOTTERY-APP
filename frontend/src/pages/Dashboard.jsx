import ThemeToggle from "../components/ThemeToggle";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import WalletCard from "../components/WalletCard";
import { useWallet } from "../context/WalletContext";
import ActionButtons from "../components/ActionButtons";
import MenuList from "../components/MenuList";
import LotteryCard from "../components/LotteryCard";
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

  const featuredLottery = lotteries[0] || defaultStateLotteries[0];

  return (
    <div className="page-content dashboard-page dashboard-shell">
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

      <section className="emerald-hero-card dashboard-hero-card">
        <div className="hero-top-row">
          <span className="hero-live-pill">WELCOME BACK</span>
          <span className="hero-chip">Ready to play</span>
        </div>

        <div className="hero-main-row">
          <div>
            <h1>Play & Win Big!</h1>
            <p>Track your wallet, discover new draws, and jump into your next lucky ticket.</p>
          </div>
          <div className="hero-wallet-box">
            <span>Wallet balance</span>
            <strong>₹ {wallet.wallet?.toLocaleString?.() ?? Number(wallet.wallet || 0).toFixed(2)}</strong>
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="btn btn-primary-custom hero-primary-btn" onClick={() => navigate("/lottery")}>
            Play Now
          </button>
          <button type="button" className="btn btn-secondary-custom hero-secondary-btn" onClick={() => navigate("/add-cash")}>
            Add Cash
          </button>
        </div>
      </section>

      <WalletCard wallet={wallet} refreshWallet={refreshWallet} loading={walletLoading} error={walletError} />
      <ActionButtons />
      <MenuList />

      <section className="live-lottery-panel">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">Live Lottery</div>
            <h3>Featured draw</h3>
          </div>
          <button type="button" className="mini-link-btn" onClick={() => navigate("/lottery")}>View All</button>
        </div>

        {featuredLottery && (
          <div className="live-lottery-card" onClick={() => navigate(`/lottery?lotteryId=${featuredLottery.id}`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate(`/lottery?lotteryId=${featuredLottery.id}`)}>
            <div className="live-lottery-content">
              <div className="live-lottery-badge">LIVE</div>
              <h4>{featuredLottery.lotteryName || featuredLottery.name}</h4>
              <p>{new Date(featuredLottery.drawDate).toLocaleDateString(undefined, { day: "numeric", month: "short" })} • {new Date(featuredLottery.drawDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <div className="live-lottery-stats">
                <span>
                  Prize: ₹
                  {Number(featuredLottery.firstPrize ?? featuredLottery.prize ?? 0).toLocaleString()}
                </span>
                <span>Ticket: ₹{Number(featuredLottery.ticketPrice ?? featuredLottery.price ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <button type="button" className="btn btn-primary-custom live-lottery-btn" onClick={(event) => { event.stopPropagation(); navigate(`/lottery?lotteryId=${featuredLottery.id}`); }}>
              Play Now
            </button>
          </div>
        )}
      </section>

      <section className="today-draws-panel">
        <div className="section-title-row">
          <div>
            <div className="section-kicker">Today’s Draws</div>
            <h3>Lucky picks</h3>
          </div>
          <button type="button" className="mini-link-btn" onClick={() => navigate("/lottery")}>View All</button>
        </div>

        <div className="lottery-card-grid-premium compact-grid">
          {lotteries.slice(0, 4).map((lottery) => (
            <LotteryCard
              key={lottery.id}
              lottery={lottery}
              actionLabel="Play Now"
              onClick={() => navigate(`/lottery?lotteryId=${lottery.id}`)}
              onActionClick={() => buyTicket(lottery.id, lottery.lotteryName)}
            />
          ))}
        </div>
      </section>

      <section className="security-panel">
        <div className="trust-card">
          <div className="trust-icon">🛡️</div>
          <div className="trust-copy">
            <h4>Play Safe. Play Smart.</h4>
            <p>Set a budget, review draw times, and keep your wallet in control before every ticket purchase.</p>
          </div>
        </div>
      </section>

      <div className="section-header-row">
        <h3><span className="section-header-icon" aria-hidden="true">🎫</span>My Tickets</h3>
      </div>

      {tickets.length === 0 ? (
        <div className="ticket-empty-state">
          <div className="ticket-empty-icon" aria-hidden="true">🎫</div>
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
