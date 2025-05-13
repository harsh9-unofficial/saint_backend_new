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
  as: "Category", // Add alias
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Category.hasMany(Collection, {
  foreignKey: "categoryId",
  as: "Collections", // Add alias
});

// Category <-> Product
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "Category", // Add alias
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "Products", // Add alias
});

// Collection <-> Product
Product.belongsTo(Collection, {
  foreignKey: "collectionId",
  as: "Collection", // Add alias
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Collection.hasMany(Product, {
  foreignKey: "collectionId",
  as: "Products", // Add alias
});

// Product <-> Image
Image.belongsTo(Product, {
  foreignKey: "productId",
  as: "Product",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Product.hasMany(Image, {
  foreignKey: "productId",
  as: "Images", // Add alias to match frontend
});

// Product <-> ProductColor (Explicit Junction Table)
Product.hasMany(ProductColor, {
  foreignKey: "productId",
  as: "ProductColors", // Add alias to match getAllProducts and frontend
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductColor.belongsTo(Product, {
  foreignKey: "productId",
  as: "Product",
});

// Color <-> ProductColor
Color.hasMany(ProductColor, {
  foreignKey: "colorId",
  as: "ProductColors",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ProductColor.belongsTo(Color, {
  foreignKey: "colorId",
  as: "Color",
});

// Product <-> ProductSize (Explicit Junction Table)
Product.hasMany(ProductSize, {
  foreignKey: "productId",
  as: "ProductSizes", // Add alias to match getAllProducts and frontend
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ProductSize.belongsTo(Product, {
  foreignKey: "productId",
  as: "Product",
});

// Size <-> ProductSize
Size.hasMany(ProductSize, {
  foreignKey: "sizeId",
  as: "ProductSizes",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
ProductSize.belongsTo(Size, {
  foreignKey: "sizeId",
  as: "Size",
});

// Optional: User <-> Contact (Assuming a relationship exists)
User.hasMany(Contact, {
  foreignKey: "userId", // Assuming Contact has a userId foreign key
  as: "Contacts",
});
Contact.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

// Synchronize models in the correct order
const syncDatabase = async () => {
  try {
    // Sync tables without dependencies first
    await Promise.all([
      Category.sync({ alter: true }),
      Color.sync({ alter: true }),
      Size.sync({ alter: true }),
      User.sync({ alter: true }),
    ]);

    // Sync tables with dependencies
    await Collection.sync({ alter: true });
    await Contact.sync({ alter: true }); // Moved here if it depends on User
    await Product.sync({ alter: true });
    await Promise.all([
      Image.sync({ alter: true }),
      ProductColor.sync({ alter: true }),
      ProductSize.sync({ alter: true }),
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
  Category,
  Collection,
  Color,
  Contact,
  Image,
  Product,
  ProductColor,
  ProductSize,
  Size,
  User,
};