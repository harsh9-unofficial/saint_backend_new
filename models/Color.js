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
  },
  {
    tableName: "colors",
    timestamps: true,
  }
);

Color.belongsToMany(Product, {
  through: "ProductColor",
  foreignKey: "colorId",
  otherKey: "productId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = Color;
