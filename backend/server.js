const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer config for storing uploaded video files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // Max 100MB files
  fileFilter: function (req, file, cb) {
    const allowed = /mp4|webm|ogg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only video files allowed!"));
    }
  }
}).single("video");

// In-memory video metadata store (reset each restart)
let videos = [];

// Get all videos
app.get("/videos", (req, res) => {
  res.json(videos);
});

// Add video via URL (optional)
app.post("/videos", (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Title and URL required" });
  }
  videos.push({
    id: videos.length + 1,
    title,
    url,
    uploadDate: new Date().toISOString().slice(0, 10),
  });
  res.status(201).json({ message: "Video added" });
});

// Upload video file endpoint
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file selected" });

    const videoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    videos.push({
      id: videos.length + 1,
      title: req.body.title || req.file.originalname,
      url: videoUrl,
      uploadDate: new Date().toISOString().slice(0, 10),
    });
    res.status(201).json({ message: "Video uploaded", url: videoUrl });
  });
});

// Serve uploaded videos statically
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => res.send("Shorts Backend Running"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
