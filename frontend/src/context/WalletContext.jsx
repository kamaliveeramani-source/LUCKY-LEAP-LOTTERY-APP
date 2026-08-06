import { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext(null);
const WALLET_KEY = "demoWalletBalance";
const DEFAULT_BALANCE = 25000;

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const stored = window.localStorage.getItem(WALLET_KEY);
    return stored && !Number.isNaN(Number(stored)) ? Number(stored) : DEFAULT_BALANCE;
  });

  useEffect(() => {
    window.localStorage.setItem(WALLET_KEY, String(balance));
  }, [balance]);

  const updateBalance = (delta) => {
    setBalance((current) => Math.max(0, Number((current + Number(delta)).toFixed(2))));
  };

  const deposit = (amount) => updateBalance(Number(amount));
  const withdraw = (amount) => updateBalance(-Number(amount));

  return (
    <WalletContext.Provider value={{ balance, updateBalance, deposit, withdraw }}>
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
