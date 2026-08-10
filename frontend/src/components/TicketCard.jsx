function getTicketStatus(ticket) {
  if (ticket.Lottery?.winnerTicketId === ticket.id) {
    return { label: "Won", className: "won", icon: "✓" };
  }
  if (ticket.Lottery?.winnerTicketId && ticket.Lottery.winnerTicketId !== ticket.id) {
    return { label: "Lost", className: "lost", icon: "✗" };
  }
  return { label: "Pending", className: "pending", icon: "⏳" };
}

function TicketCard({ ticket }) {
  const status = getTicketStatus(ticket);
  const lotteryName = ticket.Lottery?.lotteryName || "Unknown Lottery";
  const ticketPrice = ticket.Lottery?.ticketPrice;
  const drawDate = ticket.Lottery?.drawDate;

  const formattedDate = drawDate
    ? new Date(drawDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "-";

  const formattedTime = drawDate
    ? new Date(drawDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <div className="ticket-card-number">{ticket.ticketNumber}</div>
        <span className={`ticket-status-badge ${status.className}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div className="ticket-card-lottery">{lotteryName}</div>

      <div className="ticket-card-details">
        {ticketPrice ? (
          <span className="ticket-card-detail">💰 ₹{ticketPrice}</span>
        ) : null}
        <span className="ticket-card-detail">📅 {formattedDate}</span>
        {formattedTime ? (
          <span className="ticket-card-detail">🕐 {formattedTime}</span>
        ) : null}
      </div>
    </div>
  );
}

export default TicketCard;
