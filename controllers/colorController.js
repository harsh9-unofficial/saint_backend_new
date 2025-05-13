const Color = require("../models/Color");

// Create a new color
exports.createColor = async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!hexCode) {
      return res.status(400).json({ error: "Hex code is required" });
    }
    if (!/^#[0-9A-F]{6}$/i.test(hexCode)) {
      return res.status(400).json({ error: "Invalid hex code format" });
    }

    const color = await Color.create({ name, hexCode });
    res.status(201).json(color);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Color name must be unique" });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Invalid hex code format" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Get all colors
exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.findAll();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single color by ID
exports.getColorById = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }
    res.status(200).json(color);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update a color
exports.updateColor = async (req, res) => {
  try {
    const { name, hexCode } = req.body;
    const color = await Color.findByPk(req.params.id);

    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!hexCode) {
      return res.status(400).json({ error: "Hex code is required" });
    }
    if (!/^#[0-9A-F]{6}$/i.test(hexCode)) {
      return res.status(400).json({ error: "Invalid hex code format" });
    }

    await color.update({ name, hexCode });
    res.status(200).json(color);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Color name must be unique" });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Invalid hex code format" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a color
exports.deleteColor = async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ error: "Color not found" });
    }

    await color.destroy();
    res.status(204).json({});
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};