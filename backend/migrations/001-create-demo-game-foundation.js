const { DataTypes } = require("sequelize");

module.exports = {
  name: "001-create-demo-game-foundation",

  async up(queryInterface) {
    const tableExists = async (tableName) => (await queryInterface.showAllTables()).some((table) => String(table).toLowerCase() === tableName.toLowerCase());
    const users = { model: "Users", key: "id" };
    const gameDefinitions = { model: "game_definitions", key: "id" };
    const gameRounds = { model: "game_rounds", key: "id" };
    const gameOptions = { model: "game_options", key: "id" };

    if (!(await tableExists("demo_wallets"))) {
      await queryInterface.createTable("demo_wallets", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        UserId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: users, onUpdate: "CASCADE", onDelete: "CASCADE" },
        balance: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "DEMO_CREDITS" },
        status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "ACTIVE" },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
    }

    if (!(await tableExists("game_definitions"))) {
      await queryInterface.createTable("game_definitions", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        slug: { type: DataTypes.STRING(140), allowNull: false, unique: true },
        type: { type: DataTypes.STRING(32), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
        enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_definitions", ["type", "enabled"], { name: "game_definitions_type_enabled_idx" });
    }

    if (!(await tableExists("game_rounds"))) {
      await queryInterface.createTable("game_rounds", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: gameDefinitions, onUpdate: "CASCADE", onDelete: "CASCADE" },
        roundCode: { type: DataTypes.STRING(80), allowNull: false },
        startTime: { type: DataTypes.DATE, allowNull: false },
        endTime: { type: DataTypes.DATE, allowNull: false },
        status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "OPEN" },
        resultStatus: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "PENDING" },
        publishedAt: { type: DataTypes.DATE, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_rounds", ["GameDefinitionId", "roundCode"], { unique: true, name: "game_rounds_game_round_code_uq" });
      await queryInterface.addIndex("game_rounds", ["GameDefinitionId", "status", "endTime"], { name: "game_rounds_game_status_end_idx" });
    }

    if (!(await tableExists("game_options"))) {
      await queryInterface.createTable("game_options", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: gameDefinitions, onUpdate: "CASCADE", onDelete: "CASCADE" },
        key: { type: DataTypes.STRING(80), allowNull: false },
        label: { type: DataTypes.STRING(120), allowNull: false },
        value: { type: DataTypes.STRING(80), allowNull: true },
        colour: { type: DataTypes.STRING(32), allowNull: true },
        category: { type: DataTypes.STRING(80), allowNull: true },
        multiplier: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        configuration: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_options", ["GameDefinitionId", "key"], { unique: true, name: "game_options_game_key_uq" });
      await queryInterface.addIndex("game_options", ["GameDefinitionId", "enabled"], { name: "game_options_game_enabled_idx" });
    }

    if (!(await tableExists("game_selections"))) {
      await queryInterface.createTable("game_selections", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        UserId: { type: DataTypes.INTEGER, allowNull: false, references: users, onUpdate: "CASCADE", onDelete: "CASCADE" },
        GameDefinitionId: { type: DataTypes.INTEGER, allowNull: false, references: gameDefinitions, onUpdate: "CASCADE", onDelete: "CASCADE" },
        GameRoundId: { type: DataTypes.INTEGER, allowNull: false, references: gameRounds, onUpdate: "CASCADE", onDelete: "CASCADE" },
        GameOptionId: { type: DataTypes.INTEGER, allowNull: true, references: gameOptions, onUpdate: "CASCADE", onDelete: "SET NULL" },
        selectedValue: { type: DataTypes.STRING(120), allowNull: true },
        stakeAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        multiplier: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        demoAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
        status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "PENDING" },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_selections", ["UserId", "GameRoundId"], { unique: true, name: "game_selections_user_round_uq" });
      await queryInterface.addIndex("game_selections", ["GameDefinitionId", "GameRoundId"], { name: "game_selections_game_round_idx" });
      await queryInterface.addIndex("game_selections", ["UserId", "createdAt"], { name: "game_selections_user_created_idx" });
    }

    if (!(await tableExists("game_results"))) {
      await queryInterface.createTable("game_results", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        GameRoundId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: gameRounds, onUpdate: "CASCADE", onDelete: "CASCADE" },
        winningOptionId: { type: DataTypes.INTEGER, allowNull: true, references: gameOptions, onUpdate: "CASCADE", onDelete: "SET NULL" },
        winningValue: { type: DataTypes.STRING(120), allowNull: true },
        published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        publishedAt: { type: DataTypes.DATE, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_results", ["published", "publishedAt"], { name: "game_results_published_idx" });
    }

    if (!(await tableExists("game_activities"))) {
      await queryInterface.createTable("game_activities", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        action: { type: DataTypes.STRING(64), allowNull: false },
        title: { type: DataTypes.STRING(160), allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
        result: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "SUCCESS" },
        actorUserId: { type: DataTypes.INTEGER, allowNull: true, references: users, onUpdate: "CASCADE", onDelete: "SET NULL" },
        UserId: { type: DataTypes.INTEGER, allowNull: true, references: users, onUpdate: "CASCADE", onDelete: "SET NULL" },
        GameDefinitionId: { type: DataTypes.INTEGER, allowNull: true, references: gameDefinitions, onUpdate: "CASCADE", onDelete: "SET NULL" },
        GameRoundId: { type: DataTypes.INTEGER, allowNull: true, references: gameRounds, onUpdate: "CASCADE", onDelete: "SET NULL" },
        metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex("game_activities", ["GameDefinitionId", "createdAt"], { name: "game_activities_game_created_idx" });
      await queryInterface.addIndex("game_activities", ["GameRoundId", "createdAt"], { name: "game_activities_round_created_idx" });
      await queryInterface.addIndex("game_activities", ["UserId", "createdAt"], { name: "game_activities_user_created_idx" });
    }
  },

  async down(queryInterface) {
    for (const table of ["game_activities", "game_results", "game_selections", "game_options", "game_rounds", "game_definitions", "demo_wallets"]) {
      await queryInterface.dropTable(table);
    }
  },
};
