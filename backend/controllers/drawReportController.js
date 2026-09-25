const ExcelJS = require("exceljs");
const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const WinningResult = require("../models/WinningResult");
const { withComputedStatus } = require("../utils/drawStatus");

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sanitizeFilenamePart(value) {
  return String(value || "").replace(/[^a-zA-Z0-9]+/g, "") || "Lottery";
}

async function loadDrawReportRows(lotteryId, { winnersOnly }) {
  const lottery = await Lottery.findByPk(lotteryId);
  if (!lottery) throw httpError(404, "Lottery not found");

  const [tickets, winningResults] = await Promise.all([
    Ticket.findAll({
      where: { LotteryId: lotteryId, ...(winnersOnly ? { status: "WON" } : {}) },
      include: [{ model: User, attributes: ["id", "fullName", "mobile", "email"] }],
      order: [["createdAt", "ASC"]],
    }),
    WinningResult.findAll({ where: { LotteryId: lotteryId } }),
  ]);

  const winningByBetType = new Map(winningResults.map((item) => [item.betType, item]));

  const rows = tickets.map((ticket) => {
    const matchedResult = winningByBetType.get(ticket.betType);
    return {
      customerId: ticket.User?.id || null,
      customerName: ticket.User?.fullName || "Unknown",
      mobile: ticket.User?.mobile || "",
      email: ticket.User?.email || "",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      betType: ticket.betType,
      purchasedNumber: ticket.selectedNumber,
      quantity: 1,
      ticketAmount: Number(ticket.amount || 0),
      totalAmount: Number(ticket.amount || 0),
      purchaseDate: ticket.createdAt,
      paymentId: `TCKT-${ticket.id}`,
      paymentMethod: "WALLET",
      paymentStatus: "PAID",
      winningNumber: matchedResult?.winningNumber || "",
      winStatus: ticket.status,
      winningAmount: Number(ticket.winningAmount || 0),
    };
  });

  return { lottery, rows };
}

// Only authenticated admins can reach these handlers (requireAdmin is applied on the admin router).
exports.getDrawReport = async (req, res) => {
  try {
    const type = String(req.query.type || "winners").toLowerCase();
    const { lottery, rows } = await loadDrawReportRows(Number(req.params.id), { winnersOnly: type === "winners" });
    const totalPrizeAmount = rows.filter((row) => row.winStatus === "WON").reduce((sum, row) => sum + row.winningAmount, 0);
    return res.json({
      success: true,
      data: {
        lottery: withComputedStatus(lottery),
        rows,
        summary: {
          count: rows.length,
          winners: rows.filter((row) => row.winStatus === "WON").length,
          totalPrizeAmount,
        },
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.exportDrawReport = async (req, res) => {
  try {
    const type = String(req.query.type || "winners").toLowerCase();
    const { lottery, rows } = await loadDrawReportRows(Number(req.params.id), { winnersOnly: type === "winners" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type === "winners" ? "Winners" : "All Tickets");
    sheet.columns = [
      { header: "Lottery Name", key: "lotteryName", width: 22 },
      { header: "Draw Date", key: "drawDate", width: 14 },
      { header: "Draw Time", key: "drawTime", width: 12 },
      { header: "Customer Name", key: "customerName", width: 22 },
      { header: "Mobile Number", key: "mobile", width: 16 },
      { header: "Email", key: "email", width: 24 },
      { header: "Ticket Number", key: "ticketNumber", width: 20 },
      { header: "Purchased Number", key: "purchasedNumber", width: 16 },
      { header: "Bet Type", key: "betType", width: 12 },
      { header: "Number of Tickets", key: "quantity", width: 14 },
      { header: "Ticket Amount", key: "ticketAmount", width: 15, style: { numFmt: '"₹"#,##0.00' } },
      { header: "Winning Number", key: "winningNumber", width: 14 },
      { header: "Winning Amount", key: "winningAmount", width: 16, style: { numFmt: '"₹"#,##0.00' } },
      { header: "Payment ID", key: "paymentId", width: 16 },
      { header: "Payment Method", key: "paymentMethod", width: 14 },
      { header: "Payment Status", key: "paymentStatus", width: 14 },
      { header: "Purchase Date/Time", key: "purchaseDate", width: 20 },
      { header: "Result Status", key: "winStatus", width: 14 },
    ];
    sheet.getRow(1).font = { bold: true, color: { argb: "FF6D28D9" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE9FE" } };

    const drawDate = lottery.drawDate ? new Date(lottery.drawDate) : null;
    const drawDateText = drawDate ? drawDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
    const drawTimeText = drawDate ? drawDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-";

    for (const row of rows) {
      sheet.addRow({
        ...row,
        lotteryName: lottery.lotteryName,
        drawDate: drawDateText,
        drawTime: drawTimeText,
        purchaseDate: row.purchaseDate ? new Date(row.purchaseDate).toLocaleString("en-IN") : "-",
      });
    }

    const fileDateStamp = drawDate ? drawDate.toISOString().slice(0, 10) : "unknown";
    const filename = `LuckyHorse_${sanitizeFilenamePart(lottery.lotteryName)}_${fileDateStamp}_${type === "winners" ? "Winners" : "AllTickets"}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.getResultHistory = async (req, res) => {
  try {
    const lotteries = await Lottery.findAll({
      where: { drawStatus: "COMPLETED" },
      order: [["declaredAt", "DESC"]],
      include: [{ model: WinningResult, as: "winningResults" }],
    });

    const declaredByIds = [...new Set(lotteries.map((item) => item.declaredByUserId).filter(Boolean))];
    const admins = declaredByIds.length ? await User.findAll({ where: { id: declaredByIds }, attributes: ["id", "fullName"] }) : [];
    const adminNameById = new Map(admins.map((admin) => [admin.id, admin.fullName]));

    const data = await Promise.all(lotteries.map(async (lottery) => {
      const [numberOfWinners, totalPrizeAmount] = await Promise.all([
        Ticket.count({ where: { LotteryId: lottery.id, status: "WON" } }),
        Ticket.sum("winningAmount", { where: { LotteryId: lottery.id, status: "WON" } }),
      ]);
      return {
        id: lottery.id,
        lotteryName: lottery.lotteryName,
        drawDate: lottery.drawDate,
        winningResults: lottery.winningResults,
        numberOfWinners,
        totalPrizeAmount: Number(totalPrizeAmount || 0),
        declaredAt: lottery.declaredAt,
        declaredBy: adminNameById.get(lottery.declaredByUserId) || null,
      };
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
