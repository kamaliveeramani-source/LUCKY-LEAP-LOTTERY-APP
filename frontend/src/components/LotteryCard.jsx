
import { useEffect, useState } from "react";

import LotteryCardArtwork from "./LotteryCardArtwork";
import bhagyatharaArtwork from "../assets/lotteries/bhagyathara-teal.jpg";
import deerLotteryArtwork from "../assets/lotteries/deer-lottery-purple.jpg";
import karunyaArtwork from "../assets/lotteries/karunya-green.jpg";
import karunyaPlusArtwork from "../assets/lotteries/karunya-plus-orange.jpg";
import keralaLotteryArtwork from "../assets/lotteries/kerala-lottery-pink.jpg";
import nagalandDayArtwork from "../assets/lotteries/nagaland-day-pink.jpg";
import nagalandEveningArtwork from "../assets/lotteries/nagaland-evening-blue.jpg";
import nagalandMorningArtwork from "../assets/lotteries/nagaland-morning-transparent.png";
import sthreesakthiArtwork from "../assets/lotteries/sthree-sakthi.png";
import samrudhiArtwork from "../assets/lotteries/samrudhi-pink.jpg";
import suvarnaArtwork from "../assets/lotteries/suvarna-kerala-gold.jpg";
import winWinArtwork from "../assets/lotteries/win-win-blue.jpg";

const IST_TIME_ZONE = "Asia/Kolkata";

const LOCAL_ARTWORKS = new Map([
  ["bhagyathara", { source: bhagyatharaArtwork, presentation: "banner" }],
  ["deer lottery", { source: deerLotteryArtwork, presentation: "banner" }],
  ["karunya", { source: karunyaArtwork, presentation: "banner" }],
  ["karunya plus", { source: karunyaPlusArtwork, presentation: "banner" }],
  ["kerala lottery", { source: keralaLotteryArtwork, presentation: "banner" }],
  ["nagaland day", { source: nagalandDayArtwork, presentation: "banner" }],
  ["nagaland evening", { source: nagalandEveningArtwork, presentation: "banner" }],
  ["nagaland morning", { source: nagalandMorningArtwork, presentation: "logo" }],
  ["samrudhi", { source: samrudhiArtwork, presentation: "banner" }],
  ["suvarna kerala", { source: suvarnaArtwork, presentation: "banner" }],
  ["suvarna keralam", { source: suvarnaArtwork, presentation: "banner" }],
  ["win win", { source: winWinArtwork, presentation: "banner" }],
  ["sthree sakthi", { source: sthreesakthiArtwork, presentation: "logo" }],
]);

function normalizeLotteryName(lottery) {
  if (!lottery || typeof lottery !== "object") {
    return "";
  }

  const nameValue =
    lottery.lotteryName ||
    lottery.lottery_name ||
    lottery.name ||
    lottery.displayName ||
    lottery.title ||
    "";

  return String(nameValue).trim();
}

function getLocalArtwork(lottery) {
  const normalizedName = normalizeLotteryName(lottery)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return LOCAL_ARTWORKS.get(normalizedName) || null;
}

function resolveLotteryBackgroundArtwork(lottery) {
  const apiBackground = lottery?.backgroundImage;
  if (typeof apiBackground === "string" && apiBackground.trim()) {
    return apiBackground.trim();
  }
  return "";
}

