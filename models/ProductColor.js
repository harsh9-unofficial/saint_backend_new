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
        model: Color,
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
  },
  {
    tableName: "productColors",
    timestamps: true,
  }
);

module.exports = ProductColor;