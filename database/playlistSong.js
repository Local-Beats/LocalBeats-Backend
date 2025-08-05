const { DataTypes } = require("sequelize");
const db = require("./db");

const PlaylistSong = db.define("playlist_song", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "song",
      key: "id",
    },
  },
  playlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "playlist",
      key: "id",
    },
  },
}, {
  timestamps: true,  // enable Sequelize to auto-manage createdAt/updatedAt
  underscored: true, // auto adds created_at and updated_at correctly
});

module.exports = PlaylistSong;
