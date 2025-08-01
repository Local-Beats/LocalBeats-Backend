const { DataTypes } = require("sequelize");
const db = require("./db");

const PlaylistSong = db.define("playlist_song", {
  playlist_id: {
    type: DataTypes.INT,
    allowNull: false,
  },
  song_id: {
    type: DataTypes.INT,
    allowNull: false,
  },
});

module.exports = PlaylistSong;
