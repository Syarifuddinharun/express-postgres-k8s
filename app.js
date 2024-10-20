const express = require("express");
const { Sequelize } = require("sequelize");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (e.g., index.html, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add a timestamp to avoid file name collisions
  },
});

const upload = multer({ storage: storage });

// Ensure the 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Connect to PostgreSQL using Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USER || "user1",
  process.env.DB_PASSWORD || "Qwer@123",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
  }
);

// A simple GET route to test connection
app.get("/api", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send("Connected to PostgreSQL database successfully.");
  } catch (error) {
    res.status(500).send("Unable to connect to the database: " + error.message);
  }
});

// Upload file route
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.status(200).send({
      message: "File uploaded successfully!",
      fileName: req.file.filename,
    });
  } catch (error) {
    res.status(500).send({ message: "File upload failed.", error: error.message });
  }
});

// Download file route
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        res.status(500).send({ message: "File download failed.", error: err.message });
      }
    });
  } else {
    res.status(404).send({ message: "File not found." });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
