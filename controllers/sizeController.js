const Size = require('../models/Size');

// Create a new size
exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const size = await Size.create({ name });
    res.status(201).json(size);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Size name must be unique' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all sizes
exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll();
    res.status(200).json(sizes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single size by ID
exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }
    res.status(200).json(size);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a size
exports.updateSize = async (req, res) => {
  try {
    const { name } = req.body;
    const size = await Size.findByPk(req.params.id);
    
    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    await size.update({ name });
    res.status(200).json(size);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Size name must be unique' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a size
exports.deleteSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (!size) {
      return res.status(404).json({ error: 'Size not found' });
    }
    
    await size.destroy();
    res.status(204).json({});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};