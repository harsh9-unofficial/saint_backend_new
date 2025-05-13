const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your sequelize instance
const Product = require("./Product");

const Color = sequelize.define(
  "Color",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hexCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
  },
  {
    tableName: "colors",
    timestamps: true,
  }
);
module.exports = Color;
