const Product = require("../models/Product");
const Image = require("../models/Image");
const Color = require("../models/Color"); // Add Color model
const Size = require("../models/Size"); // Add Size model
const ProductColor = require("../models/productColor");
const ProductSize = require("../models/ProductSize");
const { Op } = require("sequelize");
const Category = require("../models/Category");
const Collection = require("../models/Collection");

const ProductController = {
  // Create a new product with associated images, colors, and sizes
  async createProduct(req, res) {
    try {
      if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
      }

      const {
        name,
        basePrice,
        description,
        categoryId,
        collectionId,
        details,
        sizeFit,
        materialCare,
        shippingReturn,
        colors,
        sizes,
      } = req.body;

      // Input validation
      if (!name || !basePrice) {
        return res
          .status(400)
          .json({ message: "Name and basePrice are required" });
      }

      // Parse JSON strings if they are strings, otherwise use as-is
      const parseIfString = (value) =>
        typeof value === "string" ? JSON.parse(value) : value || [];
      const detailsArray = parseIfString(details);
      const sizeFitArray = parseIfString(sizeFit);
      const materialCareArray = parseIfString(materialCare);
      const shippingReturnArray = parseIfString(shippingReturn);
      const parsedColors = parseIfString(colors);
      const parsedSizes = parseIfString(sizes);

      const images = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      // Create product
      const product = await Product.create({
        name,
        basePrice: parseFloat(basePrice),
        description,
        categoryId: parseInt(categoryId) || null,
        collectionId: parseInt(collectionId) || null,
        details: detailsArray,
        sizeFit: sizeFitArray,
        materialCare: materialCareArray,
        shippingReturn: shippingReturnArray,
      });

      // Create images
      if (images.length > 0) {
        const imageData = images.map((url) => ({
          productId: product.id,
          imageUrl: url, // Adjust to `url` if that's the field name in Image model
        }));
        await Image.bulkCreate(imageData);
      }

      // Create colors
      if (parsedColors.length > 0) {
        const colorData = parsedColors.map((color) => ({
          productId: product.id,
          colorId: parseInt(color.colorId),
          name: color.name,
        }));
        await ProductColor.bulkCreate(colorData);
      }

      // Create sizes
      if (parsedSizes.length > 0) {
        const sizeData = parsedSizes.map((size) => ({
          productId: product.id,
          sizeId: parseInt(size.sizeId),
          name: size.name,
          originalPrice: parseFloat(size.originalPrice),
          stock: parseInt(size.stock),
        }));
        await ProductSize.bulkCreate(sizeData);
      }

      // Fetch created product
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Image, as: "Images", attributes: ["imageUrl"] },
          {
            model: Color,
            through: { attributes: [] },
            attributes: ["id", "name"],
          },
          {
            model: Size,
            through: { attributes: ["originalPrice", "stock"] },
            attributes: ["id", "name"],
          },
        ],
      });

      // Transform response
      const transformedProduct = {
        ...createdProduct.toJSON(),
        images: createdProduct.Images.map((image) => image.imageUrl),
        Colors: createdProduct.Colors, // Include color data
        Sizes: createdProduct.Sizes, // Include size data
      };

      return res.status(201).json({
        message: "Product created successfully",
        product: transformedProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return res
        .status(500)
        .json({ message: "Error creating product", error: error.message });
    }
  },

  // Update a product and its associated data
  async updateProduct(req, res) {
    const { id } = req.params;

    try {
      const {
        name,
        basePrice,
        description,
        categoryId,
        collectionId,
        details,
        sizeFit,
        materialCare,
        shippingReturn,
        colors,
        sizes,
      } = req.body;

      // Input validation
      if (!name || !basePrice) {
        return res
          .status(400)
          .json({ message: "Name and basePrice are required" });
      }

      // Parse JSON strings if they are strings, otherwise use as-is
      const parseIfString = (value) =>
        typeof value === "string" ? JSON.parse(value) : value || [];
      const detailsArray = parseIfString(details);
      const sizeFitArray = parseIfString(sizeFit);
      const materialCareArray = parseIfString(materialCare);
      const shippingReturnArray = parseIfString(shippingReturn);
      const parsedColors = parseIfString(colors);
      const parsedSizes = parseIfString(sizes);

      const images = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update product details
      await product.update({
        name,
        basePrice: parseFloat(basePrice),
        description,
        categoryId: parseInt(categoryId) || null,
        collectionId: parseInt(collectionId) || null,
        details: detailsArray,
        sizeFit: sizeFitArray,
        materialCare: materialCareArray,
        shippingReturn: shippingReturnArray,
      });

      // Update images
      if (images.length > 0) {
        await Image.destroy({ where: { productId: id } });
        const imageData = images.map((url) => ({
          productId: id,
          imageUrl: url,
        }));
        await Image.bulkCreate(imageData);
      }

      // Update colors
      if (parsedColors.length > 0) {
        await ProductColor.destroy({ where: { productId: id } });
        const colorData = parsedColors.map((color) => ({
          productId: id,
          colorId: parseInt(color.colorId),
          name: color.name,
        }));
        await ProductColor.bulkCreate(colorData);
      }

      // Update sizes with validation
      if (parsedSizes.length > 0) {
        await ProductSize.destroy({ where: { productId: id } });

        // Extract all sizeIds from parsedSizes
        const sizeIds = parsedSizes.map((size) => parseInt(size.sizeId));

        // Check if all sizeIds exist in the sizes table
        const existingSizes = await Size.findAll({
          where: {
            id: sizeIds,
          },
          attributes: ["id"],
        });

        // Map existing sizeIds to a Set for quick lookup
        const existingSizeIds = new Set(existingSizes.map((size) => size.id));

        // Check for invalid sizeIds
        const invalidSizeIds = sizeIds.filter(
          (sizeId) => !existingSizeIds.has(sizeId)
        );
        if (invalidSizeIds.length > 0) {
          return res.status(400).json({
            message: `Invalid sizeId(s) provided: ${invalidSizeIds.join(
              ", "
            )}. These sizes do not exist.`,
          });
        }

        // If all sizeIds are valid, proceed with bulkCreate
        const sizeData = parsedSizes.map((size) => ({
          productId: id,
          sizeId: parseInt(size.sizeId),
          name: size.name,
          originalPrice: parseFloat(size.originalPrice),
          stock: parseInt(size.stock),
        }));
        await ProductSize.bulkCreate(sizeData);
      }

      // Fetch updated product
      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: Image, as: "Images", attributes: ["imageUrl"] },
          {
            model: ProductColor,
            as: "ProductColors",
            attributes: ["id", "name"],
          },
          {
            model: ProductSize,
            as: "ProductSizes",
            attributes: ["id", "name", "originalPrice", "stock"],
          },
        ],
      });

      // Transform response
      const transformedProduct = {
        ...updatedProduct.toJSON(),
        images: updatedProduct.Images.map((image) => image.imageUrl),
        Colors: updatedProduct.Colors,
        Sizes: updatedProduct.Sizes,
      };

      return res.status(200).json({
        message: "Product updated successfully",
        product: transformedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res
        .status(500)
        .json({ message: "Error updating product", error: error.message });
    }
  },

  // Get all products with their associated data
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: Image,
            as: "Images",
            attributes: ["imageUrl"],
          },
          {
            model: ProductColor,
            as: "ProductColors",
            attributes: ["id", "name"],
            include: [
              {
                model: Color,
                as: "Color",
                attributes: ["id", "name", "hexCode"],
              },
            ],
          },
          {
            model: ProductSize,
            as: "ProductSizes",
            attributes: ["id", "name", "originalPrice", "stock"],
          },
          {
            model: Category,
            as: "Category",
            attributes: ["name"],
          },
          {
            model: Collection,
            as: "Collection",
            attributes: ["name"],
          },
        ],
      });

      // Transform response
      const transformedProducts = products.map((product) => {
        const productJson = product.toJSON();
        return {
          ...productJson,
          images: productJson.Images
            ? productJson.Images.map((image) => image.imageUrl)
            : [],
          // Colors: productJson.ProductColors
          //   ? productJson.ProductColors.map((productColor) => ({
          //       id: productColor.id,
          //       name: productColor.name,
          //       hexCode: productColor.Color?.hexCode || null,
          //     }))
          //   : [],
          // Sizes: productJson.ProductSizes
          //   ? productJson.ProductSizes.map((productSize) => ({
          //       id: productSize.id,
          //       name: productSize.name,
          //       originalPrice: productSize.originalPrice,
          //       stock: productSize.stock,
          //     }))
          //   : [],
        };
      });

      // console.log(transformedProducts);

      return res.status(200).json(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res
        .status(500)
        .json({ message: "Error fetching products", error: error.message });
    }
  },

  // Get a single product by ID
  async getProductById(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findByPk(id, {
        include: [
          {
            model: Image,
            as: "Images",
            attributes: ["imageUrl"],
          },
          {
            model: ProductColor,
            as: "ProductColors",
            attributes: ["id", "name"],
            include: [
              {
                model: Color,
                as: "Color",
                attributes: ["id", "name", "hexCode"],
              },
            ],
          },
          {
            model: ProductSize,
            as: "ProductSizes",
            attributes: ["id", "name", "originalPrice", "stock"],
          },
          {
            model: Category,
            as: "Category",
            attributes: ["name"],
          },
          {
            model: Collection,
            as: "Collection",
            attributes: ["name"],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Transform response
      const transformedProduct = {
        ...product.toJSON(),
        images: product.Images.map((image) => image.imageUrl),
        Colors: product.Colors,
        Sizes: product.Sizes,
      };

      return res.status(200).json(transformedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res
        .status(500)
        .json({ message: "Error fetching product", error: error.message });
    }
  },

  // Delete a product and its associated data
  async deleteProduct(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete associated data
      await Image.destroy({ where: { productId: id } });
      await ProductColor.destroy({ where: { productId: id } });
      await ProductSize.destroy({ where: { productId: id } });

      // Delete product
      await product.destroy();

      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res
        .status(500)
        .json({ message: "Error deleting product", error: error.message });
    }
  },
};

module.exports = ProductController;
