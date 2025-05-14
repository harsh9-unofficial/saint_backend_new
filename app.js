const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/db");
const { syncDatabase } = require("./models/association");

// Routes
const userRoutes = require("./routes/userRoutes");
const contactUsRoutes = require("./routes/contactUsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const sizeRoutes = require("./routes/sizeRoutes");
const colorRoutes = require("./routes/colorRoutes");
const productRoutes = require("./routes/productRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/users", userRoutes);
app.use("/contacts", contactUsRoutes);
app.use("/categories", categoryRoutes);
app.use("/collections", collectionRoutes);
app.use("/colors", colorRoutes);
app.use("/sizes", sizeRoutes);
app.use("/products", productRoutes);
app.use("/ratings", ratingRoutes);

// Database sync and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to initialize the database:", error);
    process.exit(1);
  }
};

// Run the server
startServer();

module.exports = app;
