const db = require("./db");
const User = require("./user");
const Song = require("./song");
const Playlist = require("./playlist");
const PlaylistSong = require("./playlistSong");
const ListeningSession = require("./listeningSession");

// Local Beats database table associations
// All associations are one-to-many

// playlist_user: user.id < playlist.user_id
User.hasMany(Playlist);
Playlist.belongsTo(User);

// session_user: user.id < listening_session.user_id
User.hasMany(ListeningSession);
ListeningSession.belongsTo(User);

// session_song: song.id < listening_session.song_id
Song.hasMany(ListeningSession);
ListeningSession.belongsTo(Song);

// playlist_track: song.id < playlist_song.song_id 
Song.hasMany(PlaylistSong);
PlaylistSong.belongsTo(Song);

// track_playlist: playlist.id < playlist_song.playlist_id
Playlist.hasMany(PlaylistSong);
PlaylistSong.belongsTo(Playlist);

// Database model exports
module.exports = {
  db,
  User,
  Song,
  Playlist,
  PlaylistSong,
  ListeningSession,
};
