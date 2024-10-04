const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single("image");

const processImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const name = req.file.originalname.split(".")[0].split(" ").join("_");

  const fileName = name + Date.now() + ".webp";
  const outputPath = path.join("images", `${fileName}`);

  sharp(req.file.buffer)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      req.savedImage = fileName;
      next();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error processing image.");
    });
};

module.exports = { upload, processImage };
