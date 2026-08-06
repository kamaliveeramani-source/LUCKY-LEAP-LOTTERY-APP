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
  { label: "Jackpot Boost", type: "Promotion", route: "/promotions" },
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
        <div className="lottery-section" style={{ marginTop: "16px", padding: "18px" }}>
          <div style={{ marginBottom: "16px" }}>
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
            <div style={{ display: "grid", gap: "14px" }}>
              {results.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="home-card"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
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
            <div className="text-muted" style={{ marginTop: "12px" }}>
              {query ? "No results found." : "Type to search lotteries, games, or promotions."}
            </div>
          )}
        </div>
      </div>
  );
}

export default Search;
