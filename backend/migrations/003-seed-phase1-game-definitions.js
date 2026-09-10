const definitions = [
  {
    name: "Green / Yellow / Red",
    slug: "green-yellow-red",
    type: "GREEN_YELLOW_RED",
    description: "Choose a number from 0 to 9 and explore the configured colour divisions.",
    configuration: {
      numbers: Array.from({ length: 10 }, (_, number) => ({
        number,
        color: ["GREEN", "YELLOW", "RED"][number % 3],
      })),
    },
  },
  {
    name: "Cricket",
    slug: "cricket",
    type: "CRICKET",
    description: "Explore configured cricket competitions in demo mode.",
    configuration: { categories: ["INTERNATIONAL", "T20", "IPL"] },
  },
  {
    name: "Golden Spin",
    slug: "golden-spin",
    type: "GOLDEN_SPIN",
    description: "Choose a number for the Golden Spin demo.",
    configuration: { numbers: Array.from({ length: 10 }, (_, number) => number) },
  },
  {
    name: "Rummy",
    slug: "rummy",
    type: "RUMMY_DEMO",
    description: "Enter the Rummy demo table with virtual credits.",
    configuration: { minAmount: 50, maxAmount: 5000 },
  },
  {
    name: "Poker",
    slug: "poker",
    type: "POKER_DEMO",
    description: "Explore the Poker demo placeholder with virtual credits.",
    configuration: { gameMode: "POKER" },
  },
  {
    name: "ABC Digit",
    slug: "abc-digit",
    type: "DIGIT_ABC",
    description: "Choose one of the configured ABC digit divisions.",
    configuration: { divisions: ["A", "B", "C"] },
  },
];

module.exports = {
  name: "003-seed-phase1-game-definitions",

  async up(queryInterface, transaction) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT slug FROM game_definitions WHERE slug IN (:slugs)",
      { replacements: { slugs: definitions.map((definition) => definition.slug) }, transaction }
    );
    const existingSlugs = new Set(existing.map((definition) => definition.slug));
    const now = new Date();
    const missing = definitions
      .filter((definition) => !existingSlugs.has(definition.slug))
      .map((definition) => ({
        ...definition,
        configuration: JSON.stringify(definition.configuration),
        enabled: true,
        createdAt: now,
        updatedAt: now,
      }));

    if (missing.length) await queryInterface.bulkInsert("game_definitions", missing, { transaction });
  },
};