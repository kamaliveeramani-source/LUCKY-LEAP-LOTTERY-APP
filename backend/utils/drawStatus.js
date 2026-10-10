const STATUS = {
  UPCOMING: "UPCOMING",
  READY_FOR_RESULT: "READY_FOR_RESULT",
  COMPLETED: "COMPLETED",
};

// India does not observe DST, so a fixed +5:30 offset is safe for IST conversions.
const IST_OFFSET_MINUTES = 330;
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
  return zonedDateTimeToDate(
    `${year}-${month}-${day}`,
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    "Asia/Kolkata"
  );
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

function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    weekday: read("weekday"),
  };
}

function dateKeyAfterDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function zonedDateTimeToDate(dateKey, time, timeZone) {
  const dateMatch = String(dateKey).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(time).match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  const [, year, month, day] = dateMatch.map(Number);
  const [, hour, minute] = timeMatch.map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  const wallTime = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = wallTime;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = getZonedParts(new Date(timestamp), timeZone);
    const representedWallTime = Date.UTC(
      Number(local.year), Number(local.month) - 1, Number(local.day),
      Number(local.hour), Number(local.minute)
    );
    timestamp = wallTime - (representedWallTime - timestamp);
  }

  const result = new Date(timestamp);
  const verified = getZonedParts(result, timeZone);
  if (
    Number(verified.year) !== year || Number(verified.month) !== month ||
    Number(verified.day) !== day || Number(verified.hour) !== hour ||
    Number(verified.minute) !== minute
  ) return null;
  return result;
}

function timeFromDate(date, timeZone) {
  if (!date || Number.isNaN(new Date(date).getTime())) return "";
  const parts = getZonedParts(new Date(date), timeZone);
  return `${parts.hour}:${parts.minute}`;
}

function getNextDraw(lottery, currentDateTime = new Date(), timeZone = "Asia/Kolkata") {
  const now = currentDateTime instanceof Date ? currentDateTime : new Date(currentDateTime);
  if (!lottery || Number.isNaN(now.getTime())) return null;

  const frequency = String(lottery.drawFrequency || "SPECIFIC_DATE").toUpperCase();
  const storedDrawDate = lottery.drawDate ? new Date(lottery.drawDate) : null;

  if (["SPECIFIC_DATE", "SPECIFIC", "ONCE"].includes(frequency)) {
    return storedDrawDate && !Number.isNaN(storedDrawDate.getTime()) && storedDrawDate > now
      ? storedDrawDate
      : null;
  }

  const time = String(lottery.drawTime || timeFromDate(storedDrawDate, timeZone));
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;

  const today = getZonedParts(now, timeZone);
  const todayKey = `${today.year}-${today.month}-${today.day}`;
  const weekdayByName = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let dayOffset = 0;

  if (frequency === "WEEKLY") {
    if (lottery.drawDayOfWeek === null || lottery.drawDayOfWeek === undefined || lottery.drawDayOfWeek === "") return null;
    const scheduledDay = Number(lottery.drawDayOfWeek);
    const currentDay = weekdayByName[today.weekday];
    if (!Number.isInteger(scheduledDay) || scheduledDay < 0 || scheduledDay > 6 || currentDay === undefined) return null;
    dayOffset = (scheduledDay - currentDay + 7) % 7;
  } else if (frequency !== "DAILY") {
    return null;
  }

  let candidate = zonedDateTimeToDate(dateKeyAfterDays(todayKey, dayOffset), time, timeZone);
  if (candidate && candidate <= now) {
    const increment = frequency === "WEEKLY" ? 7 : 1;
    candidate = zonedDateTimeToDate(dateKeyAfterDays(todayKey, dayOffset + increment), time, timeZone);
  }
  return candidate;
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

function withComputedStatus(lottery, now = new Date()) {
  if (!lottery) return lottery;
  const plain = typeof lottery.toJSON === "function" ? lottery.toJSON() : { ...lottery };
  const nextDraw = getNextDraw(plain, now);
  return {
    ...plain,
    drawStatus: computeDrawStatus(plain, now),
    nextDrawDate: nextDraw ? nextDraw.toISOString() : null,
  };
}

function withComputedStatusList(lotteries, now = new Date()) {
  return (lotteries || []).map((lottery) => withComputedStatus(lottery, now));
}

module.exports = {
  STATUS,
  computeDrawStatus,
  getNextDraw,
  getZonedParts,
  parseISTDateTime,
  withComputedStatus,
  withComputedStatusList,
  startOfDayIST,
};
