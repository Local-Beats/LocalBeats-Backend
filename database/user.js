const { DataTypes } = require("sequelize");
const db = require("./db");
// const bcrypt = require("bcrypt");

const User = db.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true,
    validate: {
      len: [1, 30],
    },
  },
  auth0Id: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true,
  },
  // passwordHash: {
  //   type: DataTypes.TEXT,
  //   allowNull: true,
  // },
  spotify_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  spotify_access_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  spotify_email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  spotify_display_name: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [1, 30],
    },
  },
  spotify_image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.GEOGRAPHY("POINT", 4326), // This data type represents coordinates that also account for Earth's geography
    allowNull: true,
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,  // enable Sequelize to auto-manage createdAt/updatedAt
  underscored: true, // auto adds created_at and updated_at correctly
});

// Instance method to check password
// User.prototype.checkPassword = function (password) {
//   if (!this.passwordHash) {
//     return false; // Auth0 users don't have passwords
//   }
//   return bcrypt.compareSync(password, this.passwordHash);
// };

// Class method to hash password
// User.hashPassword = function (password) {
//   return bcrypt.hashSync(password, 10);
// };

module.exports = User;
