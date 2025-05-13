const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collectionController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// CRUD Routes
router.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  collectionController.createCollection
);

router.get("/", collectionController.getAllCollections);
router.get("/:id", authMiddleware, collectionController.getCollectionById);

router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 10),
  collectionController.updateCollection
);

router.delete("/:id", authMiddleware, collectionController.deleteCollection);

module.exports = router;
