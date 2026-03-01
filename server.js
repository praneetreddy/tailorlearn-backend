// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

// Allow your frontend
app.use(cors({
  origin: "https://tailorlearn-frontend.onrender.com" // update if different
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Mentoro AI Backend is Running 🚀");
});

/* ----------------------
   Chat endpoint
---------------------- */
app.post("/chat", async (req, res) => {
  try {
    const { message, interview=false } = req.body;

    // Call AI model
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama2-70b-chat", // updated model
        messages: [
          { role:"system", content:"You are an expert tutor who gives structured lessons." },
          { role:"user", content: message }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "AI error" });
  }
});

/* ----------------------
   AI Video endpoint (D-ID)
---------------------- */
app.post("/talk-video", async (req, res) => {
  try {
    const { text, avatar="male" } = req.body;

    const response = await axios.post(
      "https://api.d-id.com/talks",
      {
        script: { type: "text", input: text },
        driver: { type: "d-id", face: avatar },
        config: { resolution: "720p" }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DID_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ videoUrl: response.data.result_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "AI Video error" });
  }
});

// Start server on Render assigned port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
