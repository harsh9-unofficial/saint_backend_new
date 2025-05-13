const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your sequelize instance

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);

module.exports = Contact;
