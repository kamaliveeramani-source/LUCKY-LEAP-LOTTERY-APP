import { useEffect, useState } from "react";
import API from "../services/api";
import { getLotteryImageByName } from "../components/LotteryCard";

const CARD_VARIANTS = ["purple", "orange", "blue"];

function formatDrawDate(dateString) {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString("en-US");
}

function formatIndianCurrency(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function ResultCard({ lottery, variantIndex = 0 }) {
  const variant = CARD_VARIANTS[variantIndex % CARD_VARIANTS.length];
  const imageSrc = getLotteryImageByName(lottery.lotteryName || lottery.name || "");
  const winnerLabel = lottery.winnerTicketId ? `#${lottery.winnerTicketId}` : "Not declared yet";

  return (
    <article className={`result-card result-card--${variant}`}>
      <div className="result-card__badge">Result</div>

      <h3 className="result-card__title">{lottery.lotteryName}</h3>
      <p className="result-card__draw-date">Draw {formatDrawDate(lottery.drawDate)}</p>

      <div className="result-card__details">
        <div className="result-card__detail">
          <span className="result-card__label">Winner Ticket</span>
          <span className="result-card__value">{winnerLabel}</span>
        </div>
        <div className="result-card__detail">
          <span className="result-card__label">First Prize</span>
          <span className="result-card__value result-card__value--prize">
            {formatIndianCurrency(lottery.firstPrize)}
          </span>
        </div>
      </div>

      <div className="result-card__watermark" aria-hidden="true">
        <img src={imageSrc} alt="" loading="lazy" />
      </div>
    </article>
  );
}

function ResultSkeletonCard() {
  return (
    <div className="result-skeleton-card" aria-hidden="true">
      <div className="result-skeleton-badge" />
      <div className="result-skeleton-line result-skeleton-line--title" />
      <div className="result-skeleton-line result-skeleton-line--date" />
      <div className="result-skeleton-details">
        <div className="result-skeleton-line" />
        <div className="result-skeleton-line result-skeleton-line--value" />
        <div className="result-skeleton-line" />
        <div className="result-skeleton-line result-skeleton-line--value" />
      </div>
    </div>
  );
}

function Results() {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/lottery/all");
      setLotteries(res.data.data || []);
    } catch (err) {
      console.log(err);
      setLotteries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="text-center page-intro">
        <div className="badge-pill">Results</div>
        <h2 className="page-title">Lottery Results</h2>
        <p className="text-muted" style={{ margin: 0 }}>Recent draw outcomes from the backend.</p>
      </div>

      {loading ? (
        <div className="results-grid" aria-busy="true" aria-label="Loading results">
          <ResultSkeletonCard />
          <ResultSkeletonCard />
          <ResultSkeletonCard />
        </div>
      ) : lotteries.length === 0 ? (
        <div className="result-state-message">
          <p className="result-state-text">No results available yet.</p>
        </div>
      ) : (
        <div className="results-grid">
          {lotteries.map((lottery, index) => (
            <ResultCard key={lottery.id} lottery={lottery} variantIndex={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Results;
