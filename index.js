import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import {config} from 'dotenv';

config();
const app = express();
const PORT = 5000;

// Middleware
// app.use(cors());

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  };
  
app.use(cors(corsOptions));

app.use(express.json());

// Koneksi ke MongoDB
const MONGO_URI = process.env.MONGODB_URI; // Ganti sesuai dengan konfigurasi Anda
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Skema dan Model Mongoose
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// Endpoint untuk mendapatkan semua ucapan
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Endpoint untuk menambahkan ucapan baru
app.post("/api/messages", async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Name and message are required!" });
  }

  try {
    const newMessage = new Message({ name, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Endpoint untuk menghapus semua ucapan
app.delete("/api/messages", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ message: "All messages have been deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
