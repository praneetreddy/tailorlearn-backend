import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: "https://tailorlearn-frontend.onrender.com"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Mentoro AI Backend is Running 🚀");
});

// Create video clip with D-ID V3 Pro
app.post("/talk-video", async (req, res) => {
  try {
    const { message, presenter } = req.body;

    const response = await axios.post(
      "https://api.d-id.com/clips",
      {
        presenter_id: presenter, // e.g., "v2_public_Amber@0zSz8kflCN"
        script: {
          type: "text",
          input: message
        }
      },
      {
        headers: {
          "Authorization": `Basic ${process.env.DID_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Return clip id to frontend
    res.json({ clip_id: response.data.id });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "AI video generation failed" });
  }
});

// Check status of clip and get video URL
app.get("/clip/:id", async (req, res) => {
  try {
    const clipId = req.params.id;

    const response = await axios.get(
      `https://api.d-id.com/clips/${clipId}`,
      {
        headers: {
          "Authorization": `Basic ${process.env.DID_API_KEY}`,
        }
      }
    );

    // Send status + video URL if ready
    res.json({
      status: response.data.status,
      url: response.data.output_url || null
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch clip status" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
