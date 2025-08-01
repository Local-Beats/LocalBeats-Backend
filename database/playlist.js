const { DataTypes } = require("sequelize");
const db = require("./db");

const Playlist = db.define("playlist", {
  name: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.INT,
    allowNull: false,
  },

  created_at: {
    type: DataTypes.TIMESTAMP,
  },
  updated_at: {
    type: DataTypes.TIMESTAMP,
  },
});

module.exports = Playlist;
