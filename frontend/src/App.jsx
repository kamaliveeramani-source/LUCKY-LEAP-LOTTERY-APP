import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Lottery from "./pages/Lottery";
import LotteryGame from "./pages/LotteryGame";
import MyGames from "./pages/MyGames";
import JackpotGame from "./pages/JackpotGame";
import Dice3MinGame from "./pages/Dice3MinGame";
import Dice5MinGame from "./pages/Dice5MinGame";
import ColorPrediction from "./pages/ColorPrediction";
import GamePage from "./pages/GamePage";
import Promotions from "./pages/Promotions";
import Notifications from "./pages/Notifications";
import LanguageSettings from "./pages/LanguageSettings";
import Results from "./pages/Results";
import History from "./pages/History";
import About from "./pages/About";
import MobileApp from "./pages/MobileApp";
import MobileLayout from "./components/MobileLayout";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Support from "./pages/Support";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<MobileApp />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/lottery-game" element={<LotteryGame />} />
            <Route path="/lotterygame" element={<LotteryGame />} />
            <Route path="/dice-3" element={<Dice3MinGame />} />
            <Route path="/dice-5" element={<Dice5MinGame />} />
            <Route path="/color-prediction" element={<ColorPrediction />} />
            <Route path="/jackpot" element={<JackpotGame />} />
            <Route path="/my-games" element={<MyGames />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/language-settings" element={<LanguageSettings />} />
            <Route path="/language" element={<LanguageSettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;