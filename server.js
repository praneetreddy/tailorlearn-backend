// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://tailorlearn-frontend.onrender.com", "http://localhost:3000"]
}));
app.use(express.json());

// Health check
app.get("/", (req,res)=>{
    res.send("Mentoro AI Backend is Running 🚀");
});

// --- Chat endpoint ---
app.post("/chat", async (req,res)=>{
    try{
        const { message, interview } = req.body;
        // You can switch to OpenAI or keep using Groq
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model:"llama2-7b", // updated model
                messages:[
                    { role:"system", content: interview ? "You are an expert AI interview coach. Give precise answers focused only on the current interview topic." : "You are an expert teacher who gives structured lessons." },
                    { role:"user", content: message }
                ]
            },
            {
                headers:{
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type":"application/json"
                }
            }
        );
        res.json({ reply: response.data.choices[0].message.content });
    } catch(err){
        console.error(err.response?.data || err.message);
        res.status(500).json({ error:"AI error" });
    }
});

// --- AI Video endpoint ---
app.post("/talk-video", async (req,res)=>{
    try{
        const { text, avatar="male" } = req.body;
        const response = await axios.post(
            "https://api.d-id.com/talks",
            {
                script: { type:"text", input:text },
                voice: "alloy",
                driver: avatar // "male" or "female"
            },
            {
                headers:{
                    "Authorization": `Bearer ${process.env.DID_API_KEY}`,
                    "Content-Type":"application/json"
                }
            }
        );
        res.json({ videoUrl: response.data.url || response.data.result_url });
    } catch(err){
        console.error(err.response?.data || err.message);
        res.status(500).json({ error:"AI video generation failed" });
    }
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});
