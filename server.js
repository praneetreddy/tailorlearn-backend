import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

// Allow requests from your frontend
app.use(cors({
  origin: "https://tailorlearn-frontend.onrender.com"
}));
app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.send("Mentoro AI Backend is Running 🚀");
});

/* -----------------------------
   Create AI Video Clip
-------------------------------*/
app.post("/talk-video", async (req, res) => {
  try {
    const { message, presenter } = req.body;

    // Call D-ID API to create video
    const response = await axios.post(
      "https://api.d-id.com/clips",
      {
        presenter_id: presenter,
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

    // Return clip ID for frontend polling
    res.json({ clip_id: response.data.id });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "AI video generation failed" });
  }
});

/* -----------------------------
   Poll Video Status
-------------------------------*/
app.get("/clip/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const response = await axios.get(
      `https://api.d-id.com/clips/${id}`,
      {
        headers: {
          "Authorization": `Basic ${process.env.DID_API_KEY}`
        }
      }
    );

    if (response.data.output_url) {
      return res.json({ status: "succeeded", url: response.data.output_url });
    }

    return res.json({ status: response.data.status });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch video status" });
  }
});

/* -----------------------------
   Start Server
-------------------------------*/
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
