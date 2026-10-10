import { useEffect, useState } from "react";
import API, { getAuthToken } from "../services/api";

function formatDrawDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
    const refreshTickets = () => {
      if (document.visibilityState === "visible") loadHistory(true);
    };
    const refreshTimer = window.setInterval(refreshTickets, 30000);
    window.addEventListener("focus", refreshTickets);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshTickets);
    };
  }, []);

  const loadHistory = async (quiet = false) => {
    const token = getAuthToken();

    if (!token) {
      setTickets([]);
      if (!quiet) setLoading(false);
      return;
    }

    try {
      if (!quiet) setLoading(true);
      const res = await API.get("/ticket/mytickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.log(err);
      if (!quiet) setTickets([]);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  return (
      <div className="page-content">
        <div className="text-center page-intro">
          <div className="badge-pill">History</div>
          <h2 className="page-title">My Tickets</h2>
          <p className="text-muted" style={{ margin: 0 }}>Your purchased lottery tickets and current draw status.</p>
        </div>

        {loading ? (
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>Loading your history...</div>
        ) : tickets.length === 0 ? (
          <div className="card-panel card-panel-strong" style={{ textAlign: "center" }}>No ticket history found yet.</div>
        ) : (
          <div className="home-card-grid">
            {tickets.map((ticket) => {
              const winningResult = ticket.Lottery?.winningResults?.find((result) => result.betType === ticket.betType);
              return (
                <div key={ticket.id} className="card-panel card-panel-strong">
                  <div className="home-card-title">Ticket {ticket.ticketNumber}</div>
                  <p className="text-muted" style={{ margin: "6px 0 10px" }}>{ticket.Lottery?.lotteryName || ticket.GameDefinition?.name || "Unknown ticket"}</p>
                  <p className="text-muted" style={{ margin: "0 0 10px", fontSize: "0.85rem" }}>
                    {ticket.betType} · Number {ticket.selectedNumber}
                    {ticket.Lottery?.drawDate ? ` · Draw ${formatDrawDateTime(ticket.Lottery.drawDate)}` : ""}
                    {winningResult ? ` · Winning number ${winningResult.winningNumber}` : ""}
                  </p>
                  <div className="d-flex justify-content-between align-items-center" style={{ gap: "10px" }}>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className="badge-pill" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                      {ticket.status === "WON" ? `Won · ₹${Number(ticket.winningAmount || 0).toLocaleString("en-IN")}` : ticket.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}

export default History;