import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

app.use(cors({
  origin: "https://tailorlearn-frontend.onrender.com"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Mentoro AI Backend is Running 🚀");
});

// Create a video clip
app.post("/talk-video", async (req, res) => {
  try {
    const { message, presenter } = req.body;

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
          "Authorization": `Basic ${process.env.DID_API_KEY}`, // IMPORTANT: Basic auth
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ clip_id: response.data.id });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "AI video generation failed" });
  }
});

// Poll video status
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
