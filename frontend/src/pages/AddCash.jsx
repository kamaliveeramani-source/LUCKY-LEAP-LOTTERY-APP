import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../services/notificationService";
import { useWallet } from "../context/WalletContext";
import { useNotification } from "../context/NotificationContext";
import API from "../services/api";

function AddCash() {
  const { balance, refreshWallet } = useWallet();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddCash = async () => {
    setError("");
    const value = Number(amount);

    if (!value || value <= 0) {
      notify("warning", "Enter a valid amount");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      notify("warning", "You must be logged in to add cash.");
      return;
    }

    setSubmitting(true);

    try {
      await API.post(
        "/wallet/add",
        { amount: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addNotification("Deposit Received", `₹${Number(value).toFixed(2)} has been added to your wallet.`);
      setAmount("");
      await refreshWallet();
      navigate("/wallet");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Top up failed";
      setError(msg);
      notify("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      <div className="text-center page-intro">
        <div className="badge-pill">Add Cash</div>
        <h2 className="page-title">Top Up Wallet</h2>
        <p className="text-muted">Add money to your wallet instantly.</p>
      </div>

      <div className="wallet-hero-card">
        <div className="wallet-hero-label">Available Balance</div>
        <div className="wallet-hero-balance">₹ {balance.toLocaleString()}</div>
      </div>

      <div className="wallet-form-card">
        <h5>Top Up Wallet</h5>

        <div className="wallet-input-group">
          <label htmlFor="add-cash-amount">Amount</label>
          <div className="wallet-input-wrap">
            <span className="wallet-input-prefix">₹</span>
            <input
              id="add-cash-amount"
              className="form-control"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>

        {error ? (
          <div className="auth-error" role="alert" style={{ marginBottom: "12px" }}>{error}</div>
        ) : null}

        <button
          type="button"
          className="wallet-submit-btn"
          onClick={handleAddCash}
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Add Cash"}
        </button>

        <button
          type="button"
          className="btn btn-secondary-custom"
          onClick={() => navigate("/wallet")}
          style={{ width: "100%", marginTop: "12px" }}
        >
          View Wallet
        </button>
      </div>
    </div>
  );
}

export default AddCash;
