const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const Image = require("../models/Image");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        message: "userId, productId, and a valid quantity are required",
      });
    }

    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res
        .status(200)
        .json({ message: "Cart updated", cartItem: existingCartItem });
    }

    const newCartItem = await Cart.create({ userId, productId, quantity });

    res
      .status(201)
      .json({ message: "Item added to cart", cartItem: newCartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "Product",
          attributes: ["id", "name", "basePrice"],
          include: [
            {
              model: Image,
              as: "Images",
              attributes: ["imageUrl"],
            },
            {
              model: ProductColor,
              as: "ProductColors",
              attributes: ["colorId", "name"],
            },
            {
              model: ProductSize,
              as: "ProductSizes",
              attributes: ["sizeId", "name", "originalPrice", "stock"],
            },
          ],
        },
      ],
    });

    const parsedCartItems = cartItems.map((item) => {
      const itemData = item.toJSON();
      const product = itemData.Product || {};

      const images = product.Images
        ? product.Images.map((image) => image.imageUrl)
        : [];

      return {
        cartId: itemData.cartId,
        userId: itemData.userId,
        productId: itemData.productId,
        quantity: itemData.quantity,
        product: {
          id: product.id || null,
          name: product.name || null,
          basePrice: product.basePrice || null,
          images,
          colors: product.ProductColors || [],
          sizes: product.ProductSizes || [],
        },
      };
    });

    res.status(200).json({
      message: "Cart retrieved successfully",
      cartItems: parsedCartItems,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving cart", error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cartItem = await Cart.findByPk(cartId, {
      include: [
        {
          model: Product,
          as: "Product",
          attributes: ["id", "name"],
          include: [
            {
              model: Image,
              as: "Images",
              attributes: ["imageUrl"],
            },
          ],
        },
      ],
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.status(200).json({ message: "Cart item removed" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const itemData = cartItem.toJSON();
    const images = itemData.Product?.Images
      ? itemData.Product.Images.map((image) => image.imageUrl)
      : [];

    const transformedCartItem = {
      cartId: itemData.cartId,
      userId: itemData.userId,
      productId: itemData.productId,
      quantity: itemData.quantity,
      product: {
        id: itemData.Product?.id || null,
        name: itemData.Product?.name || null,
        images,
      },
    };

    res
      .status(200)
      .json({ message: "Cart item updated", cartItem: transformedCartItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await Cart.findByPk(cartId);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting cart item", error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCart, removeCartItem };
