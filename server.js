// server.js (Production-ready version for Render Deployment)

// --- Imports ---
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Setup ---
dotenv.config();

const app = express();

// Use correct path handling for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Config ---
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const GEMINI_API_KEY = process.env.VITE_GOOGLE_GEMINI_AI_API_KEY;

// --- Validations ---
if (!GEMINI_API_KEY) {
  console.error("❌ Missing VITE_GOOGLE_GEMINI_AI_API_KEY in .env");
  process.exit(1);
}

// --- Middleware ---
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

// --- Initialize AI model ---
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- API Endpoint ---
app.post("/api/generate-trip", async (req, res) => {
  const { finalPrompt } = req.body;

  if (!finalPrompt) {
    return res.status(400).json({ error: "Missing finalPrompt in request body." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const responseText = response?.text;
    res.status(200).json({ tripPlan: responseText });
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    res.status(500).json({
      error: "AI service failed to generate a plan.",
      details: error.message,
    });
  }
});

// --- Serve React Frontend (Vite Build) ---
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`CORS configured for ${CLIENT_ORIGIN}`);
});
