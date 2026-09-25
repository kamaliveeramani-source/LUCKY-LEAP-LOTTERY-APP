import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import AddCash from "./pages/AddCash";
import Lottery from "./pages/Lottery";
import LotteryGame from "./pages/LotteryGame";
import MyGames from "./pages/MyGames";
import GameDetail from "./pages/GameDetail";
import Promotions from "./pages/Promotions";
import Offers from "./pages/Offers";
import Notifications from "./pages/Notifications";
import LanguageSettings from "./pages/LanguageSettings";
import Results from "./pages/Results";
import History from "./pages/History";
import About from "./pages/About";
import MobileApp from "./pages/MobileApp";
import MobileLayout from "./components/MobileLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Bets from "./pages/Bets";
import Referral from "./pages/Referral";

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/public" element={<MobileApp />} />
            <Route path="/home" element={<Home />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/results" element={<Results />} />
            <Route path="/language-settings" element={<LanguageSettings />} />
            <Route path="/language" element={<LanguageSettings />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/support" element={<Support />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lottery-game" element={<LotteryGame />} />
              <Route path="/lotterygame" element={<LotteryGame />} />
              <Route path="/game/:slug" element={<GameDetail />} />
              <Route path="/my-games" element={<MyGames />} />
              <Route path="/bets" element={<Bets />} />
              <Route path="/my-tickets" element={<History />} />
              <Route path="/history" element={<History />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/referrals" element={<Referral />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/add-cash" element={<AddCash />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />

        </Routes>
      </BrowserRouter>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;