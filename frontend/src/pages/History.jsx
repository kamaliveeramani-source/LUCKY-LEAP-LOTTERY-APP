import { useEffect, useState } from "react";
import API from "../services/api";

function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await API.get("/ticket/mytickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.log(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="page-content">
        <div className="text-center" style={{ marginBottom: "20px" }}>
          <div className="badge-pill">History</div>
          <h2 className="page-title" style={{ margin: "10px 0 6px", fontWeight: 800 }}>Bet History</h2>
          <p className="text-muted" style={{ margin: 0 }}>Your purchased tickets and draw status from the backend.</p>
        </div>

        {loading ? (
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>Loading your history...</div>
        ) : tickets.length === 0 ? (
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>No ticket history found yet.</div>
        ) : (
          <div className="home-card-grid">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card-panel card-panel-strong">
                <div className="home-card-title">Ticket {ticket.ticketNumber}</div>
                <p className="text-muted" style={{ margin: "6px 0 10px" }}>{ticket.Lottery?.lotteryName || "Unknown Lottery"}</p>
                <div className="d-flex justify-content-between align-items-center" style={{ gap: "10px" }}>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span className="badge-pill" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                    {ticket.Lottery?.winnerTicketId === ticket.id ? "Won" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

export default History;