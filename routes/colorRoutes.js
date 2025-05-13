const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

router.post("/", colorController.createColor); // Create
router.get("/", colorController.getAllColors); // Read all
router.get("/:id", colorController.getColorById); // Read one
router.put("/:id", colorController.updateColor); // Update
router.delete("/:id", colorController.deleteColor); // Delete

module.exports = router;
