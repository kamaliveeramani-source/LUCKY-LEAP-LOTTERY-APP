import nagalandMorning from "../assets/lotteries/nagaland-morning-transparent.png";
import sthreeSakthi from "../assets/lotteries/sthree-sakthi-transparent.png";
import nagalandDay from "../assets/lotteries/nagaland-day-transparent.png";
import nagalandEvening from "../assets/lotteries/nagaland-evening-transparent.png";
import karunyaPlus from "../assets/lotteries/karunya-plus-transparent.png";
import suvarnaKeralam from "../assets/lotteries/suvarna-keralam-transparent.png";
import karunya from "../assets/lotteries/karunya-transparent.png";
import samrudhi from "../assets/lotteries/samrudhi-transparent.png";
import bhagyathara from "../assets/lotteries/bhagyathara-transparent.png";
import winWin from "../assets/lotteries/win-win-transparent.png";
import keralaEmblem from "../assets/lotteries/kerala-emblem-transparent.png";
import defaultLotteryImage from "../assets/lotteries/lottery.png";

const lotteryImages = {
  "KERALA LOTTERY": keralaEmblem,
  "KERALA STATE LOTTERY": keralaEmblem,
  "AKSHAYA": winWin,
  "AKSHAYA LOTTERY": winWin,
  "NAGALAND MORNING": nagalandMorning,
  "STHREE SAKTHI": sthreeSakthi,
  "NAGALAND DAY": nagalandDay,
  "NAGALAND EVENING": nagalandEvening,
  "KARUNYA PLUS": karunyaPlus,
  "SUVARNA KERALAM": suvarnaKeralam,
  "SUVARNA KERALA": suvarnaKeralam,
  KARUNYA: karunya,
  SAMRUDHI: samrudhi,
  BHAGYATHARA: bhagyathara,
  "WIN WIN": winWin,
  "WIN-WIN": winWin,
  "KERALA EMBLEM": keralaEmblem,
};

const CARD_VARIANTS = ["purple", "orange", "blue"];

function formatPrize(value) {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeValue);
}

function formatOrdinal(day) {
  const remainder = day % 10;
  const teen = day % 100;
  if (teen >= 11 && teen <= 13) return "th";
  if (remainder === 1) return "st";
  if (remainder === 2) return "nd";
  if (remainder === 3) return "rd";
  return "th";
}

function formatDrawLabel(drawDate) {
  if (!drawDate) return "TBD";

  const parsed = new Date(drawDate);
  if (Number.isNaN(parsed.getTime())) return String(drawDate);

  const month = parsed.toLocaleDateString("en-US", { month: "short" });
  const day = parsed.getDate();
  const time = parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${month} ${day}${formatOrdinal(day)} ${time}`;
}

function getCardTone(name = "") {
  const normalized = String(name).trim().toLowerCase();
  if (normalized.includes("quick state 1.5") || normalized.includes("win win")) return "cyan";
  if (normalized.includes("quick state 3") || normalized.includes("akshaya")) return "purple";
  if (normalized.includes("quick state 5") || normalized.includes("karunya plus")) return "orange";
  if (normalized.includes("nagaland morning")) return "amber";
  if (normalized.includes("nagaland day")) return "sunset";
  if (normalized.includes("nagaland evening")) return "red";
  if (normalized.includes("shree") || normalized.includes("sakthi")) return "brown";
  if (normalized.includes("dhanalekshmi") || normalized.includes("dhanalaxmi")) return "green";
  if (normalized.includes("suvarna") || normalized.includes("keralam")) return "blue";
  if (normalized.includes("karunya")) return "magenta";
  if (normalized.includes("samrudhi")) return "teal";
  if (normalized.includes("kerala")) return "cyan";
  return "blue";
}

function getLotteryStatus(lottery) {
  const status = String(lottery?.drawStatus || lottery?.status || "").trim().toUpperCase();
  return ["LIVE", "OPEN", "RUNNING", "ACTIVE"].includes(status) ? "Live" : "Upcoming";
}

function parseDrawDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value) {
  if (!value) return "";
  const parsed = parseDrawDate(value);
  if (parsed) {
    return parsed.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (/^\d{1,2}:\d{2}/.test(String(value))) {
    return String(value);
  }
  return "";
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
      dateLabel: label && label !== "Invalid Date" ? label : "",
      timeLabel: "",
    };
  }

  return { dateLabel: "", timeLabel: "" };
}

function getLotteryImage(name, lottery) {
  const imageKey = name.trim().toUpperCase().replace(/\s+/g, " ");
  const normalizedKey = imageKey.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return lotteryImages[normalizedKey] || lottery?.image || defaultLotteryImage;
}

export function getLotteryImageByName(name) {
  return getLotteryImage(name, {});
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v5l3 1.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5v4M16 3.5v4M4 9.5h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function LotteryCard({
  lottery,
  onClick,
  variantIndex = 0,
  variant,
}) {
  const name = (lottery.lotteryName || lottery.name || "Lottery").toString();
  const imageSrc = getLotteryImage(name, lottery);
  const cardVariant = variant || CARD_VARIANTS[variantIndex % CARD_VARIANTS.length];
  const drawDate = lottery.drawDate || lottery.date || null;
  const status = getLotteryStatus(lottery);
  const prize = lottery.firstPrize ?? lottery.firstPrizeAmount ?? lottery.prize ?? 0;

  return (
    <article
      className={`lottery-card lottery-mobile-card lottery-card--${getCardTone(name)} lottery-card--${cardVariant}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event);
        }
      }}
    >
      <div className={`lottery-mobile-card__status lottery-mobile-card__status--${status.toLowerCase()}`}>
        <span className="lottery-mobile-card__status-dot" aria-hidden="true" />
        {status}
      </div>
      <span className="lottery-mobile-card__arrow" aria-hidden="true">›</span>

      <div className="lottery-mobile-card__media">
        <img src={imageSrc} alt={name} loading="lazy" />
      </div>

      <div className="lottery-mobile-card__content">
        <h3>{name}</h3>
        <div className="lottery-mobile-card__amount">₹{formatPrize(prize)}</div>
        <div className="lottery-mobile-card__label">JACKPOT</div>

        <div className="lottery-mobile-card__meta">
          <CalendarIcon />
          <div>
            <span>Next Draw</span>
            <strong>{formatDrawLabel(drawDate)}</strong>
          </div>
          <ClockIcon />
        </div>
      </div>
    </article>
  );
}

export default LotteryCard;
