import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API from "../services/api";

const WalletContext = createContext(null);

const EMPTY_WALLET = {
  wallet: 0,
  bonus: 0,
  winning: 0,
  todaysEarnings: 0,
  todaysBets: 0,
  totalDeposit: 0,
  totalWithdraw: 0,
  totalWinning: 0,
};

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(EMPTY_WALLET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshWallet = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    setLoading(true);
    setError("");
    try {
      const res = await API.get("/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      // API returns fields like wallet, bonus, winning, todaysEarnings, todaysBets, totalDeposit, totalWithdraw, totalWinning
      const next = {
        wallet: Number(data.wallet || 0),
        bonus: Number(data.bonus || 0),
        winning: Number(data.winning || 0),
        todaysEarnings: Number(data.todaysEarnings || 0),
        todaysBets: Number(data.todaysBets || 0),
        totalDeposit: Number(data.totalDeposit || 0),
        totalWithdraw: Number(data.totalWithdraw || 0),
        totalWinning: Number(data.totalWinning || 0),
      };

      setWallet(next);
      return next;
    } catch (err) {
      console.error("refreshWallet", err);
      setError(err.response?.data?.message || "Unable to load wallet");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // auto-refresh on mount if token present
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) refreshWallet();
    }
  }, [refreshWallet]);

  // Server-backed update helpers used by games and UI
  const deposit = async (amount) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      await API.post("/wallet/add", { amount }, { headers: { Authorization: `Bearer ${token}` } });
      return await refreshWallet();
    } catch (err) {
      console.error("deposit", err);
      throw err;
    }
  };

  const withdraw = async (amount) => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      await API.post("/wallet/withdraw", { amount }, { headers: { Authorization: `Bearer ${token}` } });
      return await refreshWallet();
    } catch (err) {
      console.error("withdraw", err);
      throw err;
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, balance: wallet.wallet, loading, error, refreshWallet, deposit, withdraw }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
