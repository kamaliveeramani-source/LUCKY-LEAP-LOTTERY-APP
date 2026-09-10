import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Search() {
  const [query, setQuery] = useState("");
  const [lotteries, setLotteries] = useState([]);
  const [content, setContent] = useState({ games: [], promotions: [], offers: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const [lotteryResponse, gamesResponse, promotionsResponse, offersResponse] = await Promise.all([
          API.get("/lottery/all"),
          API.get("/games"),
          API.get("/promotions"),
          API.get("/offers"),
        ]);
        setLotteries(Array.isArray(lotteryResponse.data?.data) ? lotteryResponse.data.data : []);
        setContent({
          games: gamesResponse.data?.data || [],
          promotions: promotionsResponse.data?.data || [],
          offers: offersResponse.data?.data || [],
        });
      } catch (err) {
        console.error("Failed to load search lottery list", err);
        setLotteries([]);
        setContent({ games: [], promotions: [], offers: [] });
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

    const gameResults = content.games
      .filter((game) => `${game.name} ${game.category} ${game.description}`.toLowerCase().includes(normalized))
      .map((game) => ({ label: game.name, type: "Game", route: "/my-games" }));
    const promoResults = content.promotions
      .filter((promotion) => `${promotion.title} ${promotion.type} ${promotion.description}`.toLowerCase().includes(normalized))
      .map((promotion) => ({ label: promotion.title, type: "Promotion", route: "/promotions" }));
    const offerResults = content.offers
      .filter((offer) => `${offer.title} ${offer.type} ${offer.description} ${offer.rewardText}`.toLowerCase().includes(normalized))
      .map((offer) => ({ label: offer.title, type: "Offer", route: "/offers" }));

    return [...lotteryResults, ...gameResults, ...promoResults, ...offerResults];
  }, [content, lotteries, query]);

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
