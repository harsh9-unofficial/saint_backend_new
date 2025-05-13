const Collection = require("../models/Collection");
const Category = require("../models/Category");
const path = require("path");

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    const images = req.files
      ? req.files.map((file) =>
          path.join("uploads", path.basename(file.path)).replace(/\\/g, "/")
        )
      : [];

    const collection = await Collection.create({ name, categoryId, images });

    res.status(201).json(collection);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating collection", details: error.message });
  }
};

// Get all collections
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      include: [{ model: Category, attributes: ["id", "name"] }],
    });
    res.status(200).json(collections);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching collections", details: error.message });
  }
};

// Get a single collection by ID
exports.getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findByPk(id, {
      include: [{ model: Category, attributes: ["id", "name"] }],
    });
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.status(200).json(collection);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching collection", details: error.message });
  }
};

// Update a collection
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    // Find the collection
    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Validate name
    if (!name) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    // Update fields
    collection.name = name;
    collection.categoryId = categoryId;

    // Update images if new files are uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => {
        // Extract the last two parts: uploads/filename
        const relativePath = path.join("uploads", path.basename(file.path));
        return relativePath;
      });
      collection.images = images;
    }

    // Save the updated collection
    await collection.save();

    res.status(200).json(collection);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating collection", details: error.message });
  }
};

// Delete a collection
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    await collection.destroy();
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting collection", details: error.message });
  }
};
