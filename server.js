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

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an expert teacher who gives structured lessons."
          },
          {
            role: "user",
            content: message
          }
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
    console.error(error);
    res.status(500).json({ error: "AI error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
