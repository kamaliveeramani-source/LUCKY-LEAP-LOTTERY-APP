const { Op } = require("sequelize");

const User = require("../models/User");
const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");
const Wallet = require("../models/Wallet");
const WinningResult = require("../models/WinningResult");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");

const { drawWinner } = require("./lotteryController");
const { safeRecordActivity } = require("../services/operationalEvents");
const ActivityLog = require("../models/ActivityLog");
const { withComputedStatus, withComputedStatusList, getNextDraw, getZonedParts, parseISTDateTime } = require("../utils/drawStatus");

// User columns that actually exist in your application.
// IMPORTANT: username has been removed.
const publicUserAttributes = [
  "id",
  "fullName",
  "age",
  "gender",
  "mobile",
  "email",
  "wallet",
  "role",
  "createdAt",
  "updatedAt",
];

function dateRange(date) {
  if (!date) return null;

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);

  end.setDate(end.getDate() + 1);

  return {
    [Op.gte]: start,
    [Op.lt]: end,
  };
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
}

function nonNegativeInteger(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function booleanValue(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function timeFromLotteryDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "";
  const parts = getZonedParts(new Date(value), "Asia/Kolkata");
  return `${parts.hour}:${parts.minute}`;
}

function lotteryPayload(body, partial = false, existingLottery = null) {
  const fields = {};

  const mappings = {
    lotteryName: "lotteryName",
    name: "lotteryName",
    ticketPrice: "ticketPrice",
    firstPrize: "firstPrize",
    secondPrize: "secondPrize",
    thirdPrize: "thirdPrize",
    totalTickets: "totalTickets",
    drawDate: "drawDate",
    drawTime: "drawTime",
    drawFrequency: "drawFrequency",
    drawDayOfWeek: "drawDayOfWeek",
    isActive: "isActive",
    shortName: "shortName",
    logo: "logo",
    cardTheme: "cardTheme",
    primaryColor: "primaryColor",
    secondaryColor: "secondaryColor",
    backgroundImage: "backgroundImage",
    displayOrder: "displayOrder",
    featured: "featured",
  };

  for (const [input, field] of Object.entries(mappings)) {
    if (body[input] !== undefined) {
      fields[field] = body[input];
    }
  }

  if (fields.isActive !== undefined) fields.isActive = booleanValue(fields.isActive);
  if (fields.featured !== undefined) fields.featured = booleanValue(fields.featured);
  if (fields.displayOrder !== undefined) {
    const displayOrder = nonNegativeInteger(fields.displayOrder);
    if (displayOrder === null) return { error: "displayOrder must be a non-negative integer" };
    fields.displayOrder = displayOrder;
  }

  const scheduleWasSent = ["drawDate", "drawTime", "drawFrequency", "drawDayOfWeek"]
    .some((field) => body[field] !== undefined);
  if (!partial || scheduleWasSent) {
    const frequency = String(
      fields.drawFrequency ?? existingLottery?.drawFrequency ?? "SPECIFIC_DATE"
    ).trim().toUpperCase();
    if (!["DAILY", "WEEKLY", "SPECIFIC_DATE"].includes(frequency)) {
      return { error: "Draw frequency must be Daily, Weekly, or Specific Date" };
    }

    const drawTime = String(
      fields.drawTime ?? existingLottery?.drawTime ?? timeFromLotteryDate(fields.drawDate ?? existingLottery?.drawDate)
    ).trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(drawTime)) {
      return { error: "Select a valid draw time" };
    }

    let drawDayOfWeek = fields.drawDayOfWeek ?? existingLottery?.drawDayOfWeek;
    if (frequency === "WEEKLY") {
      if (drawDayOfWeek === null || drawDayOfWeek === undefined || String(drawDayOfWeek).trim() === "") {
        return { error: "Select a day of the week for weekly draws" };
      }
      drawDayOfWeek = Number(drawDayOfWeek);
      if (!Number.isInteger(drawDayOfWeek) || drawDayOfWeek < 0 || drawDayOfWeek > 6) {
        return { error: "Select a day of the week for weekly draws" };
      }
    } else {
      drawDayOfWeek = null;
    }

    fields.drawFrequency = frequency;
    fields.drawTime = drawTime;
    fields.drawDayOfWeek = drawDayOfWeek;

    if (frequency === "SPECIFIC_DATE") {
      const rawDate = fields.drawDate ?? existingLottery?.drawDate;
      let scheduledDate = null;
      if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(rawDate) && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(rawDate)) {
        scheduledDate = parseISTDateTime(rawDate.slice(0, 10), drawTime);
      } else if (rawDate) {
        scheduledDate = new Date(rawDate);
      }
      if (!scheduledDate || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        return { error: "Draw date must be today or a future date." };
      }
      fields.drawDate = scheduledDate;
    } else {
      const nextDraw = getNextDraw({
        ...(existingLottery?.toJSON?.() || existingLottery || {}),
        ...fields,
      });
      if (!nextDraw) return { error: "Unable to calculate the next scheduled draw" };
      fields.drawDate = nextDraw;
    }
  }

  const validThemes = new Set(["purple", "blue", "green", "rose", "coral", "cyan", "teal", "orange", "magenta", "violet", "amber"]);
  if (fields.cardTheme !== undefined) {
    fields.cardTheme = String(fields.cardTheme || "").trim().toLowerCase();
    if (fields.cardTheme && !validThemes.has(fields.cardTheme)) {
      return { error: "cardTheme is not supported" };
    }
  }

  for (const colorField of ["primaryColor", "secondaryColor"]) {
    if (fields[colorField] !== undefined) {
      fields[colorField] = String(fields[colorField] || "").trim();
      if (fields[colorField] && !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(fields[colorField])) {
        return { error: `${colorField} must be a valid hex color` };
      }
    }
  }

  if (
    !partial &&
    (
      !fields.lotteryName ||
      !fields.ticketPrice ||
      !fields.firstPrize
    )
  ) {
    return {
      error:
        "lotteryName, ticketPrice and firstPrize are required",
    };
  }

  return { fields };
}

