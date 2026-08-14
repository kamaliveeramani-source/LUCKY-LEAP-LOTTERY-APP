import { useEffect, useState } from "react";
import API from "../services/api";

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
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>
            <span className="text-muted">Loading results...</span>
          </div>
        ) : lotteries.length === 0 ? (
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>
            <span className="text-muted">No results available yet.</span>
          </div>
        ) : (
          <div className="home-card-grid">
            {lotteries.map((lottery) => (
              <div key={lottery.id} className="home-card results-card">
                <div>
                  <div className="home-card-title">{lottery.lotteryName}</div>
                  <div className="home-card-subtitle" style={{ marginTop: "8px" }}>
                    Draw {new Date(lottery.drawDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ marginTop: "16px", color: "var(--text)" }}>
                  <p style={{ margin: "4px 0" }}><strong>Winner Ticket:</strong> {lottery.winnerTicketId ? `#${lottery.winnerTicketId}` : "Not declared yet"}</p>
                  <p className="results-prize-line">First Prize: ₹{lottery.firstPrize}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

export default Results;