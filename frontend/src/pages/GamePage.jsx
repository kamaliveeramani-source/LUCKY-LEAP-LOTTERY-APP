import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const gameConfig = {
  dice: {
    title: "Dice Game",
    badge: "Roll & Win",
    description: "Pick a number from 1 to 6, place your bet, and roll the dice.",
    choices: [1, 2, 3, 4, 5, 6],
    buttonLabel: "Roll Dice",
    resultLabel: "Rolled Number",
    winText: "You won!",
    loseText: "Try again.",
  },
  colour: {
    title: "Colour Game",
    badge: "Pick a Colour",
    description: "Choose a colour and try to match the draw.",
    choices: ["Red", "Blue", "Green", "Yellow"],
    buttonLabel: "Draw Colour",
    resultLabel: "Drawn Colour",
    winText: "Colour matched!",
    loseText: "Better luck next time.",
  },
  car: {
    title: "Car Race",
    badge: "Race Start",
    description: "Pick your car and see if it wins the race.",
    choices: ["Red", "Blue", "Green", "Yellow"],
    buttonLabel: "Start Race",
    resultLabel: "Winning Car",
    winText: "Your car won!",
    loseText: "Race lost. Try again.",
  },
};

function GamePage() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const game = gameConfig[gameType];
  const [choice, setChoice] = useState(game?.choices?.[0] ?? "");
  const [amount, setAmount] = useState(50);
  const [result, setResult] = useState(null);

  if (!game) {
    return (
      <div className="page-content">
        <div className="home-section-title">
          <div className="section-label">Unknown Game</div>
          <div className="section-note">Choose a valid game from the home screen.</div>
        </div>
      </div>
    );
  }

  const handlePlay = () => {
    if (!choice) {
      alert("Please choose an option");
      return;
    }
    const pool = gameType === "dice" ? [1, 2, 3, 4, 5, 6] : game.choices;
    const drawn = pool[Math.floor(Math.random() * pool.length)];
    const didWin = String(drawn).toLowerCase() === String(choice).toLowerCase();
    setResult({ drawn, didWin });
  };

  return (
      <div className="page-content">
        <div className="lottery-hero" style={{ padding: "28px 24px" }}>
          <div className="lottery-hero-badge">{game.badge}</div>
          <h2>{game.title}</h2>
          <p>{game.description}</p>
          <div className="home-game-row" style={{ marginTop: "18px" }}>
            {game.choices.map((item) => (
              <button
                key={item}
                type="button"
                className={`home-game-pill ${String(item) === String(choice) ? "active" : ""}`}
                onClick={() => setChoice(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="lottery-section">
          <div className="home-section-title">
            <div className="section-label">Bet Amount</div>
            <div className="section-note">Place your stake for the next round.</div>
          </div>
          <input
            className="form-control lottery-input"
            type="number"
            min="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter bet amount"
          />
          <button className="btn btn-gradient-success btn-pill mt-4" style={{ width: "100%" }} onClick={handlePlay}>
            {game.buttonLabel}
          </button>
        </div>

        {result && (
          <div className="lottery-section" style={{ textAlign: "center" }}>
            <div className="section-label">{game.resultLabel}</div>
            <div className="section-note" style={{ marginBottom: "18px" }}>
              {result.drawn}
            </div>
            <div className="btn btn-gradient-primary btn-pill">
              {result.didWin ? game.winText : game.loseText}
            </div>
          </div>
        )}
      </div>
  );
}

export default GamePage;
