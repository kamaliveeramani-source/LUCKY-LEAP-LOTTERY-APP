import { useState } from "react";
import GameShell from "./GameShell";

const asOptions = (values, fallback = []) => (Array.isArray(values) && values.length ? values : fallback).map((item, index) => typeof item === "object" ? item : { value: item, label: item, key: String(item), index });
const optionFor = (options, value) => options.find((item) => String(item.value ?? item.key ?? item.number ?? item.label) === String(value));

export function GreenYellowRedGame({ game, config }) {
  const values = asOptions(config.numbers, Array.from({ length: 10 }, (_, number) => ({ number, color: ["GREEN", "YELLOW", "RED"][number % 3] })));
  const [selected, setSelected] = useState(null); const [filter, setFilter] = useState("ALL");
  const visible = filter === "ALL" ? values : values.filter((item) => String(item.color || item.colour).toUpperCase() === filter);
  return <GameShell game={game} config={config} accent="game-gyr" rules="Choose a colour-mapped number, select a virtual-credit amount, and place one selection during the open issue. Results are published by the game administrator." selectedValue={selected?.number ?? selected?.value} selectedLabel="Colour and number" selectedOption={selected} submitValue={selected?.number ?? selected?.value} resultLabel="Number / colour">
    <div className="gyr-colour-options">{["GREEN", "YELLOW", "RED", "ALL"].map((colour) => <button type="button" key={colour} className={`gyr-colour ${colour.toLowerCase()} ${filter === colour ? "active" : ""}`} onClick={() => setFilter(colour)}>{colour}</button>)}</div><div className="gyr-number-grid">{visible.map((item, index) => { const number = item.number ?? item.value ?? index; const colour = String(item.color || item.colour || ["GREEN", "YELLOW", "RED"][number % 3]).toLowerCase(); return <button type="button" key={item.id || number} className={`gyr-number-ball ${colour} ${selected === item ? "selected" : ""}`} onClick={() => setSelected(item)}><span>{number}</span></button>; })}</div>
  </GameShell>;
}

export function ABCDigitGame({ game, config }) {
  const divisions = asOptions(config.divisions, ["A", "B", "C"]); const digits = asOptions(config.digits, Array.from({ length: 10 }, (_, digit) => digit));
  const [division, setDivision] = useState(null); const [digit, setDigit] = useState(null); const selectedValue = division && digit !== null ? `${division.value ?? division.label}-${digit.value ?? digit.label}` : null;
  return <GameShell game={game} config={config} accent="game-abc" rules="Choose one configured division and one digit. Your virtual-credit selection is attached to the current open issue and the published result comes from the backend." selectedValue={selectedValue} selectedLabel="Division and digit" selectedOption={optionFor(game.options || [], selectedValue)} submitValue={selectedValue} resultLabel="Division / digit">
    <div className="gyr-colour-options abc-division-options">{divisions.map((item, index) => <button type="button" key={item.id || item.value || item.label} className={`gyr-colour abc-division abc-division-${index} ${division === item ? "active" : ""}`} onClick={() => setDivision(item)}>{item.label}</button>)}</div><div className="gyr-number-grid abc-digit-options">{digits.map((item, index) => <button type="button" key={item.id || item.value || item.label} className={`gyr-number-ball abc-digit-ball ${digit === item ? "selected" : ""}`} onClick={() => setDigit(item)}><span>{item.label}</span></button>)}</div>
  </GameShell>;
}

