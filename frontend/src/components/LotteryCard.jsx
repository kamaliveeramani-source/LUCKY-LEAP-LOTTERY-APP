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
import keralaEmblem from "../assets/lotteries/kerala-emblem.png";
import keralaBumper from "../assets/lotteries/kerala-bumper.png";
import defaultLotteryImage from "../assets/lotteries/lottery.png";

const lotteryImages = {
  "KERALA LOTTERY": keralaEmblem,
  "KERALA STATE LOTTERY": keralaEmblem,
  "KERALA BUMPER": keralaBumper,
  "NAGALAND MORNING": nagalandMorning,
  "STHREE SAKTHI": sthreeSakthi,
  "NAGALAND DAY": nagalandDay,
  "NAGALAND EVENING": nagalandEvening,
  "KARUNYA PLUS": karunyaPlus,
  "SUVARNA KERALAM": suvarnaKeralam,
  KARUNYA: karunya,
  SAMRUDHI: samrudhi,
  BHAGYATHARA: bhagyathara,
  "WIN WIN": winWin,
  "WIN-WIN": winWin,
};

function parseDrawDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(dateString) {
  if (!dateString) return "";
  const parsed = parseDrawDate(dateString);
  if (parsed) {
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  return String(dateString);
}

function formatTime(value) {
  if (!value) return "";
  const parsed = parseDrawDate(value);
  if (parsed) {
    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (/^\d{1,2}:\d{2}/.test(String(value))) {
    return String(value);
  }
  return "";
}

function resolveDrawLabels(lottery) {
  const parsedDrawDate = parseDrawDate(lottery.drawDate);

  if (parsedDrawDate) {
    return {
      dateLabel: formatShortDate(lottery.drawDate),
      timeLabel: formatTime(lottery.drawDate),
    };
  }

  if (lottery.date || lottery.time) {
    return {
      dateLabel: lottery.date ? String(lottery.date) : "",
      timeLabel: lottery.time ? String(lottery.time) : "",
    };
  }

  if (lottery.drawDate) {
    const label = formatShortDate(lottery.drawDate);
    return {
      dateLabel: label && label !== "Invalid Date" ? label : "Soon",
      timeLabel: "",
    };
  }

  return { dateLabel: "Soon", timeLabel: "" };
}

function getLotteryImage(name, lottery) {
  const imageKey = name.trim().toUpperCase().replace(/\s+/g, " ");
  const normalizedKey = imageKey.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return lotteryImages[normalizedKey] || lottery?.image || defaultLotteryImage;
}

export function getLotteryImageByName(name) {
  return getLotteryImage(name, {});
}

function LotteryCard({ lottery, onClick, actionLabel = "View Details", onActionClick }) {
  const name = (lottery.lotteryName || lottery.name || "Lottery").toString();
  const ticketPrice = lottery.ticketPrice ?? lottery.price;
  const prize = lottery.firstPrize ?? lottery.prize;
  const imageSrc = getLotteryImage(name, lottery);
  const { dateLabel, timeLabel } = resolveDrawLabels(lottery);

  const ribbon = lottery.ribbon;
  const ribbonClass = ribbon ? ribbon.toLowerCase().replace(/\s+/g, "-") : "";

  const handleCtaClick = (e) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(e);
    } else if (onClick) {
      onClick(e);
    }
  };

  const formattedPrize = prize
    ? typeof prize === "number"
      ? `₹ ${prize.toLocaleString()}`
      : prize.toString().startsWith("₹")
        ? prize
        : `₹ ${prize}`
    : null;

  return (
    <article
      className="lottery-card-premium"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(e)}
    >
      <div className="lottery-card-premium-media">
        <img src={imageSrc} alt={name} className="lottery-card-premium-image" loading="lazy" />
        {ribbon ? (
          <span className={`lottery-card-premium-ribbon ${ribbonClass}`}>{ribbon}</span>
        ) : null}
      </div>

      <div className="lottery-card-premium-header">
        <div className="lottery-card-premium-name">{name}</div>
        {formattedPrize ? (
          <div>
            <div className="lottery-card-premium-prize-label">First Prize</div>
            <div className="lottery-card-premium-prize">{formattedPrize}</div>
          </div>
        ) : null}
      </div>

      <div className="lottery-card-premium-body">
        <div className="lottery-card-premium-meta">
          {ticketPrice ? (
            <span className="lottery-meta-pill price">₹{ticketPrice}</span>
          ) : null}
          {dateLabel || timeLabel ? (
            <span className="lottery-meta-pill">
              {dateLabel}
              {dateLabel && timeLabel ? " · " : ""}
              {timeLabel}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="lottery-card-premium-cta"
          onClick={handleCtaClick}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default LotteryCard;
