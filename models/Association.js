const Category = require("./Category");
const Collection = require("./Collection");
const Color = require("./Color");
const Contact = require("./ContactUs");
const Image = require("./Image");
const Product = require("./Product");
const ProductColor = require("./productColor");
const ProductSize = require("./ProductSize");
const Size = require("./Size");
const User = require("./User");

// Category <-> Collection
Collection.belongsTo(Category, {
  foreignKey: "categoryId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Category.hasMany(Collection, {
  foreignKey: "categoryId",
});

// Category <-> Product
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Category.hasMany(Product, {
  foreignKey: "categoryId",
});

// Collection <-> Product
Product.belongsTo(Collection, {
  foreignKey: "collectionId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Collection.hasMany(Product, {
  foreignKey: "collectionId",
});

// Product <-> Image
Image.belongsTo(Product, {
  foreignKey: "productId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.hasMany(Image, {
  foreignKey: "productId",
});

// Product <-> Color (Many-to-Many through ProductColor)
Product.belongsToMany(Color, {
  through: ProductColor,
  foreignKey: "productId",
  otherKey: "colorId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Color.belongsToMany(Product, {
  through: ProductColor,
  foreignKey: "colorId",
  otherKey: "productId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ProductColor.belongsTo(Product, { foreignKey: "productId" });
ProductColor.belongsTo(Color, { foreignKey: "colorId" });

// Product <-> Size (Many-to-Many through ProductSize)
Product.belongsToMany(Size, {
  through: ProductSize,
  foreignKey: "productId",
  otherKey: "sizeId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Size.belongsToMany(Product, {
  through: ProductSize,
  foreignKey: "sizeId",
  otherKey: "productId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ProductSize.belongsTo(Product, { foreignKey: "productId" });
ProductSize.belongsTo(Size, { foreignKey: "sizeId" });

// Synchronize models in the correct order
const syncDatabase = async () => {
  try {
    // Sync tables without dependencies first
    await Promise.all([
      Category.sync({ force: false }),
      Color.sync({ force: false }),
      Size.sync({ force: false }),
      User.sync({ force: false }),
      Contact.sync({ force: false }),
    ]);

    // Sync tables with dependencies
    await Collection.sync({ force: false });
    await Product.sync({ force: false });
    await Promise.all([
      Image.sync({ force: false }),
      ProductColor.sync({ force: false }),
      ProductSize.sync({ force: false }),
    ]);

    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    throw error;
  }
};

// Export models and sync function
module.exports = {
  syncDatabase,
};
