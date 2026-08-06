import { useNavigate } from "react-router-dom";

function MenuList() {
  const navigate = useNavigate();

  return (
    <div className="card mb-4">
      <div className="card-body">

        <h5>Quick Menu</h5>

        <ul className="list-group">

          <li
            className="list-group-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/lottery")}
          >
            🎟 Buy Lottery
          </li>

          <li
            className="list-group-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/lotterygame")}
          >
            🎯 My Bets
          </li>

          <li
            className="list-group-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            🎫 My Tickets
          </li>

          <li
            className="list-group-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/wallet")}
          >
            💰 Wallet
          </li>

        </ul>

      </div>
    </div>
  );
}

export default MenuList;