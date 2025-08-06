const { DataTypes } = require("sequelize");
const db = require("./db");

const Song = db.define("song", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  spotify_track_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  artist: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  album: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  album_art: {
    type: DataTypes.TEXT,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preview_url: {
    type: DataTypes.TEXT,
    // allowNull: false,
  },
}, {
  timestamps: true,  // enable Sequelize to auto-manage createdAt/updatedAt
  underscored: true, // auto adds created_at and updated_at correctly
});

module.exports = Song;
