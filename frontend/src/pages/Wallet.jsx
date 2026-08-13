import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addNotification } from "../services/notificationService";
import { useWallet } from "../context/WalletContext";
import { useNotification } from "../context/NotificationContext";
import API from "../services/api";

function Wallet() {
  const { balance, refreshWallet } = useWallet();
  const [mode, setMode] = useState("add");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextMode = params.get("mode");

    if (nextMode === "add") {
      navigate("/add-cash", { replace: true });
      return;
    }

    setMode(["withdraw", "transfer"].includes(nextMode) ? nextMode : "withdraw");
  }, [location.search, navigate]);

  const { notify } = useNotification();

  const submitWalletAction = async () => {
    setError("");
    const value = Number(amount);

    if (!value || value <= 0) {
      notify("warning", "Enter a valid amount");
      return;
    }

    if (mode === "withdraw" && value > balance) {
      notify("error", "Insufficient wallet funds.");
      return;
    }

    if (mode === "transfer" && !recipient.trim()) {
      notify("warning", "Enter a recipient mobile or email");
      return;
    }

    const formattedAmount = Number(amount).toFixed(2);
    const token = localStorage.getItem("token");
    if (!token) {
      notify("warning", "You must be logged in to perform this action.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "add") {
        await API.post(
          "/wallet/add",
          { amount: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addNotification("Deposit Received", `₹${formattedAmount} has been added to your wallet.`);
      } else if (mode === "withdraw") {
        await API.post(
          "/wallet/withdraw",
          { amount: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addNotification("Withdrawal Processed", `₹${formattedAmount} has been withdrawn from your wallet.`);
      } else {
        await API.post(
          "/wallet/transfer",
          { amount: value, recipient: recipient.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addNotification("Transfer Sent", `₹${formattedAmount} sent to ${recipient.trim()}.`);
      }

      const transaction = {
        id: Date.now(),
        type: mode === "add" ? "Deposit" : mode === "withdraw" ? "Withdrawal" : "Transfer",
        amount: value,
        description:
          mode === "add"
            ? `Added ₹${formattedAmount} to your wallet.`
            : mode === "withdraw"
            ? `Withdrew ₹${formattedAmount} from your wallet.`
            : `Sent ₹${formattedAmount} to ${recipient.trim()}.`,
        timestamp: new Date().toLocaleString(),
      };

      setTransactions((prev) => [transaction, ...prev].slice(0, 6));
      setAmount("");
      setRecipient("");

      await refreshWallet();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Transaction failed";
      setError(msg);
      notify("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modeLabels = { withdraw: "Withdraw", transfer: "Send" };
  const txnIcons = { Deposit: "deposit", Withdrawal: "withdrawal", Transfer: "transfer" };
  const txnEmoji = { Deposit: "↑", Withdrawal: "↓", Transfer: "↔" };

  return (
    <div className="page-content">
      <div className="text-center" style={{ marginBottom: "22px" }}>
        <div className="badge-pill">Wallet</div>
        <h2 className="page-title" style={{ margin: "10px 0 6px", fontWeight: 800 }}>Manage Funds</h2>
        <p className="text-muted">Add, withdraw, or transfer cash in your wallet.</p>
      </div>

      <div className="wallet-hero-card">
        <div className="wallet-hero-label">Available Balance</div>
        <div className="wallet-hero-balance">₹ {balance.toLocaleString()}</div>
      </div>

      <div className="wallet-mode-tabs">
        {["withdraw", "transfer"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`wallet-mode-tab ${mode === tab ? "active" : ""}`}
            onClick={() => navigate(`/wallet?mode=${tab}`)}
            disabled={submitting}
          >
            {modeLabels[tab]}
          </button>
        ))}
      </div>

      <div className="wallet-form-card">
        <h5>{mode === "withdraw" ? "Withdraw Funds" : "Send Funds"}</h5>

        <div className="wallet-input-group">
          <label htmlFor="wallet-amount">Amount</label>
          <div className="wallet-input-wrap">
            <span className="wallet-input-prefix">₹</span>
            <input
              id="wallet-amount"
              className="form-control"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>

        {mode === "transfer" && (
          <div className="wallet-input-group">
            <label htmlFor="wallet-recipient">Recipient (mobile or email)</label>
            <input
              id="wallet-recipient"
              className="form-control"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient mobile number or email"
              style={{ height: "52px", borderRadius: "14px" }}
            />
          </div>
        )}

        {error ? (
          <div className="auth-error" role="alert" style={{ marginBottom: "12px" }}>{error}</div>
        ) : null}

        <button
          type="button"
          className="wallet-submit-btn"
          onClick={submitWalletAction}
          disabled={submitting}
        >
          {submitting ? "Processing..." : modeLabels[mode]}
        </button>
      </div>

      <div style={{ marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <h4 style={{ margin: 0, fontWeight: 800 }}>Recent Transactions</h4>
          <button type="button" className="btn btn-secondary-custom" onClick={() => navigate("/add-cash")}>
            Add Cash
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="wallet-form-card">
            <p className="text-muted" style={{ margin: 0, textAlign: "center" }}>
              No transactions yet. Use the controls above to update the wallet.
            </p>
          </div>
        ) : (
          <div className="txn-list">
            {transactions.map((txn) => (
              <div key={txn.id} className="txn-item">
                <div className={`txn-icon ${txnIcons[txn.type]}`}>
                  {txnEmoji[txn.type]}
                </div>
                <div className="txn-body">
                  <div className="txn-type">{txn.type}</div>
                  <p className="txn-desc">{txn.description}</p>
                </div>
                <span className="txn-time">{txn.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallet;
