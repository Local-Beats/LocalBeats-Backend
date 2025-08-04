const { DataTypes } = require("sequelize");
const db = require("./db");

const Playlist = db.define("playlist", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Untitled",
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.TIMESTAMP,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.TIMESTAMP,
    allowNull: true,
  },
});

module.exports = Playlist;
