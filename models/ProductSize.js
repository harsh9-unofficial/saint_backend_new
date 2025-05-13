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
        model: "sizes",
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
      unique: true,
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
