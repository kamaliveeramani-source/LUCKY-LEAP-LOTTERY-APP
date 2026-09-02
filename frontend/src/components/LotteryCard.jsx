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
import defaultLotteryImage from "../assets/lotteries/lottery.png";

const lotteryImages = {
  "KERALA LOTTERY": keralaEmblem,
  "KERALA STATE LOTTERY": keralaEmblem,
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

const CARD_VARIANTS = ["purple", "orange", "blue"];

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDrawPill(timeLabel) {
  if (timeLabel) return `Draw ${timeLabel}`;
  return "Draw Soon";
}

function formatCardTime(timeLabel, dateLabel) {
  if (timeLabel) return timeLabel;
  if (dateLabel) return dateLabel;
  return "TBA";
}

function LotteryCard({
  lottery,
  onClick,
  actionLabel = "Play Now",
  onActionClick,
  variantIndex = 0,
  variant,
}) {
  const name = (lottery.lotteryName || lottery.name || "Lottery").toString();
  const imageSrc = getLotteryImage(name, lottery);
  const { dateLabel, timeLabel } = resolveDrawLabels(lottery);
  const cardVariant = variant || CARD_VARIANTS[variantIndex % CARD_VARIANTS.length];
  const drawPill = lottery.drawPill || formatDrawPill(timeLabel);
  const displayTime = formatCardTime(timeLabel, dateLabel);

  const handleCtaClick = (e) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(e);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <article
      className={`draw-card draw-card--${cardVariant}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(e)}
    >
      <div className="draw-card__badge">{drawPill}</div>

      <h3>{name}</h3>

      <div className="draw-card__time">
        <ClockIcon />
        <span>{displayTime}</span>
      </div>

      <div className="draw-card__watermark" aria-hidden="true">
        <img src={imageSrc} alt="" loading="lazy" />
      </div>

      <button type="button" className="draw-card__button" onClick={handleCtaClick}>
        <span>{actionLabel}</span>
        <ArrowRightIcon />
      </button>
    </article>
  );
}

export default LotteryCard;
