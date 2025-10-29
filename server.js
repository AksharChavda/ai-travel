// --- Imports ---
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ correct import for Gemini
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Setup ---
dotenv.config();
const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Config ---
const PORT = process.env.PORT || 3001;

// ✅ Allow your deployed frontend on Vercel
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://ai-travel2.vercel.app";

// ✅ Load Gemini API key from .env
const GEMINI_API_KEY = process.env.VITE_GOOGLE_GEMINI_AI_API_KEY;

// --- Validations ---
if (!GEMINI_API_KEY) {
  console.error("❌ Missing VITE_GOOGLE_GEMINI_AI_API_KEY in .env file");
  process.exit(1);
}

// --- Middleware ---
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// --- Initialize Gemini AI ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- API Endpoint ---
app.post("/api/generate-trip", async (req, res) => {
  const { finalPrompt } = req.body;

  if (!finalPrompt) {
    return res.status(400).json({ error: "Missing finalPrompt in request body." });
  }

  try {
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();
    res.status(200).json({ tripPlan: responseText });
  } catch (error) {
    console.error("❌ AI Generation Error:", error.message);
    res.status(500).json({
      error: "AI service failed to generate a plan.",
      details: error.message,
    });
  }
});

// --- Optional: Serve frontend (only if you want Render to host it too) ---
app.use(express.static(path.join(__dirname, "dist")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS configured for ${CLIENT_ORIGIN}`);
});
