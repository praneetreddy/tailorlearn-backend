const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Mentoro AI Backend is Running 🚀");
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

const response = await axios.post(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    temperature: 0.7,
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);

    res.json({
      reply: response.data.choices[0].message.content,
    });

  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

// Use Render's PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