// =====================================================
// DASHBOARD
// =====================================================

exports.getDashboard = async (req, res) => {
  try {
    const today = dateRange(
      new Date().toISOString().slice(0, 10)
    );

    const [
      totalUsers,
      totalLotteries,
      activeLotteries,
      todayBets,
      winners,
      wallets,
      todayActivity,
      recentActivity,
      nextDrawCandidates,
    ] = await Promise.all([
      User.count(),

      Lottery.count(),

      Lottery.count({
        where: {
          isActive: true,
        },
      }),

      Ticket.findAll({
        where: {
          createdAt: today,
        },
        attributes: ["amount"],
      }),

      Ticket.findAll({
        where: {
          status: "WON",
        },
        attributes: ["winningAmount"],
      }),

      Wallet.findAll({
        attributes: [
          "totalDeposit",
          "totalWithdraw",
        ],
      }),

      ActivityLog.findAll({
        where: {
          createdAt: today,
        },
        order: [
          ["createdAt", "DESC"],
        ],
        limit: 100,
      }),

      ActivityLog.findAll({
        order: [
          ["createdAt", "DESC"],
        ],
        limit: 12,
      }),

      Lottery.findAll({
        where: {
          isActive: true,
        },
        order: [["displayOrder", "ASC"], ["id", "ASC"]],
      }),
    ]);

    const nextDrawLottery = withComputedStatusList(nextDrawCandidates)
      .filter((item) => item.nextDrawDate)
      .sort((left, right) => new Date(left.nextDrawDate) - new Date(right.nextDrawDate))[0] || null;

    const sum = (rows, field) =>
      rows.reduce(
        (total, row) =>
          total + (Number(row[field]) || 0),
        0
      );

    return res.json({
      success: true,

      data: {
        totalUsers,

        totalLotteries,

        activeLotteries,

        recentActivity,

        nextDraw: nextDrawLottery
          ? { ...nextDrawLottery, drawDate: nextDrawLottery.nextDrawDate, drawStatus: "UPCOMING" }
          : null,

        dailyActivity: {
          newUsers: todayActivity.filter(
            (item) => item.action === "USER_REGISTERED"
          ).length,

          tickets: todayActivity.filter(
            (item) => item.action === "TICKET_PURCHASED"
          ).length,

          winners: todayActivity.filter(
            (item) => item.action === "WINNER_SELECTED"
          ).length,

          events: todayActivity.length,
        },

        todaysBets: todayBets.length,

        todaysBettingAmount: sum(
          todayBets,
          "amount"
        ),

        totalWinners: winners.length,

        totalWinningAmount: sum(
          winners,
          "winningAmount"
        ),

        totalDeposits: sum(
          wallets,
          "totalDeposit"
        ),

        totalWithdrawals: sum(
          wallets,
          "totalWithdraw"
        ),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// LOTTERIES
// =====================================================

exports.listLotteries = async (req, res) => {
  try {
    const lotteries = await Lottery.findAll({
      order: [["displayOrder", "ASC"], ["id", "ASC"]],
    });

    return res.json({
      success: true,
      data: withComputedStatusList(lotteries),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createLottery = async (req, res) => {
  let uploadedLogo = null;
  try {
    const { fields, error } = lotteryPayload(
      req.body || {}
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const duplicate = await Lottery.findOne({
      where: {
        lotteryName: {
          [Op.iLike]: fields.lotteryName,
        },
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Lottery already exists",
      });
    }

    if (req.file) {
      uploadedLogo = await uploadBuffer(req.file.buffer, "lucky-horse/lotteries");
      fields.logo = uploadedLogo.secure_url;
      fields.logoPublicId = uploadedLogo.public_id;
    }

    if (fields.displayOrder === undefined) {
      fields.displayOrder = (await Lottery.max("displayOrder") || 0) + 1;
    }
    fields.featured = fields.featured ?? false;
    fields.isActive = fields.isActive ?? true;
    fields.cardTheme = fields.cardTheme || "purple";

    const lottery = await Lottery.create(fields);

    await safeRecordActivity({
      action: "LOTTERY_CREATED",
      title: "Lottery created",
      message: `${lottery.lotteryName} was created.`,
      actorUserId: req.user.userId,
      LotteryId: lottery.id,
      eventKey: `lottery-created:${lottery.id}`,
    });

    return res.status(201).json({
      success: true,
      data: lottery,
    });
  } catch (error) {
    if (uploadedLogo?.public_id) await deleteAsset(uploadedLogo.public_id).catch(() => {});
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getLottery = async (req, res) => {
  try {
    const lottery = await Lottery.findByPk(
      numberOrNull(req.params.id)
    );

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    return res.json({
      success: true,
      data: withComputedStatus(lottery),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLottery = async (req, res) => {
  let uploadedLogo = null;
  try {
    const lottery = await Lottery.findByPk(
      numberOrNull(req.params.id)
    );

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    const { fields, error } = lotteryPayload(
      req.body || {},
      true,
      lottery
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (fields.lotteryName) {
      const duplicate = await Lottery.findOne({
        where: {
          lotteryName: {
            [Op.iLike]: fields.lotteryName,
          },

          id: {
            [Op.ne]: lottery.id,
          },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Lottery already exists",
        });
      }
    }

    if (req.file) {
      uploadedLogo = await uploadBuffer(req.file.buffer, "lucky-horse/lotteries");
      fields.logo = uploadedLogo.secure_url;
      fields.logoPublicId = uploadedLogo.public_id;
    }

    const previousLogoPublicId = lottery.logoPublicId;
    const logoUrlChanged = fields.logo !== undefined && fields.logo !== lottery.logo;
    if (logoUrlChanged && !uploadedLogo) fields.logoPublicId = null;
    await lottery.update(fields);

    if ((uploadedLogo || logoUrlChanged) && previousLogoPublicId) {
      await deleteAsset(previousLogoPublicId).catch(() => {});
    }

    await safeRecordActivity({
      action: "LOTTERY_UPDATED",
      title: "Lottery updated",
      message: `${lottery.lotteryName} was updated.`,
      actorUserId: req.user.userId,
      LotteryId: lottery.id,
      eventKey: `lottery-updated:${lottery.id}:${
        lottery.updatedAt?.getTime() || Date.now()
      }`,
    });

    return res.json({
      success: true,
      data: lottery,
    });
  } catch (error) {
    if (uploadedLogo?.public_id) await deleteAsset(uploadedLogo.public_id).catch(() => {});
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteLottery = async (req, res) => {
  try {
    const lottery = await Lottery.findByPk(numberOrNull(req.params.id));
    if (!lottery) {
      return res.status(404).json({ success: false, message: "Lottery not found" });
    }

    const [ticketCount, resultCount, activityCount] = await Promise.all([
      Ticket.count({ where: { LotteryId: lottery.id } }),
      WinningResult.count({ where: { LotteryId: lottery.id } }),
      ActivityLog.count({ where: { LotteryId: lottery.id } }),
    ]);
    if (ticketCount || resultCount || activityCount) {
      return res.status(409).json({
        success: false,
        message: "This lottery has ticket or result history and cannot be deleted. Disable it instead.",
      });
    }

    await lottery.destroy();
    if (lottery.logoPublicId) await deleteAsset(lottery.logoPublicId).catch(() => {});
    return res.json({ success: true, data: { id: lottery.id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLotteryStatus = async (req, res) => {
  try {
    const lottery = await Lottery.findByPk(
      numberOrNull(req.params.id)
    );

    if (!lottery) {
      return res.status(404).json({
        success: false,
        message: "Lottery not found",
      });
    }

    if (
      typeof req.body?.isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    lottery.isActive = req.body.isActive;

    await lottery.save();

    await safeRecordActivity({
      action: lottery.isActive
        ? "LOTTERY_ENABLED"
        : "LOTTERY_DISABLED",

      title: `Lottery ${
        lottery.isActive
          ? "enabled"
          : "disabled"
      }`,

      message: `${lottery.lotteryName} status changed.`,

      actorUserId: req.user.userId,

      LotteryId: lottery.id,

      eventKey: `lottery-status:${lottery.id}:${
        lottery.isActive
      }:${
        lottery.updatedAt?.getTime() || Date.now()
      }`,
    });

    return res.json({
      success: true,
      data: lottery,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TICKETS
// =====================================================

exports.listTickets = async (req, res) => {
  try {
    const where = {};

    const lotteryId = numberOrNull(
      req.query.lotteryId
    );

    const userId = numberOrNull(
      req.query.userId
    );

    if (lotteryId) {
      where.LotteryId = lotteryId;
    }

    if (userId) {
      where.UserId = userId;
    }

    if (req.query.status) {
      where.status = String(
        req.query.status
      ).toUpperCase();
    }

    if (req.query.ticketId) {
      const ticketQuery = String(
        req.query.ticketId
      ).trim();

      const ticketId = numberOrNull(
        ticketQuery
      );

      if (ticketId) {
        where.id = ticketId;
      } else {
        where.ticketNumber = {
          [Op.iLike]: `%${ticketQuery}%`,
        };
      }
    }

    const createdAt = dateRange(
      req.query.date
    );

    if (createdAt) {
      where.createdAt = createdAt;
    }

    const tickets = await Ticket.findAll({
      where,

      include: [
        {
          model: User,
          attributes: publicUserAttributes,
        },

        {
          model: Lottery,
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });

    return res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(
      numberOrNull(req.params.id),
      {
        include: [
          {
            model: User,
            attributes: publicUserAttributes,
          },
          {
            model: Lottery,
          },
        ],
      }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// USERS
// =====================================================

exports.listUsers = async (req, res) => {
  try {
    const where = {};

    if (req.query.search) {
      const search = String(
        req.query.search
      ).trim();

      where[Op.or] = [
        {
          fullName: {
            [Op.iLike]: `%${search}%`,
          },
        },

        {
          mobile: {
            [Op.iLike]: `%${search}%`,
          },
        },

        {
          email: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const users = await User.findAll({
      where,

      attributes: publicUserAttributes,

      include: [
        {
          model: Wallet,

          attributes: {
            exclude: [
              "UserId",
              "createdAt",
              "updatedAt",
            ],
          },
        },

        {
          model: Ticket,

          attributes: [
            "id",
            "amount",
            "winningAmount",
            "status",
          ],
        },
      ],
    });

    const formattedUsers = users.map(
      (user) => {
        const tickets = user.Tickets || [];

        return {
          ...user.toJSON(),

          totalTickets: tickets.length,

          totalBetAmount: tickets.reduce(
            (sum, ticket) =>
              sum +
              Number(ticket.amount || 0),
            0
          ),

          totalWinningAmount:
            tickets.reduce(
              (sum, ticket) =>
                sum +
                Number(
                  ticket.winningAmount || 0
                ),
              0
            ),

          winningHistory: tickets
            .filter(
              (ticket) =>
                ticket.status === "WON"
            )
            .map(
              (ticket) => ticket.id
            ),
        };
      }
    );

    return res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error(
      "List users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(
      numberOrNull(req.params.id),
      {
        attributes: publicUserAttributes,

        include: [
          {
            model: Wallet,

            attributes: {
              exclude: [
                "UserId",
                "createdAt",
                "updatedAt",
              ],
            },
          },

          {
            model: Ticket,

            include: [
              Lottery,
            ],
          },
        ],
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,

      data: {
        user,

        ticketHistory:
          user.Tickets || [],

        bettingHistory:
          user.Tickets || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// WINNERS
// =====================================================

exports.listWinners = async (req, res) => {
  try {
    const winners = await Ticket.findAll({
      where: {
        status: "WON",
      },

      include: [
        {
          model: User,
          attributes: publicUserAttributes,
        },

        {
          model: Lottery,
        },
      ],

      order: [
        ["updatedAt", "DESC"],
      ],
    });

    return res.json({
      success: true,
      data: winners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TRANSACTIONS
// =====================================================

exports.listTransactions = async (req, res) => {
  try {
    const wallets = await Wallet.findAll({
      include: [
        {
          model: User,
          attributes: publicUserAttributes,
        },
      ],
    });

    const transactions = wallets.flatMap(
      (wallet) => {
        const entries = [
          [
            "DEPOSIT",
            wallet.totalDeposit,
          ],

          [
            "WITHDRAWAL",
            wallet.totalWithdraw,
          ],

          [
            "WINNING",
            wallet.totalWinning,
          ],
        ];

        return entries
          .filter(
            ([, amount]) =>
              Number(amount) > 0
          )
          .map(
            ([type, amount]) => ({
              type,

              amount: Number(amount),

              status: "COMPLETED",

              date: wallet.updatedAt,

              User: wallet.User,
            })
          );
      }
    );

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DRAW LOTTERY
// =====================================================

exports.drawLottery = (req, res) =>
  drawWinner(req, res);