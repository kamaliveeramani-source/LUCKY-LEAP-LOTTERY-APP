import { useEffect, useState } from "react";
import API from "../services/api";

function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    API.get("/promotions").then((response) => {
      setPromotions(response.data?.data || []);
      setState("success");
    }).catch(() => setState("error"));
  }, []);

  return (
      <div className="page-content">
        <div className="home-section-title">
          <div className="section-label">Latest Offers</div>
          <div className="section-note">Tap an offer to learn more and claim rewards.</div>
        </div>

        {state === "loading" && <div className="empty-state">Loading promotions...</div>}
        {state === "error" && <div className="error-box">Unable to load promotions.</div>}
        {state === "success" && <div className="lottery-section"><div className="home-card-grid">{promotions.map((promotion) => <article className="home-card" key={promotion.id} style={promotion.image ? { backgroundImage: `url(${promotion.image})`, backgroundSize: "cover" } : undefined}><div><div className="home-card-title">{promotion.title}</div><div className="home-card-subtitle">{promotion.description}</div></div></article>)}{promotions.length === 0 && <div className="empty-state">No promotions available right now.</div>}</div></div>}
      </div>
  );
}

export default Promotions;
