import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Search() {
  const [query, setQuery] = useState("");
  const [lotteries, setLotteries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const res = await API.get("/lottery/all");
        const apiLotteries = Array.isArray(res.data?.data) ? res.data.data : [];
        setLotteries(apiLotteries);
      } catch (err) {
        console.error("Failed to load search lottery list", err);
        setLotteries([]);
      }
    };

    fetchLotteries();
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const lotteryResults = lotteries
      .filter((lottery) =>
        (lottery.lotteryName || "").toLowerCase().includes(normalized)
      )
      .map((lottery) => ({
        label: lottery.lotteryName,
        type: "Lottery",
        route: `/lottery?lotteryId=${lottery.id}`,
      }));

    const promoResults = [
      { label: "Mega Draw Bonus", type: "Promotion", route: "/promotions" },
      { label: "Daily Spin", type: "Promotion", route: "/promotions" },
      { label: "Bonus Voucher", type: "Promotion", route: "/promotions" },
    ].filter((item) => item.label.toLowerCase().includes(normalized) || item.type.toLowerCase().includes(normalized));

    return [...lotteryResults, ...promoResults];
  }, [lotteries, query]);

  return (
      <div className="page-content">
        <div className="text-center page-intro">
          <div className="badge-pill">Search</div>
          <h2 className="page-title">Find Lotteries</h2>
          <p className="text-muted" style={{ margin: 0 }}>Search lotteries, games, and promotions.</p>
        </div>

        <div className="lottery-section search-panel">
          <div className="search-input-wrap">
            <input
              type="text"
              className="lottery-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lotteries, games, promotions..."
              autoFocus
            />
          </div>

          {results.length ? (
            <div className="search-results-grid">
              {results.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="home-card results-card"
                  onClick={() => navigate(item.route)}
                >
                  <div>
                    <div className="home-card-title">{item.label}</div>
                    <div className="home-card-subtitle">{item.type}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-muted search-empty">
              {query ? "No results found." : "Type to search lotteries, games, or promotions."}
            </div>
          )}
        </div>
      </div>
  );
}

export default Search;
