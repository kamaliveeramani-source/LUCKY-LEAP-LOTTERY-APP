import { useNavigate } from "react-router-dom";

function ActionButtons() {

  const navigate = useNavigate();

  return (
    <div className="row mb-4">

      <div className="col">
        <button
          className="btn btn-success w-100"
          onClick={() => navigate("/wallet?mode=add")}
        >
          Deposit
        </button>
      </div>

      <div className="col">
        <button
          className="btn btn-warning w-100"
          onClick={() => navigate("/wallet?mode=withdraw")}
        >
          Withdraw
        </button>
      </div>

      <div className="col">
        <button
          className="btn btn-info w-100"
          onClick={() => navigate("/wallet?mode=transfer")}
        >
          Transfer
        </button>
      </div>

      <div className="col">
        <button
          className="btn btn-primary w-100"
          onClick={() => navigate("/lotterygame")}
        >
          My Bets
        </button>
      </div>

    </div>
  );
}

export default ActionButtons;