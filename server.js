// server.js (ES Module Version)

// 🚨 CRITICAL IMPORTS: Using ES Module syntax (import) because your package.json has "type": "module"
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors'; // Import the CORS middleware

// Load environment variables from .env file immediately
dotenv.config();

// --- Configuration ---
const PORT = 3001; 
const CLIENT_ORIGIN = 'http://localhost:5173'; // Your Vite development server URL

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.VITE_GOOGLE_GEMINI_AI_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: VITE_GOOGLE_GEMINI_AI_API_KEY is not set in environment variables.");
    console.error("Please check your .env file in the root directory.");
    process.exit(1); 
}

// --- Express Setup ---
const app = express();

// 🚨 CORS FIX: Configure CORS to allow requests from your specific Vite client origin
const corsOptions = {
    origin: CLIENT_ORIGIN,
    methods: ['POST'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Initialize the AI model
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- API Route ---
app.post('/api/generate-trip', async (req, res) => {
    
    const { finalPrompt } = req.body;

    if (!finalPrompt) {
        return res.status(400).json({ error: 'Missing finalPrompt in request body.' });
    }
    
    console.log("Received prompt on server. Generating response...");

    try {
        const config = {
            // Tool use is now removed to fix the error.
            responseMimeType: "application/json", 
        };
        
        const response = await ai.models.generateContent({ 
            model: 'gemini-flash-latest',
            contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
            config: config,
        });
        
        const responseText = response?.text;

        // Send the raw JSON text back to the client
        res.status(200).json({ tripPlan: responseText });

    } catch (error) {
        console.error("AI Generation Error:", error.message);
        // Log the error and send a generic 500 status back to the client
        res.status(500).json({ 
            error: 'AI service failed to generate a plan.', 
            details: error.message 
        });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`\n✅ Server listening securely on http://localhost:${PORT}`);
    console.log(`Backend API Key loaded successfully.`);
    console.log(`CORS is configured to allow requests from ${CLIENT_ORIGIN}`);
});