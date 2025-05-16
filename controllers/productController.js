const Product = require("../models/Product");
const Image = require("../models/Image");
const Color = require("../models/Color");
const Size = require("../models/Size");
const ProductColor = require("../models/productColor");
const ProductSize = require("../models/ProductSize");
const { Op } = require("sequelize");
const Category = require("../models/Category");
const Collection = require("../models/Collection");

const ProductController = {
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

      if (!name || !basePrice) {
        return res
          .status(400)
          .json({ message: "Name and basePrice are required" });
      }

      const parseIfString = (value) =>
        typeof value === "string" ? JSON.parse(value) : value || [];
      const detailsArray = parseIfString(details);
      const sizeFitArray = parseIfString(sizeFit);
      const materialCareArray = parseIfString(materialCare);
      const shippingReturnArray = parseIfString(shippingReturn);
      const parsedColors = parseIfString(colors);
      const parsedSizes = parseIfString(sizes);

      if (parsedSizes.length > 0) {
        const sizeIds = parsedSizes.map((size) => parseInt(size.sizeId));
        const existingSizes = await Size.findAll({
          where: { id: sizeIds },
          attributes: ["id"],
        });
        const existingSizeIds = new Set(existingSizes.map((size) => size.id));
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

        // Validate size data
        for (const size of parsedSizes) {
          const originalQty = parseInt(size.originalQty);
          if (isNaN(originalQty)) {
            return res.status(400).json({
              message: `originalQty is required for size ${size.name}`,
            });
          }
        }
      }

      const images = req.files
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

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

      if (images.length > 0) {
        const imageData = images.map((url) => ({
          productId: product.id,
          imageUrl: url,
        }));
        await Image.bulkCreate(imageData);
      }

      if (parsedColors.length > 0) {
        const colorData = parsedColors.map((color) => ({
          productId: product.id,
          colorId: parseInt(color.colorId),
          name: color.name,
        }));
        await ProductColor.bulkCreate(colorData);
      }

      if (parsedSizes.length > 0) {
        const sizeData = parsedSizes.map((size) => ({
          productId: product.id,
          sizeId: parseInt(size.sizeId),
          name: size.name,
          originalPrice: parseFloat(size.originalPrice),
          originalQty: parseInt(size.originalQty),
          purchaseQty: 0,
          remainingQty: parseInt(size.originalQty),
        }));
        await ProductSize.bulkCreate(sizeData);
      }

      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Image, as: "Images", attributes: ["imageUrl"] },
          {
            model: ProductColor,
            as: "ProductColors",
            attributes: ["colorId", "name"],
          },
          {
            model: ProductSize,
            as: "ProductSizes",
            attributes: [
              "sizeId",
              "name",
              "originalPrice",
              "originalQty",
              "purchaseQty",
              "remainingQty",
            ],
          },
        ],
      });

      const transformedProduct = {
        ...createdProduct.toJSON(),
        images: createdProduct.Images
          ? createdProduct.Images.map((image) => image.imageUrl)
          : [],
        ProductColors: createdProduct.ProductColors || [],
        ProductSizes: createdProduct.ProductSizes || [],
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

      if (!name || !basePrice) {
        return res
          .status(400)
          .json({ message: "Name and basePrice are required" });
      }

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

      if (images.length > 0) {
        await Image.destroy({ where: { productId: id } });
        const imageData = images.map((url) => ({
          productId: id,
          imageUrl: url,
        }));
        await Image.bulkCreate(imageData);
      }

      if (parsedColors.length > 0) {
        const existingColors = await ProductColor.findAll({
          where: { productId: id },
          attributes: ["id", "colorId", "name"], // Include 'id' here
        });

        const existingColorMap = new Map(
          existingColors.map((color) => [color.colorId, color])
        );

        const colorsToUpdate = [];
        const colorsToCreate = [];
        const colorIdsToKeep = new Set();

        for (const color of parsedColors) {
          const colorId = parseInt(color.colorId);
          const newColor = {
            productId: id,
            colorId,
            name: color.name,
          };
          colorIdsToKeep.add(colorId);

          const existingColor = existingColorMap.get(colorId);
          if (existingColor) {
            if (existingColor.name !== color.name) {
              colorsToUpdate.push({
                ...newColor,
                id: existingColor.id,
              });
            }
          } else {
            colorsToCreate.push(newColor);
          }
        }

        await ProductColor.destroy({
          where: {
            productId: id,
            colorId: { [Op.notIn]: Array.from(colorIdsToKeep) },
          },
        });

        for (const color of colorsToUpdate) {
          await ProductColor.update(
            { name: color.name },
            { where: { id: color.id } }
          );
        }

        if (colorsToCreate.length > 0) {
          await ProductColor.bulkCreate(colorsToCreate);
        }
      }

      if (parsedSizes.length > 0) {
        const sizeIds = parsedSizes.map((size) => parseInt(size.sizeId));
        const existingSizes = await Size.findAll({
          where: { id: sizeIds },
          attributes: ["id"],
        });

        const existingSizeIds = new Set(existingSizes.map((size) => size.id));
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

        // Validate size data
        for (const size of parsedSizes) {
          const originalQty = parseInt(size.originalQty);
          if (isNaN(originalQty)) {
            return res.status(400).json({
              message: `originalQty is required for size ${size.name}`,
            });
          }
        }

        const existingProductSizes = await ProductSize.findAll({
          where: { productId: id },
          attributes: [
            "id",
            "sizeId",
            "name",
            "originalPrice",
            "originalQty",
            "purchaseQty",
            "remainingQty",
          ],
        });

        const existingSizeMap = new Map(
          existingProductSizes.map((size) => [size.sizeId, size])
        );

        const sizesToUpdate = [];
        const sizesToCreate = [];
        const sizeIdsToKeep = new Set();

        for (const size of parsedSizes) {
          const sizeId = parseInt(size.sizeId);
          const existingSize = existingSizeMap.get(sizeId);
          const newOriginalQty = parseInt(size.originalQty);
          const newSize = {
            productId: id,
            sizeId,
            name: size.name,
            originalPrice: parseFloat(size.originalPrice),
            originalQty: newOriginalQty,
            purchaseQty: existingSize ? existingSize.purchaseQty : 0,
            remainingQty: existingSize
              ? newOriginalQty - (existingSize.purchaseQty || 0)
              : newOriginalQty,
          };
          sizeIdsToKeep.add(sizeId);

          if (existingSize) {
            if (
              existingSize.name !== size.name ||
              existingSize.originalPrice !== parseFloat(size.originalPrice) ||
              existingSize.originalQty !== newOriginalQty ||
              existingSize.remainingQty !== newSize.remainingQty
            ) {
              sizesToUpdate.push({
                ...newSize,
                id: existingSize.id,
              });
            }
          } else {
            sizesToCreate.push(newSize);
          }
        }

        await ProductSize.destroy({
          where: {
            productId: id,
            sizeId: { [Op.notIn]: Array.from(sizeIdsToKeep) },
          },
        });

        for (const size of sizesToUpdate) {
          await ProductSize.update(
            {
              name: size.name,
              originalPrice: size.originalPrice,
              originalQty: size.originalQty,
              remainingQty: size.remainingQty,
            },
            { where: { id: size.id } }
          );
        }

        if (sizesToCreate.length > 0) {
          await ProductSize.bulkCreate(sizesToCreate);
        }
      }

      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: Image, as: "Images", attributes: ["imageUrl"] },
          {
            model: ProductColor,
            as: "ProductColors",
            attributes: ["colorId", "name"],
          },
          {
            model: ProductSize,
            as: "ProductSizes",
            attributes: [
              "sizeId",
              "name",
              "originalPrice",
              "originalQty",
              "purchaseQty",
              "remainingQty",
            ],
          },
        ],
      });

      const transformedProduct = {
        ...updatedProduct.toJSON(),
        images: updatedProduct.Images.map((image) => image.imageUrl),
        ProductColors: updatedProduct.ProductColors,
        ProductSizes: updatedProduct.ProductSizes,
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

  async placeOrder(req, res) {
    try {
      const { productId, sizeId, quantity } = req.body;

      if (!productId || !sizeId || !quantity) {
        return res.status(400).json({
          message: "productId, sizeId, and quantity are required",
        });
      }

      const productSize = await ProductSize.findOne({
        where: { productId, sizeId },
      });

      if (!productSize) {
        return res.status(404).json({
          message: "Product size not found",
        });
      }

      const newPurchaseQty = productSize.purchaseQty + parseInt(quantity);
      const newRemainingQty = productSize.originalQty - newPurchaseQty;

      if (newRemainingQty < 0) {
        return res.status(400).json({
          message: `Insufficient stock for size ${productSize.name}. Available: ${productSize.remainingQty}, Requested: ${quantity}`,
        });
      }

      await productSize.update({
        purchaseQty: newPurchaseQty,
        remainingQty: newRemainingQty,
      });

      return res.status(200).json({
        message: "Order placed successfully",
        productSize: {
          sizeId: productSize.sizeId,
          name: productSize.name,
          originalPrice: productSize.originalPrice,
          originalQty: productSize.originalQty,
          purchaseQty: newPurchaseQty,
          remainingQty: newRemainingQty,
        },
      });
    } catch (error) {
      console.error("Error placing order:", error);
      return res
        .status(500)
        .json({ message: "Error placing order", error: error.message });
    }
  },

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
            attributes: [
              "sizeId",
              "name",
              "originalPrice",
              "originalQty",
              "purchaseQty",
              "remainingQty",
            ],
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

      const transformedProducts = products.map((product) => {
        const productJson = product.toJSON();
        return {
          ...productJson,
          images: productJson.Images
            ? productJson.Images.map((image) => image.imageUrl)
            : [],
        };
      });

      return res.status(200).json(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res
        .status(500)
        .json({ message: "Error fetching products", error: error.message });
    }
  },

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
            attributes: [
              "sizeId",
              "name",
              "originalPrice",
              "originalQty",
              "purchaseQty",
              "remainingQty",
            ],
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

      const transformedProduct = {
        ...product.toJSON(),
        images: product.Images.map((image) => image.imageUrl),
        ProductColors: product.ProductColors,
        ProductSizes: product.ProductSizes,
      };

      return res.status(200).json(transformedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res
        .status(500)
        .json({ message: "Error fetching product", error: error.message });
    }
  },

  async deleteProduct(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await Image.destroy({ where: { productId: id } });
      await ProductColor.destroy({ where: { productId: id } });
      await ProductSize.destroy({ where: { productId: id } });

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