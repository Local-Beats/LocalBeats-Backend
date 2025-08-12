const db = require("./db");
const User = require("./user");
const Song = require("./song");
const Playlist = require("./playlist");
const PlaylistSong = require("./playlistSong");
const ListeningSession = require("./listeningSession");


// USER ↔ PLAYLIST (one-to-many)
User.hasMany(Playlist, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Playlist.belongsTo(User, {
  foreignKey: 'user_id',
});


// USER ↔ LISTENING_SESSION (one-to-many)
User.hasMany(ListeningSession, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ListeningSession.belongsTo(User, {
  foreignKey: 'user_id',
});


// SONG ↔ LISTENING_SESSION (one-to-many)
Song.hasMany(ListeningSession, {
  foreignKey: 'song_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
ListeningSession.belongsTo(Song, {
  foreignKey: 'song_id',
});


// SONG ↔ PLAYLIST_SONG (one-to-many)
Song.hasMany(PlaylistSong, {
  foreignKey: 'song_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
PlaylistSong.belongsTo(Song, {
  foreignKey: 'song_id',
});


// PLAYLIST ↔ PLAYLIST_SONG (one-to-many)
Playlist.hasMany(PlaylistSong, {
  foreignKey: 'playlist_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
PlaylistSong.belongsTo(Playlist, {
  foreignKey: 'playlist_id',
});



// many to many just in case
Playlist.belongsToMany(Song, {
  through: PlaylistSong,
  foreignKey: 'playlist_id',
  otherKey: 'song_id',
});
Song.belongsToMany(Playlist, {
  through: PlaylistSong,
  foreignKey: 'song_id',
  otherKey: 'playlist_id',
});

module.exports = {
  db,
  User,
  Song,
  Playlist,
  PlaylistSong,
  ListeningSession,
};
