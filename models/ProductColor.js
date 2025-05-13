const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");
const Color = require("./Color");

const ProductColor = sequelize.define(
  "ProductColor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    colorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "colors",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "productColors",
    timestamps: true,
  }
);

module.exports = ProductColor;