import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import LotteryCard from "../components/LotteryCard";
import "./GamePages.css";

const lotteryCards = [
  {
    id: "state-nagaland",
    name: "Nagaland Morning",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "13:00",
    countdown: "Today",
    status: "LIVE",
    ribbon: "NEW",
    winners: "12,450 Winners",
    sold: 76,
    route: "/lottery?lotteryId=state-nagaland",
  },
  {
    id: "state-sthree",
    name: "Sthree Sakthi",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "15:00",
    countdown: "2 Hours Left",
    status: "OPEN",
    ribbon: "HOT",
    winners: "9,280 Winners",
    sold: 64,
    route: "/lottery?lotteryId=state-sthree",
  },
  {
    id: "state-nagaland-day",
    name: "Nagaland Day",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "18:00",
    countdown: "Tomorrow",
    status: "CLOSING SOON",
    ribbon: "ENDING SOON",
    winners: "5,170 Winners",
    sold: 83,
    route: "/lottery?lotteryId=state-nagaland-day",
  },
  {
    id: "state-nagaland-evening",
    name: "Nagaland Evening",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 04",
    time: "20:00",
    countdown: "2 Hours Left",
    status: "OPEN",
    ribbon: "HOT",
    winners: "10,020 Winners",
    sold: 69,
    route: "/lottery?lotteryId=state-nagaland-evening",
  },
  {
    id: "state-karunya",
    name: "Karunya",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 08",
    time: "15:00",
    countdown: "Tomorrow",
    status: "OPEN",
    ribbon: "NEW",
    winners: "7,340 Winners",
    sold: 58,
    route: "/lottery?lotteryId=state-karunya",
  },
  {
    id: "state-karunya-plus",
    name: "Karunya Plus",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 06",
    time: "15:00",
    countdown: "Today",
    status: "LIVE",
    ribbon: "HOT",
    winners: "14,840 Winners",
    sold: 91,
    route: "/lottery?lotteryId=state-karunya-plus",
  },
  {
    id: "state-suvarna-keralam",
    name: "Suvarna Keralam",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 07",
    time: "15:00",
    countdown: "Tomorrow",
    status: "OPEN",
    ribbon: "NEW",
    winners: "8,990 Winners",
    sold: 66,
    route: "/lottery?lotteryId=state-suvarna-keralam",
  },
  {
    id: "state-samrudhi",
    name: "Samrudhi",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 09",
    time: "15:00",
    countdown: "2 Hours Left",
    status: "CLOSING SOON",
    ribbon: "ENDING SOON",
    winners: "4,750 Winners",
    sold: 88,
    route: "/lottery?lotteryId=state-samrudhi",
  },
  {
    id: "state-bhagyathara",
    name: "Bhagyathara",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 10",
    time: "15:00",
    countdown: "Tomorrow",
    status: "OPEN",
    ribbon: "HOT",
    winners: "11,640 Winners",
    sold: 71,
    route: "/lottery?lotteryId=state-bhagyathara",
  },
  {
    id: "state-win-win",
    name: "Win Win",
    prize: "₹9,60,000",
    price: "20",
    date: "Aug 11",
    time: "15:00",
    countdown: "2 Hours Left",
    status: "OPEN",
    ribbon: "HOT",
    winners: "13,200 Winners",
    sold: 79,
    route: "/lottery?lotteryId=state-win-win",
  },
  {
    id: "state-kerala-bumper",
    name: "Kerala Bumper",
    prize: "₹12,00,000",
    price: "50",
    date: "Aug 15",
    time: "21:00",
    countdown: "Tomorrow",
    status: "SOLD OUT",
    ribbon: "SOLD OUT",
    winners: "20,324 Winners",
    sold: 100,
    route: "/lottery?lotteryId=state-kerala-bumper",
  },
];

function Home() {
  const navigate = useNavigate();
  const { balance } = useWallet();

  return (
    <div className="page-content">
      <div className="home-wallet-banner">
        <div>
          <div className="home-wallet-label">Your Balance</div>
          <div className="wallet-value">₹ {balance.toLocaleString()}</div>
        </div>
        <div className="home-wallet-actions">
          <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate("/my-games")}>
            Play Now
          </button>
          <button type="button" className="btn btn-secondary-custom btn-pill" onClick={() => navigate("/wallet?mode=add")}>
            Add Money
          </button>
        </div>
      </div>

      <div className="available-lotteries-row">
        <div>
          <div className="section-label">🔥 Available Lotteries</div>
          <div className="section-note">Play today and win big!</div>
        </div>
        <button type="button" className="view-all-btn" onClick={() => navigate("/lottery")}>View All →</button>
      </div>

      <section className="popular-games-section">
        <div className="popular-games-heading">
          <div>
            <div className="section-label">Popular Games</div>
            <div className="section-note">Fast access to your favourite betting rounds.</div>
          </div>
          <button type="button" className="btn btn-gradient-primary btn-pill" onClick={() => navigate("/my-games")}>
            View All Games
          </button>
        </div>

        <div className="popular-game-grid">
          <button type="button" className="popular-game-card" onClick={() => navigate("/lottery-game")}>
            <div className="popular-game-image">🎟</div>
            <div className="popular-game-title">Kerala Lottery</div>
            <div className="popular-game-desc">Play Kerala lottery and win big prizes.</div>
            <span className="popular-game-action">Play Now</span>
          </button>

          <button type="button" className="popular-game-card" onClick={() => navigate("/dice-3")}>
            <div className="popular-game-image">🎲</div>
            <div className="popular-game-title">Dice 3 Minutes</div>
            <div className="popular-game-desc">Predict the winning dice. Odds 1:150.</div>
            <span className="popular-game-action">Play Now</span>
          </button>

          <button type="button" className="popular-game-card" onClick={() => navigate("/dice-5")}>
            <div className="popular-game-image">🎲</div>
            <div className="popular-game-title">Dice 5 Minutes</div>
            <div className="popular-game-desc">Longer rounds with 1:150 odds.</div>
            <span className="popular-game-action">Play Now</span>
          </button>

          <button type="button" className="popular-game-card" onClick={() => navigate("/color-prediction")}>
            <div className="popular-game-image">🎨</div>
            <div className="popular-game-title">Colour Prediction</div>
            <div className="popular-game-desc">Predict Green, Violet or Red in 1-minute rounds.</div>
            <span className="popular-game-action">Play Now</span>
          </button>
        </div>
      </section>

      <div className="lottery-card-grid-premium">
        {lotteryCards.map((lottery) => (
          <LotteryCard
            key={lottery.id}
            lottery={lottery}
            onClick={() => navigate(lottery.route)}
            actionLabel="View Details"
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
