const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");

const Image = sequelize.define(
  "Image",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "productColors",
    timestamps: true,
  }
);

Image.belongsTo(Product, { foreignKey: "productId" });

module.exports = Image;
