const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your sequelize instance
const Category = require("./Category");

const Collection = sequelize.define(
  "Collection",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
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
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Images must be an array");
          }
        },
      },
    },
  },
  {
    tableName: "collections",
    timestamps: true,
  }
);

Collection.belongsTo(Category, {
  foreignKey: "categoryId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Sync Category table first
(async () => {
  await Category.sync();
  await Collection.sync();
})();

module.exports = Collection;
