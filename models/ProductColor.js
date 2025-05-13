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
      allowNull: true, // Changed to true to support ON DELETE SET NULL
      references: {
        model: "colors",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed to true to support ON DELETE SET NULL
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
  },
  {
    tableName: "productColors",
    timestamps: true,
  }
);

ProductColor.belongsTo(Product, { foreignKey: "productId" });
ProductColor.belongsTo(Color, { foreignKey: "colorId" });

module.exports = ProductColor;