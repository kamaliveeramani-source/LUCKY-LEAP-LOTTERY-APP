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

function TicketIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6 4.75h8.3a1.7 1.7 0 0 1 1.7 1.7v1.2a1.7 1.7 0 0 0 0 3.4v1.2a1.7 1.7 0 0 1-1.7 1.7H6a1.7 1.7 0 0 1-1.7-1.7v-1.2a1.7 1.7 0 0 0 0-3.4V6.45A1.7 1.7 0 0 1 6 4.75Zm2 4.2h4.2M8 12.2h4.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5.5 4.5V3m9 1.5V3M4 7.5h12M5 9.5h10v6H5v-6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.2v4.1l2.8 1.7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const lotteryImages = {
  "KERALA STATE LOTTERY": keralaBumper,
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

function getLotteryTheme(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("kerala") || n.includes("suvarna") || n.includes("samrudhi") || n.includes("bhagyathara")) {
    return { theme: "kerala", cta: "kerala" };
  }
  if (n.includes("nagaland") || n.includes("sthree")) {
    return { theme: "nagaland", cta: "nagaland" };
  }
  if (n.includes("karunya")) {
    return { theme: "karunya", cta: "karunya" };
  }
  if (n.includes("win")) {
    return { theme: "win", cta: "win" };
  }
  if (n.includes("maharashtra")) {
    return { theme: "maharashtra", cta: "maharashtra" };
  }
  if (n.includes("tamil")) {
    return { theme: "tamil", cta: "tamil" };
  }
  if (n.includes("karnataka")) {
    return { theme: "karnataka", cta: "karnataka" };
  }
  return { theme: "default", cta: "default" };
}

function getLotteryImage(name, lottery) {
  const imageKey = name.trim().toUpperCase().replace(/\s+/g, " ");
  const normalizedKey = imageKey.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return lotteryImages[normalizedKey] || lottery.image || defaultLotteryImage;
}

function LotteryCard({ lottery, onClick, actionLabel = "View Details", onActionClick }) {
  const name = (lottery.lotteryName || lottery.name || "Lottery").toString();
  const ticketPrice = lottery.ticketPrice ?? lottery.price;
  const prize = lottery.firstPrize ?? lottery.prize;
  const { theme, cta } = getLotteryTheme(name);
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

      <div className={`lottery-card-premium-header lottery-theme-${theme}`}>
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
            <span className="lottery-meta-pill price"><TicketIcon /> ₹{ticketPrice}</span>
          ) : null}
          {dateLabel ? (
            <span className="lottery-meta-pill"><CalendarIcon /> {dateLabel}</span>
          ) : null}
          {timeLabel ? (
            <span className="lottery-meta-pill"><ClockIcon /> {timeLabel}</span>
          ) : null}
        </div>

        <button
          type="button"
          className={`lottery-card-premium-cta lottery-cta-${cta}`}
          onClick={handleCtaClick}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default LotteryCard;