export function GoldenSpinGame({ game, config }) {
  const numbers = asOptions(config.numbers, game.options?.length ? game.options : Array.from({ length: 10 }, (_, number) => number)); const [selected, setSelected] = useState(null);
  return <GameShell game={game} config={config} accent="game-golden" rules="Choose a configured wheel number before the issue closes. The wheel is a visual representation only; the published result is supplied by the backend." selectedValue={selected?.value ?? selected?.number ?? selected?.label} selectedLabel="Wheel number" selectedOption={selected} submitValue={selected?.value ?? selected?.number ?? selected?.label}>
    <div className="golden-wheel" aria-label="Golden Spin wheel"><div className="golden-wheel-center">✦</div>{numbers.map((item, index) => <button type="button" key={item.id || item.value || item.number || index} className={selected === item ? "selected" : ""} style={{ "--wheel-index": index, "--wheel-count": numbers.length }} onClick={() => setSelected(item)}>{item.label ?? item.value ?? item.number ?? index}</button>)}</div><div className="golden-choice-row">{selected ? `Selected ${selected.label ?? selected.value ?? selected.number}` : "Choose a wheel number"}</div>
  </GameShell>;
}

export function PokerGame({ game, config }) {
  const choices = asOptions(config.options, game.options?.length ? game.options : ["PAIR", "HIGH CARD", "FLUSH"]); const [selected, setSelected] = useState(null);
  return <GameShell game={game} config={config} accent="game-poker" rules="Choose a demo poker outcome for the current issue. This is a virtual-credit prediction game, not a poker table or real-money game." selectedValue={selected?.value ?? selected?.label} selectedLabel="Poker prediction" selectedOption={selected} submitValue={selected?.value ?? selected?.label}>
    <div className="poker-table"><div className="poker-card-row"><span>♠ A</span><span>♥ K</span><span>♦ 7</span><span>♣ 2</span><span>?</span></div><p>Choose the configured outcome</p><div className="poker-choice-grid">{choices.map((item) => <button type="button" key={item.id || item.value || item.label} className={selected === item ? "selected" : ""} onClick={() => setSelected(item)}>{item.label}</button>)}</div></div>
  </GameShell>;
}

export function RummyGame({ game, config }) {
  const choices = asOptions(config.options, game.options?.length ? game.options : ["PURE SEQUENCE", "SET", "SEQUENCE"]); const [selected, setSelected] = useState(null);
  return <GameShell game={game} config={config} accent="game-rummy" rules="Select a configured rummy pattern for the open demo round. All entries use virtual credits and the result is published by the backend." selectedValue={selected?.value ?? selected?.label} selectedLabel="Rummy pattern" selectedOption={selected} submitValue={selected?.value ?? selected?.label}>
    <div className="rummy-table"><div className="rummy-card-row">{["A♥", "7♦", "K♣", "3♠"].map((card) => <span key={card}>{card}</span>)}</div><div className="rummy-choice-grid">{choices.map((item) => <button type="button" key={item.id || item.value || item.label} className={selected === item ? "selected" : ""} onClick={() => setSelected(item)}>{item.label}</button>)}</div></div>
  </GameShell>;
}

export function CricketGame({ game, config }) {
  const categories = asOptions(config.categories, ["INTERNATIONAL", "T20", "IPL"]); const events = asOptions(config.events || config.matches, game.options?.length ? game.options : ["MATCH WINNER", "TOP SCORE", "TOTAL RUNS"]); const [category, setCategory] = useState(categories[0]); const [selected, setSelected] = useState(null);
  return <GameShell game={game} config={config} accent="game-cricket" rules="Choose a configured cricket category and event prediction for the current demo issue. Match outcomes and results come from the backend." selectedValue={selected?.value ?? selected?.label} selectedLabel={`${category?.label || category?.value} event`} selectedOption={selected} submitValue={selected?.value ?? selected?.label} resultLabel="Cricket event">
    <div className="cricket-scoreboard"><span>LIVE DEMO</span><strong>INTERNATIONAL • {category?.label || category?.value}</strong><small>Next event selection</small></div><div className="cricket-category-grid">{categories.map((item) => <button type="button" key={item.id || item.value || item.label} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item.label}</button>)}</div><div className="cricket-event-grid">{events.map((item) => <button type="button" key={item.id || item.value || item.label} className={selected === item ? "selected" : ""} onClick={() => setSelected(item)}><span>🏏</span>{item.label}</button>)}</div>
  </GameShell>;
}
