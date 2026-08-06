import nagalandMorning from "../assets/lotteries/nagaland-morning.png";
import sthreeSakthi from "../assets/lotteries/sthree-sakthi.png";
import nagalandDay from "../assets/lotteries/nagaland-day.png";
import nagalandEvening from "../assets/lotteries/nagaland-evening.png";
import karunyaPlus from "../assets/lotteries/karunya-plus.png";
import suvarnaKeralam from "../assets/lotteries/suvarna-keralam.png";
import karunya from "../assets/lotteries/karunya.png";
import samrudhi from "../assets/lotteries/samrudhi.png";
import bhagyathara from "../assets/lotteries/bhagyathara.png";
import winWin from "../assets/lotteries/win-win.png";
import keralaBumper from "../assets/lotteries/kerala-bumper.png";
import defaultLotteryImage from "../assets/lotteries/lottery.png";

const lotteryImages = {
  "KERALA STATE LOTTERY": keralaBumper,
  "KERALA BUMPER": keralaBumper,
  "NAGALAND MORNING": nagalandMorning,
  "STHREE SAKTHI": sthreeSakthi,
  "NAGALAND DAY": nagalandDay,
  "NAGALAND EVENING": nagalandEvening,
  "KARUNYA PLUS": karunyaPlus,
  "SUVARNA KERALAM": suvarnaKeralam,
  "KARUNYA": karunya,
  "SAMRUDHI": samrudhi,
  "BHAGYATHARA": bhagyathara,
  "WIN WIN": winWin,
  "WIN-WIN": winWin,
};

const formatShortDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

function LotteryCard({ lottery, onClick, actionLabel }) {
  const name = (lottery.lotteryName || lottery.name || "").toString();
  const imageKey = name.trim().toUpperCase().replace(/\s+/g, " ");
  const normalizedKey = imageKey.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const imageSrc = lotteryImages[normalizedKey] || lottery.image || defaultLotteryImage;
  const ticketPrice = lottery.ticketPrice ?? lottery.price;

  const details = [];
  if (lottery.drawDate) {
    details.push(formatShortDate(lottery.drawDate));
    if (lottery.time) details.push(lottery.time);
  } else if (lottery.date) {
    details.push(lottery.date);
    if (lottery.time) details.push(lottery.time);
  }

  return (
    <button type="button" className="lottery-image-card" onClick={onClick}>
      <div className="lottery-image-card-media">
        <img src={imageSrc} alt={name} className="lottery-card-image" />
        {lottery.ribbon ? (
          <span className={`lottery-card-ribbon ${lottery.ribbon.toLowerCase().replace(/\s+/g, "-")}`}>
            {lottery.ribbon}
          </span>
        ) : null}
      </div>

      <div className="lottery-image-card-body">
        <div className="lottery-card-title">{name}</div>
        {lottery.firstPrize || lottery.prize ? (
          <div className="lottery-card-prize">₹ {lottery.firstPrize?.toLocaleString() ?? lottery.prize}</div>
        ) : null}

        <div className="lottery-card-meta-row">
          {ticketPrice ? <span>Ticket ₹{ticketPrice}</span> : null}
          {details.length ? <span>{details.join(" • ")}</span> : null}
        </div>

        {actionLabel ? <div className="lottery-card-action">{actionLabel}</div> : null}
      </div>
    </button>
  );
}

export default LotteryCard;
