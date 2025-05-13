const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizeController");

router.post("/", sizeController.createSize); // Create
router.get("/", sizeController.getAllSizes); // Read all
router.get("/:id", sizeController.getSizeById); // Read one
router.put("/:id", sizeController.updateSize); // Update
router.delete("/:id", sizeController.deleteSize); // Delete

module.exports = router;
