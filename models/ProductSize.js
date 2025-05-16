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
    originalQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchaseQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remainingQty: {
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
