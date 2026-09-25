const STATUS = {
  UPCOMING: "UPCOMING",
  READY_FOR_RESULT: "READY_FOR_RESULT",
  COMPLETED: "COMPLETED",
};

// India does not observe DST, so a fixed +5:30 offset is safe for IST conversions.
const IST_OFFSET_MINUTES = 330;
const DEER_DRAW_TIMES = [
  { hour: 13, minute: 0, label: "01:00 PM" },
  { hour: 18, minute: 0, label: "06:00 PM" },
  { hour: 18, minute: 30, label: "06:30 PM" },
];

// Returns the UTC instant corresponding to midnight IST of the given moment's IST calendar day.
function startOfDayIST(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60000);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MINUTES * 60000);
}

function parseISTDateTime(dateValue, timeValue = "00:00") {
  const dateMatch = String(dateValue || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  const timeMatch = String(timeValue || "00:00").match(/^(\d{1,2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;
  const [, year, month, day] = dateMatch;
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (hours > 23 || minutes > 59) return null;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), hours, minutes) - IST_OFFSET_MINUTES * 60000);
}

function getISTDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value || "";
  return { year: read("year"), month: read("month"), day: read("day") };
}

function getDeerDrawSchedule(now = new Date()) {
  const { year, month, day } = getISTDateParts(now);
  const dateKey = `${year}-${month}-${day}`;

  return DEER_DRAW_TIMES.map(({ hour, minute, label }) => {
    let drawDate = parseISTDateTime(dateKey, `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    if (drawDate <= now) {
      const tomorrow = new Date(drawDate.getTime() + 24 * 60 * 60 * 1000);
      const nextParts = getISTDateParts(tomorrow);
      drawDate = parseISTDateTime(
        `${nextParts.year}-${nextParts.month}-${nextParts.day}`,
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }

    return {
      time: label,
      drawDate: drawDate.toISOString(),
      drawStatus: STATUS.UPCOMING,
    };
  });
}

// Single source of truth for draw status: never trust a stored value alone.
function computeDrawStatus(lottery, now = new Date()) {
  const drawTime = new Date(lottery?.drawDate).getTime();
  if (!Number.isFinite(drawTime)) return lottery?.drawStatus || STATUS.UPCOMING;
  if (now.getTime() < drawTime) return STATUS.UPCOMING;
  if (lottery?.winnerTicketId !== null && lottery?.winnerTicketId !== undefined) return STATUS.COMPLETED;
  if (lottery?.drawStatus === "COMPLETED" && lottery?.declaredAt) return STATUS.COMPLETED;
  return STATUS.READY_FOR_RESULT;
}

function withComputedStatus(lottery) {
  if (!lottery) return lottery;
  const plain = typeof lottery.toJSON === "function" ? lottery.toJSON() : { ...lottery };
  const result = { ...plain, drawStatus: computeDrawStatus(plain) };
  if (/^deer\s+lottery$/i.test(String(plain.lotteryName || "").trim())) {
    result.drawSchedule = getDeerDrawSchedule();
  }
  return result;
}

function withComputedStatusList(lotteries) {
  return (lotteries || []).map(withComputedStatus);
}

module.exports = {
  STATUS,
  computeDrawStatus,
  getDeerDrawSchedule,
  parseISTDateTime,
  withComputedStatus,
  withComputedStatusList,
  startOfDayIST,
};
