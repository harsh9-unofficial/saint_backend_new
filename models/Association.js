const Category = require("./Category");
const Collection = require("./Collection");
const Color = require("./Color");
const Contact = require("./ContactUs");
const Image = require("./Image");
const Product = require("./Product");
const ProductColor = require("./productColor");
const ProductSize = require("./ProductSize");
const Rating = require("./Ratings");
const Size = require("./Size");
const User = require("./User");

const defineAssociations = () => {
  // Category <-> Collection
  Collection.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "Category",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Category.hasMany(Collection, {
    foreignKey: "categoryId",
    as: "Collections",
  });

  // Category <-> Product
  Product.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "Category",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Category.hasMany(Product, {
    foreignKey: "categoryId",
    as: "Products",
  });

  // Collection <-> Product
  Product.belongsTo(Collection, {
    foreignKey: "collectionId",
    as: "Collection",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  });
  Collection.hasMany(Product, {
    foreignKey: "collectionId",
    as: "Products",
  });

  // Product <-> ProductColor
  Product.hasMany(ProductColor, {
    foreignKey: "productId",
    as: "ProductColors",
    onDelete: "SET NULL",
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

  // Product <-> ProductSize
  Product.hasMany(ProductSize, {
    foreignKey: "productId",
    as: "ProductSizes",
    onDelete: "SET NULL",
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

  // Product <-> Image
  Image.belongsTo(Product, {
    foreignKey: "productId",
    as: "Product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(Image, {
    foreignKey: "productId",
    as: "Images",
  });

  // Rating <-> Product
  Rating.belongsTo(Product, {
    foreignKey: "productId",
    as: "Product",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Product.hasMany(Rating, {
    foreignKey: "productId",
    as: "Ratings",
  });

  // Rating <-> User
  Rating.belongsTo(User, {
    foreignKey: "userId",
    as: "User",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  User.hasMany(Rating, {
    foreignKey: "userId",
    as: "Ratings",
  });
};

const syncDatabase = async () => {
  try {
    await Promise.all([
      Category.sync({ alter: true }),
      Color.sync({ alter: true }),
      Size.sync({ alter: true }),
      User.sync({ alter: true }),
    ]);

    await Collection.sync({ alter: true });
    await Contact.sync({ alter: true });
    await Product.sync({ alter: true });
    await Promise.all([
      Image.sync({ alter: true }),
      ProductColor.sync({ alter: true }),
      ProductSize.sync({ alter: true }),
    ]);
    await Rating.sync({ alter: true });
    
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    throw error;
  }
};

module.exports = {
  syncDatabase,
  defineAssociations,
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
