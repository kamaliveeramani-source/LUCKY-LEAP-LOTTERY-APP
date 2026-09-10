const User = require("./User");
const DemoWallet = require("./DemoWallet");
const GameDefinition = require("./GameDefinition");
const GameRound = require("./GameRound");
const GameOption = require("./GameOption");
const GameSelection = require("./GameSelection");
const GameResult = require("./GameResult");
const GameActivity = require("./GameActivity");

User.hasOne(DemoWallet, { foreignKey: "UserId", as: "DemoWallet" });
DemoWallet.belongsTo(User, { foreignKey: "UserId", as: "User" });

GameDefinition.hasMany(GameRound, { foreignKey: "GameDefinitionId", as: "rounds" });
GameRound.belongsTo(GameDefinition, { foreignKey: "GameDefinitionId", as: "game" });
GameDefinition.hasMany(GameOption, { foreignKey: "GameDefinitionId", as: "options" });
GameOption.belongsTo(GameDefinition, { foreignKey: "GameDefinitionId", as: "game" });
GameDefinition.hasMany(GameSelection, { foreignKey: "GameDefinitionId", as: "selections" });
GameSelection.belongsTo(GameDefinition, { foreignKey: "GameDefinitionId", as: "game" });
GameRound.hasMany(GameSelection, { foreignKey: "GameRoundId", as: "selections" });
GameSelection.belongsTo(GameRound, { foreignKey: "GameRoundId", as: "round" });
GameOption.hasMany(GameSelection, { foreignKey: "GameOptionId", as: "selections" });
GameSelection.belongsTo(GameOption, { foreignKey: "GameOptionId", as: "option" });
User.hasMany(GameSelection, { foreignKey: "UserId", as: "gameSelections" });
GameSelection.belongsTo(User, { foreignKey: "UserId", as: "user" });
GameRound.hasOne(GameResult, { foreignKey: "GameRoundId", as: "result" });
GameResult.belongsTo(GameRound, { foreignKey: "GameRoundId", as: "round" });
GameResult.belongsTo(GameOption, { foreignKey: "winningOptionId", as: "winningOption" });
GameDefinition.hasMany(GameActivity, { foreignKey: "GameDefinitionId", as: "activities" });
GameActivity.belongsTo(GameDefinition, { foreignKey: "GameDefinitionId", as: "game" });
GameRound.hasMany(GameActivity, { foreignKey: "GameRoundId", as: "activities" });
GameActivity.belongsTo(GameRound, { foreignKey: "GameRoundId", as: "round" });
GameActivity.belongsTo(User, { foreignKey: "actorUserId", as: "actor" });
GameActivity.belongsTo(User, { foreignKey: "UserId", as: "user" });

module.exports = { DemoWallet, GameDefinition, GameRound, GameOption, GameSelection, GameResult, GameActivity };
