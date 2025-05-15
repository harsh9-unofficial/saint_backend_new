const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Cart = Sequelize.define(
  "cart",
  {
    cartId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cart",
    timestamps: true,
  }
);

module.exports = Cart;
