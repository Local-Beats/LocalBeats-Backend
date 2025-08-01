const { DataTypes } = require("sequelize");
const db = require("./db");

const ListeningSession = db.define("listening_session", {
  status: {
    type: DataTypes.ENUM("playing", "paused", "stopped"),
    allowNull: false,
    defaultValue: "stopped",
  },
  user_id: {
    type: DataTypes.INT,
    allowNull: false,
  },
  song_id: {
    type: DataTypes.INT,
    allowNull: false,
  },
  started_at: {
    type: DataTypes.TIMESTAMP,
  },
  ended_at: {
    type: DataTypes.TIMESTAMP,
  },
});

module.exports = ListeningSession;