function LotteryCardScene({ themeKey }) {
  return (
    <svg className="lottery-card-scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {themeKey === "kerala" && (
        <g>
          <circle cx="301" cy="70" r="34" fill="rgba(255,237,178,.34)" />
          <path d="M0 183q52-24 101-10t94 0 105-4 100 9v122H0Z" fill="rgba(92,26,75,.24)" />
          <path d="M0 208q55-17 101-2t94-1 104-3 101 5v93H0Z" fill="rgba(29,39,79,.23)" />
          <path d="M42 225q15-68 8-138m7 15Q31 71 8 84m49 18q20-30 52-28m-52 28q-11-31-31-41m31 41q22-21 46-19M347 225q-11-59-5-116m-4 21q-24-27-43-16m43 16q18-28 41-24m-41 24q-5-28-23-39" fill="none" stroke="rgba(255,248,224,.48)" strokeWidth="4" strokeLinecap="round" />
          <path d="M303 222v-55l16-14 16 14v55zm-8-55 24-30 24 30zm-4 56h47" fill="rgba(255,239,204,.3)" stroke="rgba(255,250,225,.38)" strokeWidth="2" />
          <path d="M0 242q48-12 93 1t91 0 93 2 123-3M0 265q42-8 81 1t87 0 88 1 144-2" fill="none" stroke="rgba(255,235,221,.34)" strokeWidth="3" />
        </g>
      )}
      {themeKey === "blue" && (
        <g>
          <circle cx="321" cy="63" r="29" fill="rgba(210,249,255,.35)" />
          <path d="M0 186q40-33 83-9t77 0 78-11 87 12 75-6v128H0Z" fill="rgba(8,54,124,.3)" />
          <path d="M0 208q50-17 98-2t96-1 100-3 106 2v96H0Z" fill="rgba(8,43,112,.38)" />
          <path d="M50 220q-9-52-2-112m3 18Q26 96 7 105m44 21q20-29 47-26m-47 26q-6-27-24-38m24 38q19-18 41-18M355 222q-10-48-4-94m-3 17q-21-24-39-15m39 15q15-24 37-22" fill="none" stroke="rgba(173,248,255,.58)" strokeWidth="4" strokeLinecap="round" />
          <path d="M241 191h79l-12 14h-56zM274 188v-42l27 42zM267 214q34 7 65 0" fill="rgba(220,250,255,.55)" stroke="rgba(225,251,255,.58)" strokeWidth="2" />
          <path d="M0 233q41-10 82 1t82 0 82 1 82 0 72-1M0 257q48-9 95 2t94 0 94 1 117-2M0 281q41-7 84 1t87 0 88 1 141-1" fill="none" stroke="rgba(187,247,255,.48)" strokeWidth="3" />
        </g>
      )}
      {(themeKey === "green" || themeKey === "teal") && (
        <g>
          <path d="M0 218q40-35 77-15t67 6 69-20 75 16 112-12v107H0Z" fill="rgba(12,67,76,.22)" />
          <path d="M41 278q12-118 92-202 12 120-92 202m10-16q47-115 142-153-39 131-142 153m182 18q-10-94 51-172 20 105-51 172m-3-8q-48-82-121-103 42 96 121 103" fill="rgba(198,255,223,.29)" stroke="rgba(219,255,234,.34)" strokeWidth="2" />
          <path d="M54 262q37-85 76-143m-61 157q62-91 128-151m92 150q-22-69-65-117m71 120q-54-61-116-81" fill="none" stroke="rgba(229,255,236,.42)" strokeWidth="2" />
          <path d="M0 238q54-20 107-2t107-3 93 5 93-4M0 265q46-12 91 0t94-2 102 3 113-4" fill="none" stroke="rgba(217,255,233,.24)" strokeWidth="3" />
          <circle cx="310" cy="65" r="25" fill="rgba(220,255,224,.24)" />
        </g>
      )}
      {themeKey === "orange" && (
        <g>
          <circle cx="302" cy="70" r="37" fill="rgba(255,244,163,.4)" />
          <path d="M0 196q47-38 91-8t83-3 87-23 73 29 66-6v115H0Z" fill="rgba(126,44,22,.28)" />
          <path d="M0 226q53-19 100-3t98-7 103 3 99-4v94H0Z" fill="rgba(106,35,17,.3)" />
          <path d="M52 238q11-62 8-119m5 22q-24-28-49-19m49 19q23-31 53-26m-53 26q-9-30-29-40m29 40q21-24 45-22M348 244q-13-51-7-94m-4 15q-20-25-40-17m40 17q17-22 38-19" fill="none" stroke="rgba(255,244,190,.48)" strokeWidth="4" strokeLinecap="round" />
          <path d="M0 257q47-14 92 0t91-1 94 0 123-2M0 278q56-12 108 0t104-1 98 0 90-1" fill="none" stroke="rgba(255,230,162,.32)" strokeWidth="3" />
          <path d="M265 219q20-24 43-11l18 3 12 13-15 8-14-8-10 12h-7l3-15-14 2-9 13h-7l2-16z" fill="rgba(255,219,159,.3)" />
        </g>
      )}
      {themeKey === "gold" && (
        <g fill="rgba(255,244,184,.34)" stroke="rgba(255,251,215,.45)" strokeWidth="2">
          <circle cx="312" cy="57" r="28" fill="rgba(255,249,194,.36)" stroke="none" />
          <path d="M75 237v-52l21-18 21 18v52zm8-52 13-30 13 30zm40 52v-76l31-25 31 25v76zm13-76 18-35 19 35zm56 76v-55l23-19 23 19v55zm8-55 15-29 15 29zm-137 4h169v8H63z" />
          <path d="M88 197v37m20-37v37m33-53v53m21-53v53m29-37v37m22-37v37" fill="none" stroke="rgba(108,70,9,.32)" strokeWidth="4" />
          <path d="M47 238h203v9H47zM56 254h184" fill="none" stroke="rgba(255,247,199,.38)" strokeWidth="3" />
        </g>
      )}
      {(themeKey === "pink" || themeKey === "akshaya") && (
        <g>
          <circle cx="318" cy="64" r="31" fill="rgba(255,231,241,.34)" />
          <path d="M0 220q42-31 82-12t74-2 73-25 80 24 91-3v98H0Z" fill="rgba(108,18,83,.22)" />
          <path d="M44 280q8-90 2-153m6 39q-23-29-43-20m43 20q21-30 45-27m-45 27q-5-28-23-39m258 126q12-75 4-132m0 26q-24-25-45-17m45 17q20-27 42-22" fill="none" stroke="rgba(255,235,246,.48)" strokeWidth="4" strokeLinecap="round" />
          <g fill="rgba(255,228,241,.42)" stroke="rgba(255,245,249,.3)" strokeWidth="1.5">
            <path d="M95 207q-19-17-9-30 12-7 18 8 9-16 20-8 8 12-9 30 19-8 24 4-4 14-26 12 17 12 9 22-12 6-19-12-6 19-17 13-8-10 7-23-21 7-24-5 4-13 26-11z" />
            <path d="M288 246q-17-15-8-27 10-6 16 7 7-14 17-7 7 11-8 27 17-7 21 3-4 12-23 10 15 11 8 20-10 5-16-10-5 16-15 10-7-8 6-20-18 6-21-4 3-11 23-9z" />
          </g>
          <path d="M0 260q44-12 86 1t89-1 92 1 133-2M0 280q51-11 100 1t99 0 94 1 107-2" fill="none" stroke="rgba(255,229,243,.32)" strokeWidth="3" />
        </g>
      )}
      {themeKey === "magenta" && (
        <g>
          <circle cx="314" cy="61" r="30" fill="rgba(255,226,244,.36)" />
          <path d="m0 211 57-62 35 32 61-94 50 75 42-53 54 57 41-47 60 65v116H0Z" fill="rgba(91,30,109,.3)" />
          <path d="m0 240 68-51 44 27 68-69 57 54 52-33 48 43 63-34v123H0Z" fill="rgba(72,28,91,.36)" />
          <path d="m121 165 32-49 29 47-20-12-14 8-12-11zM267 172l24-36 22 34-16-8-12 8-8-7z" fill="rgba(255,239,247,.4)" />
          <path d="M35 261v-38l14-27 15 27v38zm25 0v-28l12-21 12 21v28zm238 0v-42l15-29 16 29v42zm28 0v-31l13-22 13 22v31z" fill="rgba(31,52,81,.3)" />
        </g>
      )}
      {themeKey === "nightblue" && (
        <g>
          <circle cx="316" cy="63" r="27" fill="rgba(220,239,255,.5)" />
          <circle cx="306" cy="55" r="27" fill="rgba(20,41,101,.42)" />
          <g fill="rgba(255,255,255,.55)"><circle cx="63" cy="57" r="2"/><circle cx="111" cy="78" r="2"/><circle cx="183" cy="48" r="2"/><circle cx="249" cy="89" r="2"/><circle cx="356" cy="111" r="2"/><circle cx="30" cy="115" r="2"/></g>
          <path d="m0 205 58-64 39 39 60-91 54 82 50-67 58 66 36-43 45 39v134H0Z" fill="rgba(16,39,102,.48)" />
          <path d="m0 236 70-52 48 32 65-61 61 50 46-30 56 45 54-31v111H0Z" fill="rgba(8,27,75,.55)" />
          <path d="M31 266v-43l15-27 16 27v43zm29 0v-31l11-20 12 20v31zm257 0v-48l16-30 17 30v48zm32 0v-35l12-22 13 22v35z" fill="rgba(6,23,61,.65)" />
          <path d="M0 274q55-9 105 0t104 0 94 0 97-1" fill="none" stroke="rgba(130,209,255,.26)" strokeWidth="3" />
        </g>
      )}
      {themeKey === "purple" && (
        <g>
          <circle cx="310" cy="61" r="28" fill="rgba(241,226,255,.3)" />
          <path d="M0 221q39-35 78-13t75-7 77-15 75 18 95-9v105H0Z" fill="rgba(41,26,92,.38)" />
          <path d="M0 248q42-16 80 1t80-3 81 1 82-3 77 1v55H0Z" fill="rgba(22,20,67,.45)" />
          <path d="M34 264v-72l26-46 27 46v72zm56 0v-48l19-32 19 32v48zm220 0v-65l23-42 24 42v65zm48 0v-39l16-28 17 28v39z" fill="rgba(22,27,75,.55)" />
          <path d="M181 228q8-28 31-30l15 10 18-3 12 8-8 8-15-5-11 7-3 22h-7l-2-16-16 1-8 18h-7l3-21-8-4-7 11h-6l4-14zm43-24 2-13-8-9m9 9 8-11m-15 13-9-10" fill="rgba(245,228,255,.58)" stroke="rgba(255,245,255,.38)" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

function parseNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return Number.NaN;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  const stringValue = String(value).trim();

  if (!stringValue) {
    return Number.NaN;
  }

  const normalized = stringValue
    .replace(/[₹,\s]/g, "")
    .replace(/^[A-Za-z]+/g, "")
    .replace(/\([^)]*\)/g, "");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function resolveLotteryImage(lottery) {
  if (!lottery || typeof lottery !== "object") {
    return "";
  }

  const localArtwork = getLocalArtwork(lottery);
  if (localArtwork) {
    return localArtwork.source;
  }

  const candidates = [
    lottery.image,
    lottery.image_url,
    lottery.imageUrl,
    lottery.logo,
    lottery.logo_url,
    lottery.logoUrl,
    lottery.banner,
    lottery.banner_url,
    lottery.bannerUrl,
    lottery.icon,
    lottery.icon_url,
    lottery.iconUrl,
    lottery.thumbnail,
    lottery.thumbnail_url,
    lottery.thumbnailUrl,
    lottery.artwork,
    lottery.artwork_url,
    lottery.artworkUrl,
  ];

  const backendImage = candidates
    .find(
      (value) =>
        typeof value === "string" && value.trim()
    )
    ?.trim();

  if (backendImage) {
    return backendImage;
  }

  return "";
}

export function getLotteryImageByName(
  name,
  lottery = {}
) {
  const normalizedName =
    typeof name === "string" ? name.trim() : "";

  if (!normalizedName && !lottery) {
    return "";
  }

  const safeLottery =
    lottery && typeof lottery === "object"
      ? lottery
      : {};

  const lookupLottery =
    normalizedName && safeLottery
      ? {
          ...safeLottery,
          name: safeLottery.name || normalizedName,
          lotteryName:
            safeLottery.lotteryName ||
            safeLottery.lottery_name ||
            normalizedName,
        }
      : safeLottery;

  return resolveLotteryImage(lookupLottery);
}

function formatAmount(value) {
  const safeValue = parseNumericValue(value);

  if (!Number.isFinite(safeValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(safeValue);
}

function parseDrawDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed
        .split("-")
        .map(Number);

      if (
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day)
      ) {
        const date = new Date(
          Date.UTC(year, month - 1, day, 12)
        );

        return Number.isNaN(date.getTime())
          ? null
          : date;
      }
    }
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Gets the first prize amount from lottery data.
 *
 * Supported backend field names:
 * - firstPrize
 * - firstPrizeAmount
 * - first_prize
 * - first_prize_amount
 * - jackpot
 * - prize
 */
function getFirstPrizeAmount(lottery) {
  const possiblePrizes = [
    lottery?.firstPrize,
    lottery?.firstPrizeAmount,
    lottery?.first_prize,
    lottery?.first_prize_amount,
    lottery?.jackpot,
    lottery?.prize,
    lottery?.jackpotAmount,
    lottery?.firstPrizeValue,
  ];

  const validPrize = possiblePrizes.find((value) => {
    const numericValue = parseNumericValue(value);
    return Number.isFinite(numericValue);
  });

  return parseNumericValue(validPrize) || 0;
}

function getLotteryInitials(name) {
  const words = String(name || "LH")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "LH";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase();
}

function getLotteryShortCode(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length > 1 && words[words.length - 1].toLowerCase() === "plus") {
    return `${words[0][0]}PL`;
  }

  return words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join("").toUpperCase()
    : words[0]?.slice(0, 2).toUpperCase() || "";
}

