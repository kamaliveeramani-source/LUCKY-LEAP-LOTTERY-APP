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
    setMode(params.get("mode") || "add");
  }, [location.search]);

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

  return (
      <div className="page-content">
        <div className="text-center" style={{ marginBottom: "22px" }}>
          <div className="badge-pill">Wallet</div>
          <h2 className="page-title" style={{ margin: "10px 0 6px", fontWeight: 800 }}>Manage Funds</h2>
          <p className="text-muted">Add, withdraw, or transfer cash in the demo wallet.</p>
        </div>

        <div className="card-panel card-panel-strong mb-4">
          <h5>Available Balance</h5>

          <h1 style={{ color: "var(--accent)" }}>
            ₹ {balance.toLocaleString()}
          </h1>

          <div className="btn-group" style={{ marginTop: "18px" }}>
            <button
              className={`btn ${mode === "add" ? "btn-gradient-primary" : "btn-secondary-custom"}`}
              onClick={() => navigate("/wallet?mode=add")}
              disabled={submitting}
              style={{ minWidth: "100px" }}
            >
              Top Up
            </button>
            <button
              className={`btn ${mode === "withdraw" ? "btn-gradient-primary" : "btn-secondary-custom"}`}
              onClick={() => navigate("/wallet?mode=withdraw")}
              disabled={submitting}
              style={{ minWidth: "100px" }}
            >
              Withdraw
            </button>
            <button
              className={`btn ${mode === "transfer" ? "btn-gradient-primary" : "btn-secondary-custom"}`}
              onClick={() => navigate("/wallet?mode=transfer")}
              disabled={submitting}
              style={{ minWidth: "100px" }}
            >
              Send
            </button>
          </div>
        </div>

        <div className="card-panel card-panel-strong mb-4">
          <h5>{mode === "withdraw" ? "Withdraw Funds" : mode === "transfer" ? "Send Funds" : "Top Up Wallet"}</h5>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Amount</label>
            <input
              className="form-control"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          {mode === "transfer" && (
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Recipient (mobile or email)</label>
              <input
                className="form-control"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient mobile number or email"
              />
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: "12px" }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary-custom w-100"
            onClick={submitWalletAction}
            style={{ height: "52px" }}
            disabled={submitting}
          >
            {submitting ? "Processing..." : mode === "withdraw" ? "Withdraw" : mode === "transfer" ? "Send" : "Top Up"}
          </button>
        </div>

        <div>
          <h4 style={{ marginBottom: "14px" }}>Recent Transactions</h4>

          {transactions.length === 0 ? (
            <div className="card-panel card-panel-strong">
              <p className="text-muted" style={{ margin: 0 }}>No transactions yet. Use the controls above to update the wallet.</p>
            </div>
          ) : (
            <div className="card-panel card-panel-strong">
              {transactions.map((txn) => (
                <div key={txn.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                    <strong>{txn.type}</strong>
                    <span style={{ color: "var(--text-secondary)" }}>{txn.timestamp}</span>
                  </div>
                  <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>{txn.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

export default Wallet;