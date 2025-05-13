const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your sequelize instance

const Size = sequelize.define(
  "Size",
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
  },
  {
    tableName: "sizes",
    timestamps: true,
  }
);

module.exports = Size;
