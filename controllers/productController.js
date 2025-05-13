const Product = require("../models/Product");
const Image = require("../models/Image");
const ProductColor = require("../models/productColor");
const ProductSize = require("../models/ProductSize");
const { Op } = require("sequelize");

const ProductController = {
  // Create a new product with associated images, colors, and sizes
  async createProduct(req, res) {
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
      images,
      colors,
      sizes,
    } = req.body;

    try {
      // Create product
      const product = await Product.create({
        name,
        basePrice,
        description,
        categoryId,
        collectionId,
        details,
        sizeFit,
        materialCare,
        shippingReturn,
      });

      // Create associated images
      if (images && images.length > 0) {
        const imageData = images.map((url) => ({
          productId: product.id,
          imageUrl: url,
        }));
        await Image.bulkCreate(imageData);
      }

      // Create associated colors
      if (colors && colors.length > 0) {
        const colorData = colors.map((color) => ({
          productId: product.id,
          colorId: color.colorId,
          name: color.name,
        }));
        await ProductColor.bulkCreate(colorData);
      }

      // Create associated sizes
      if (sizes && sizes.length > 0) {
        const sizeData = sizes.map((size) => ({
          productId: product.id,
          sizeId: size.sizeId,
          name: size.name,
          originalPrice: size.originalPrice,
          stock: size.stock,
        }));
        await ProductSize.bulkCreate(sizeData);
      }

      // Fetch the complete product with associations
      const completeProduct = await Product.findByPk(product.id, {
        include: [
          { model: Image },
          { model: ProductColor },
          { model: ProductSize },
        ],
      });

      // Transform the response to include only imageUrls
      const transformedProduct = {
        ...completeProduct.toJSON(),
        Images: completeProduct.Images.map((image) => image.imageUrl),
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

  // Get all products with their associated data, returning only imageUrls for Images
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll({
        include: [
          { model: Image },
          { model: ProductColor },
          { model: ProductSize },
        ],
      });

      // Transform the response to include only imageUrls
      const transformedProducts = products.map((product) => ({
        ...product.toJSON(),
        Images: product.Images.map((image) => image.imageUrl),
      }));

      return res.status(200).json(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res
        .status(500)
        .json({ message: "Error fetching products", error: error.message });
    }
  },

  // Get a single product by ID, returning only imageUrls for Images
  async getProductById(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findByPk(id, {
        include: [
          { model: Image },
          { model: ProductColor },
          { model: ProductSize },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Transform the response to include only imageUrls
      const transformedProduct = {
        ...product.toJSON(),
        Images: product.Images.map((image) => image.imageUrl),
      };

      return res.status(200).json(transformedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res
        .status(500)
        .json({ message: "Error fetching product", error: error.message });
    }
  },

  // Update a product and its associated data
  async updateProduct(req, res) {
    const { id } = req.params;
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
      images,
      colors,
      sizes,
    } = req.body;

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update product details
      await product.update({
        name,
        basePrice,
        description,
        categoryId,
        collectionId,
        details,
        sizeFit,
        materialCare,
        shippingReturn,
      });

      // Update images
      if (images) {
        await Image.destroy({ where: { productId: id } });
        const imageData = images.map((url) => ({
          productId: id,
          imageUrl: url,
        }));
        await Image.bulkCreate(imageData);
      }

      // Update colors
      if (colors) {
        await ProductColor.destroy({ where: { productId: id } });
        const colorData = colors.map((color) => ({
          productId: id,
          colorId: color.colorId,
          name: color.name,
        }));
        await ProductColor.bulkCreate(colorData);
      }

      // Update sizes
      if (sizes) {
        await ProductSize.destroy({ where: { productId: id } });
        const sizeData = sizes.map((size) => ({
          productId: id,
          sizeId: size.sizeId,
          name: size.name,
          originalPrice: size.originalPrice,
          stock: size.stock,
        }));
        await ProductSize.bulkCreate(sizeData);
      }

      // Fetch updated product
      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: Image },
          { model: ProductColor },
          { model: ProductSize },
        ],
      });

      // Transform the response to include only imageUrls
      const transformedProduct = {
        ...updatedProduct.toJSON(),
        Images: updatedProduct.Images.map((image) => image.imageUrl),
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
