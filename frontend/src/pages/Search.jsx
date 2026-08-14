import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const searchItems = [
  { label: "Nagaland Morning", type: "Lottery", route: "/lottery?lotteryId=state-nagaland" },
  { label: "Sthree Sakthi", type: "Lottery", route: "/lottery?lotteryId=state-sthree" },
  { label: "Nagaland Day", type: "Lottery", route: "/lottery?lotteryId=state-nagaland-day" },
  { label: "Nagaland Evening", type: "Lottery", route: "/lottery?lotteryId=state-nagaland-evening" },
  { label: "Karunya Plus", type: "Lottery", route: "/lottery?lotteryId=state-karunya-plus" },
  { label: "Suvarna Keralam", type: "Lottery", route: "/lottery?lotteryId=state-suvarna-keralam" },
  { label: "Karunya", type: "Lottery", route: "/lottery?lotteryId=state-karunya" },
  { label: "Samrudhi", type: "Lottery", route: "/lottery?lotteryId=state-samrudhi" },
  { label: "Bhagyathara", type: "Lottery", route: "/lottery?lotteryId=state-bhagyathara" },
  { label: "Win Win", type: "Lottery", route: "/lottery?lotteryId=state-win-win" },
  { label: "Mega Draw Bonus", type: "Promotion", route: "/promotions" },
  { label: "Daily Spin", type: "Promotion", route: "/promotions" },
  { label: "Bonus Voucher", type: "Promotion", route: "/promotions" },
];

function Search() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchItems.filter((item) => item.label.toLowerCase().includes(normalized) || item.type.toLowerCase().includes(normalized));
  }, [query]);

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