function formatDisplayDate(value) {
  const date = parseDrawDate(value);
  if (!date) return "TBD";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(lottery) {
  const configuredTime = lottery?.drawTime ?? lottery?.draw_time ?? lottery?.time;
  if (typeof configuredTime === "string" && configuredTime.trim()) {
    const time = configuredTime.trim();
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return time;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return time;
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
  }

  const date = parseDrawDate(lottery?.drawDate);
  if (!date) return "TBD";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

const LOTTERY_THEME_MAP = {
  kerala: { accent: "#ff4d5c", start: "#ff5a75", end: "#ff3d7a", info: "rgba(255, 255, 255, 0.18)", badge: "rgba(255,255,255,0.22)" },
  blue: { accent: "#1d9bf0", start: "#2ec5ff", end: "#1b68ff", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  green: { accent: "#18a957", start: "#61d68c", end: "#0ea56d", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  orange: { accent: "#f59e0b", start: "#fbbf24", end: "#f97316", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  gold: { accent: "#d99200", start: "#f5c451", end: "#f39c12", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  pink: { accent: "#f06fb3", start: "#ff7db9", end: "#f43f9d", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  teal: { accent: "#1ab4a8", start: "#4bd6c0", end: "#0d8a9f", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  magenta: { accent: "#e35ea7", start: "#ff6ae8", end: "#d946ef", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  nightblue: { accent: "#3159d9", start: "#377ce8", end: "#101d72", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  akshaya: { accent: "#df2188", start: "#ff58bd", end: "#ad176d", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  purple: { accent: "#7c3aed", start: "#8b5cf6", end: "#6d28d9", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
  custom: { accent: "#7c3aed", start: "#8b5cf6", end: "#6d28d9", info: "rgba(255,255,255,0.18)", badge: "rgba(255,255,255,0.22)" },
};

const THEME_KEYWORDS = [
  ["win win", "blue"],
  ["winwin", "blue"],
  ["karunya plus", "orange"],
  ["karunya", "green"],
  ["suvarna", "gold"],
  ["samrudhi", "pink"],
  ["bhagyathara", "teal"],
  ["nagaland day", "magenta"],
  ["nagaland evening", "nightblue"],
  ["nagaland morning", "magenta"],
  ["deer", "purple"],
  ["akshaya", "akshaya"],
  ["sthreesakthi", "purple"],
  ["sthree sakthi", "purple"],
  ["kerala", "kerala"],
];

export function resolveLotteryTheme(lottery, fallbackIndex = 0) {
  const normalizedName = String(lottery?.lotteryName || lottery?.name || "").toLowerCase();
  const matchedTheme = THEME_KEYWORDS.find(([keyword]) => normalizedName.includes(keyword));
  if (matchedTheme) return matchedTheme[1];

  if (lottery?.cardTheme && LOTTERY_THEME_MAP[lottery.cardTheme]) {
    return lottery.cardTheme;
  }

  const variantSeed = Number.isFinite(Number(lottery?.id)) ? Number(lottery.id) : Number(fallbackIndex) || 0;
  const toneOrder = ["kerala", "blue", "green", "orange", "gold", "pink", "teal", "magenta", "purple"];
  return toneOrder[Math.abs(variantSeed) % toneOrder.length] || "custom";
}

function LotteryCard({
  lottery,
  onClick,
  variantIndex = 0,
  variant = "default",
  countdownText = "",
}) {
  const [imageFailed, setImageFailed] =
    useState(false);
  const localArtwork = getLocalArtwork(lottery);
  const hasBannerArtwork = localArtwork?.presentation === "banner";
  const imageSrc = resolveLotteryImage(lottery);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  if (
    !lottery ||
    typeof lottery !== "object"
  ) {
    return null;
  }

  const name = normalizeLotteryName(lottery) || "Lottery";

  const backgroundArtwork = variant === "catalog"
    ? ""
    : resolveLotteryBackgroundArtwork(lottery);

  const showImage =
    Boolean(imageSrc) && !imageFailed;
  const hasBackgroundArtwork = variant === "catalog" && hasBannerArtwork && showImage;

  const themeKey = resolveLotteryTheme(lottery, variantIndex);
  const theme = LOTTERY_THEME_MAP[themeKey] || LOTTERY_THEME_MAP.custom;

  const firstPrizeAmount =
    getFirstPrizeAmount(lottery);

  const displayedName = name;
  const shortCode = String(lottery.shortName || lottery.shortCode || lottery.code || "").trim() || getLotteryShortCode(name);
  const initialsName = lottery.shortName || name;
  const drawDateText = formatDisplayDate(lottery?.drawDate);
  const drawTimeText = formatDisplayTime(lottery);

  return (
    <article
      className={`lottery-card lottery-mobile-card lottery-card--${themeKey}${variant === "catalog" ? " lottery-card--premium-catalog" : variant === "next-draw" ? " lottery-mobile-card--next-draw" : ""}${hasBackgroundArtwork ? " lottery-card--with-background-artwork" : ""}`}
      style={{
        "--lottery-gradient-start": theme.start,
        "--lottery-gradient-end": theme.end,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onClick?.(event);
        }
      }}
    >
      {hasBackgroundArtwork && (
        <img
          className="lottery-card-background-artwork"
          src={imageSrc}
          style={{ objectFit: localArtwork?.fit || "cover" }}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      {variant === "catalog" ? (
        !hasBackgroundArtwork && <LotteryCardArtwork themeKey={themeKey} />
      ) : (
        !backgroundArtwork && !hasBackgroundArtwork && <LotteryCardScene themeKey={themeKey} />
      )}
      {backgroundArtwork && (
        <img
          className="lottery-mobile-card__background-art"
          src={backgroundArtwork}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
      {variant !== "catalog" && !hasBackgroundArtwork && (
        <div className="lottery-mobile-card__top-row">
          <div className="lottery-mobile-card__media" aria-label={`${name} artwork`}>
            {showImage ? (
              <img
                src={imageSrc}
                alt={`${name} artwork`}
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <span className="lottery-mobile-card__initials" aria-hidden="true">
                {getLotteryInitials(initialsName)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="lottery-mobile-card__content">
        <div className="lottery-mobile-card__title-wrap">
          <h3>{displayedName}</h3>
          {shortCode && <span className="lottery-mobile-card__code">({shortCode})</span>}
        </div>

        <div className="lottery-mobile-card__amount">
          ₹{formatAmount(firstPrizeAmount)}
          <span className="lottery-mobile-card__prize-label">First Prize</span>
        </div>

        <div className="lottery-mobile-card__draw lottery-mobile-card__next-draw">
          <div className="lottery-mobile-card__draw-row">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 1.5a.75.75 0 0 1 .75.75V3h5.5v-.75a.75.75 0 0 1 1.5 0V3h1A1.75 1.75 0 0 1 15 4.75v8.5A1.75 1.75 0 0 1 13.25 15h-10A1.75 1.75 0 0 1 1.5 13.25v-8.5A1.75 1.75 0 0 1 3.25 3h.5v-.75a.75.75 0 0 1 .75-.75ZM3 6v7.25c0 .14.11.25.25.25h10a.25.25 0 0 0 .25-.25V6H3Zm2 2h2v2H5V8Z" fill="currentColor" /></svg>
            <div className="lottery-mobile-card__draw-copy">
              <span>Next Draw</span>
              <strong>{drawDateText}</strong>
            </div>
          </div>
          <div className="lottery-mobile-card__time-row">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13Zm0 1.5a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm.75 2.25v3.05l2.4 1.42-.75 1.3L7.25 9.28V5.25h1.5Z" fill="currentColor" /></svg>
            <span>{drawTimeText}</span>
          </div>
          {countdownText && (
            <div className="lottery-mobile-card__extra-draw">
              <span>Time Remaining</span>
              <strong>{countdownText}</strong>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default LotteryCard;