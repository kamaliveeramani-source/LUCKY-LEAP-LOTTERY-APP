import { useState } from "react";
import bhagyatharaArtwork from "../assets/lotteries/bhagyathara.png";
import karunyaArtwork from "../assets/lotteries/karunya.png";
import karunyaPlusArtwork from "../assets/lotteries/karunya-plus.png";
import keralaArtwork from "../assets/lotteries/kerala-emblem.png";
import nagalandDayArtwork from "../assets/lotteries/nagaland-day.png";
import nagalandEveningArtwork from "../assets/lotteries/nagaland-evening.png";
import nagalandMorningArtwork from "../assets/lotteries/nagaland-morning.png";
import samrudhiArtwork from "../assets/lotteries/samrudhi.png";
import sthreesakthiArtwork from "../assets/lotteries/sthree-sakthi.png";
import suvarnaArtwork from "../assets/lotteries/suvarna-keralam.png";
import winWinArtwork from "../assets/lotteries/win-win.png";

const IST_TIME_ZONE = "Asia/Kolkata";
const THEME_TONES = ["blue", "violet", "orange", "amber", "green", "magenta", "cyan", "rose", "teal", "purple"];
const LOCAL_ARTWORKS = [
  { keywords: ["karunya plus"], source: karunyaPlusArtwork },
  { keywords: ["suvarna"], source: suvarnaArtwork },
  { keywords: ["samrudhi"], source: samrudhiArtwork },
  { keywords: ["bhagyathara"], source: bhagyatharaArtwork },
  { keywords: ["sthree", "sakthi"], source: sthreesakthiArtwork },
  { keywords: ["nagaland day"], source: nagalandDayArtwork },
  { keywords: ["nagaland evening"], source: nagalandEveningArtwork },
  { keywords: ["nagaland morning"], source: nagalandMorningArtwork },
  { keywords: ["win win"], source: winWinArtwork },
  { keywords: ["karunya"], source: karunyaArtwork },
  { keywords: ["kerala"], source: keralaArtwork },
];

export function resolveLotteryImage(lottery) {
  if (!lottery || typeof lottery !== "object") return "";

  const candidates = [
    lottery.image,
    lottery.logo,
    lottery.banner,
    lottery.icon,
    lottery.thumbnail,
    lottery.imageUrl,
    lottery.logoUrl,
  ];

  const backendImage = candidates.find((value) => typeof value === "string" && value.trim())?.trim();
  if (backendImage) return backendImage;

  const name = String(lottery.lotteryName || lottery.name || "").trim().toLowerCase();
  return LOCAL_ARTWORKS.find(({ keywords }) => keywords.every((keyword) => name.includes(keyword)))?.source || "";
}

export function getLotteryImageByName(_name, lottery = {}) {
  return resolveLotteryImage(lottery);
}

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

function parseDrawDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatNextDraw(lottery) {
  const parsedDrawDate = parseDrawDate(lottery?.drawDate);

  if (parsedDrawDate) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIME_ZONE,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(parsedDrawDate);

    const read = (type) => parts.find((part) => part.type === type)?.value || "";
    const day = Number(read("day"));
    const month = read("month");
    const hour = read("hour").padStart(2, "0");
    const minute = read("minute").padStart(2, "0");

    if (!month || !Number.isFinite(day)) {
      return parsedDrawDate.toLocaleString("en-IN", { timeZone: IST_TIME_ZONE });
    }

    return `${month} ${day}${formatOrdinal(day)} ${hour}:${minute}`;
  }

  const dateLabel = lottery?.date ? String(lottery.date) : "";
  const timeLabel = lottery?.time ? String(lottery.time) : "";
  return [dateLabel, timeLabel].filter(Boolean).join(" ") || "TBD";
}

function getLotteryInitials(name) {
  const words = String(name || "LH")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "LH";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function resolveTheme(lottery, variantIndex = 0) {
  const explicit = lottery?.themeColor || lottery?.cardColor || lottery?.color || lottery?.backgroundColor;
  if (typeof explicit === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(explicit.trim())) {
    const color = explicit.trim();
    return {
      tone: "custom",
      style: { background: `linear-gradient(165deg, ${color} 0%, color-mix(in srgb, ${color} 78%, #111827) 100%)` },
    };
  }

  const numericId = Number(lottery?.id);
  const seed = Number.isFinite(numericId) ? numericId : Number(variantIndex) || 0;
  return {
    tone: THEME_TONES[Math.abs(seed) % THEME_TONES.length],
    style: undefined,
  };
}

function LotteryCard({ lottery, onClick, variantIndex = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!lottery || typeof lottery !== "object") return null;

  const name = String(lottery?.lotteryName || lottery?.name || "Lottery");
  const imageSrc = resolveLotteryImage(lottery);
  const showImage = Boolean(imageSrc) && !imageFailed;
  const theme = resolveTheme(lottery, variantIndex);
  const prize = lottery?.firstPrize ?? lottery?.firstPrizeAmount ?? lottery?.jackpot ?? lottery?.prize ?? 0;
  const nextDrawLabel = formatNextDraw(lottery);

  return (
    <article
      className={`lottery-card lottery-mobile-card lottery-card--${theme.tone}`}
      style={theme.style}
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
      <div className="lottery-mobile-card__media">
        {showImage ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="lottery-mobile-card__initials" aria-hidden="true">
            {getLotteryInitials(name)}
          </span>
        )}
      </div>

      <div className="lottery-mobile-card__content">
        <h3>{name}</h3>
        <div className="lottery-mobile-card__amount">₹{formatPrize(prize)}</div>
        <div className="lottery-mobile-card__draw">
          <span>Next Draw</span>
          <strong>{nextDrawLabel}</strong>
        </div>
      </div>
    </article>
  );
}

export default LotteryCard;
