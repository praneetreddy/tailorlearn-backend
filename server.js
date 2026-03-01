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

/* ------------------------
  Chat endpoint
---------------------------*/
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are an expert teacher giving structured lessons." },
          { role: "user", content: message }
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
    console.error(error.response?.data || error);
    res.status(500).json({ error: "AI error" });
  }
});

/* ------------------------
  Talk-to-AI Video endpoint
---------------------------*/
app.post("/talk-video", async (req, res) => {
  try {
    const { text, avatar } = req.body;

    if(!text) return res.status(400).json({ error: "Text is required" });

    // Call D-ID API to generate talking head
    const response = await axios.post(
      "https://api.d-id.com/talks",
      {
        script: { type: "text", input: text },
        voice: "alloy",
        driver: avatar === "female" ? "female" : "male"
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DID_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Return talk ID immediately
    const talkId = response.data.id;
    res.json({ talkId });

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: "AI video generation failed" });
  }
});

/* ------------------------
  Polling endpoint to check video status
---------------------------*/
app.get("/talk-video/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.d-id.com/talks/${id}`, {
      headers: { "Authorization": `Bearer ${process.env.DID_API_KEY}` }
    });

    if(response.data.status === "done") {
      res.json({ videoUrl: response.data.result_url });
    } else if(response.data.status === "failed") {
      res.status(500).json({ error: "Video generation failed" });
    } else {
      res.json({ status: response.data.status }); // pending
    }

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: "Failed to fetch video status" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
