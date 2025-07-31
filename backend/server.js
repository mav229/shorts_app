const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory store of videos (will reset on each server restart)
let videos = [
  // Example:
  // { id: 1, title: "Sample Video", url: "https://example.com/video.mp4", uploadDate: "2025-07-31" }
];

// Get list of videos (GET /videos)
app.get("/videos", (req, res) => {
  res.json(videos);
});

// Add a new video metadata (POST /videos)
// Body JSON: { title: string, url: string }
app.post("/videos", (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Title and URL are required" });
  }
  const newVideo = {
    id: videos.length + 1,
    title,
    url,
    uploadDate: new Date().toISOString().slice(0, 10)
  };
  videos.push(newVideo);
  res.status(201).json(newVideo);
});

// Simple test route
app.get("/", (req, res) => {
  res.send("Shorts Backend Running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
