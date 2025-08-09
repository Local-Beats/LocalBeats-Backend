const { DataTypes } = require("sequelize");
const db = require("./db");

const ListeningSession = db.define("listening_session", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("playing", "paused", "stopped"),
    allowNull: false,
    defaultValue: "stopped",
    validate: {
      isIn: [["playing", "paused", "stopped"]],
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "songs",
      key: "id",
    },
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,  // enable Sequelize to auto-manage createdAt/updatedAt
  underscored: true, // auto adds created_at and updated_at correctly
});

module.exports = ListeningSession;
