const { DataTypes } = require("sequelize");
const db = require("./db");

const Song = db.define("song", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  spotify_track_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  album: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preview_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,  // enable Sequelize to auto-manage createdAt/updatedAt
  underscored: true, // auto adds created_at and updated_at correctly
});

module.exports = Song;
