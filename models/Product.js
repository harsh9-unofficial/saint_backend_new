const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Category = require("./Category");
const Collection = require("./Collection");

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
        model: Category,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    collectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Collection,
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
            throw new Error("HowToUse must be an array");
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
            throw new Error("HowToUse must be an array");
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
            throw new Error("HowToUse must be an array");
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
            throw new Error("HowToUse must be an array");
          }
        },
      },
    },
  },
  {
    timestamps: true,
    tableName: "products",
  }
);

// Define relationships
Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Product, { foreignKey: "categoryId" });

Product.belongsTo(Collection, { foreignKey: "collectionId" });
Collection.hasMany(Product, { foreignKey: "collectionId" });

// Sync tables in the correct order
(async () => {
  await Category.sync();
  await Collection.sync();
  await Product.sync();
})();

module.exports = Product;
