import { createContext, useContext, useEffect, useState, useCallback } from "react";
import API, { getAuthToken, clearAuthToken } from "../services/api";

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
  const [authReady, setAuthReady] = useState(false);

  const refreshWallet = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setWallet(EMPTY_WALLET);
      return null;
    }

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
      console.error("[WALLET] Failed to refresh wallet:", err.response?.status, err.response?.data?.message);
      // Handle 401 Unauthorized
      if (err.response?.status === 401) {
        console.warn("[WALLET] Token expired or invalid, clearing storage");
        clearAuthToken();
        setWallet(EMPTY_WALLET);
        setError("Session expired. Please log in again.");
        return null;
      }
      setError(err.response?.data?.message || "Unable to load wallet");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-refresh wallet on mount if token is present
    const token = getAuthToken();
    if (token) {
      console.log("[WALLET] Token found, refreshing wallet on mount");
      refreshWallet();
    } else {
      console.log("[WALLET] No token found on mount");
      setWallet(EMPTY_WALLET);
    }
    setAuthReady(true);
  }, []);

  // Server-backed update helpers used by games and UI
  const deposit = async (amount) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token available");
    }
    try {
      await API.post("/wallet/add", { amount }, { headers: { Authorization: `Bearer ${token}` } });
      return await refreshWallet();
    } catch (err) {
      console.error("[WALLET] Deposit failed:", err.response?.status, err.response?.data?.message);
      if (err.response?.status === 401) {
        clearAuthToken();
      }
      throw err;
    }
  };

  const withdraw = async (amount) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token available");
    }
    try {
      await API.post("/wallet/withdraw", { amount }, { headers: { Authorization: `Bearer ${token}` } });
      return await refreshWallet();
    } catch (err) {
      console.error("[WALLET] Withdraw failed:", err.response?.status, err.response?.data?.message);
      if (err.response?.status === 401) {
        clearAuthToken();
      }
      throw err;
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, balance: wallet.wallet, loading, error, authReady, refreshWallet, deposit, withdraw }}>
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
