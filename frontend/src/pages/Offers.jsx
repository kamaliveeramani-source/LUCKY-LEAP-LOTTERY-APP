import { useEffect, useState } from "react";
import API from "../services/api";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    API.get("/offers").then((response) => {
      setOffers(response.data?.data || []);
      setState("success");
    }).catch(() => setState("error"));
  }, []);

  return <div className="page-content"><div className="home-section-title"><div className="section-label">Offers</div><div className="section-note">Available rewards and member benefits.</div></div>{state === "loading" && <div className="empty-state">Loading offers...</div>}{state === "error" && <div className="error-box">Unable to load offers.</div>}{state === "success" && <div className="home-card-grid">{offers.map((offer) => <article className="home-card" key={offer.id} style={offer.image ? { backgroundImage: `url(${offer.image})`, backgroundSize: "cover" } : undefined}><div><div className="home-card-title">{offer.title}</div><div className="home-card-subtitle">{offer.description}</div>{offer.rewardText && <div className="home-card-subtitle">{offer.rewardText}</div>}</div></article>)}{offers.length === 0 && <div className="empty-state">No offers available right now.</div>}</div>}</div>;
}

export default Offers;
