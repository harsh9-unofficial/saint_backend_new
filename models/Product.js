const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");
const Collection = require("./Collection");
const Image = require("./Image");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    collectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "collections",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    basePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    details: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("details must be an array");
          }
        },
      },
    },
    sizeFit: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("sizeFit must be an array");
          }
        },
      },
    },
    materialCare: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("materialCare must be an array");
          }
        },
      },
    },
    shippingReturn: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("shippingReturn must be an array");
          }
        },
      },
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
