const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Size = require("./Size");
const Product = require("./Product");

const ProductSize = sequelize.define(
  "ProductSize",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sizeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Size,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "productSizes",
    timestamps: true,
  }
);

module.exports = ProductSize;
