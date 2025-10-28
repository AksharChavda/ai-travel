// This is the functional code you should be using in your React component
// (e.g., inside the generateTrip function in CreateTrips.jsx)

import { GoogleGenAI } from '@google/genai';

// Assume you have a state to store the session:
// const [chatSession, setChatSession] = useState(null); 
// const [streamedContent, setStreamedContent] = useState('');

async function generateTripPlan(prompt) {
    // 1. Setup
    const ai = new GoogleGenAI({ 
        apiKey: import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY 
    });
    
    // 2. Configuration (includes JSON requirement)
    const config = {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        // Other config as needed
    };
    
    // 3. Start the Chat Session (The CRITICAL FIX)
    const modelName = 'gemini-flash-latest';
    // 🚨 FIX: Must use the 'ai.chats.create' method for @google/genai
    const newSession = await ai.chats.create({ 
        model: modelName,
        config: config,
        history: [], // Start with empty history for the first turn
    });
    
    // 4. Save the session object to state (if using React)
    // setChatSession(newSession); 

    // 5. Send the prompt via the session object and stream the response
    // The payload structure below is correct for the new SDK, resolving the ContentUnion error.
    const response = await newSession.sendMessageStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    // 6. Process the stream and update your UI state
    let fullResponse = '';
    for await (const chunk of response) {
        fullResponse += chunk.text;
        // console.log(chunk.text); // update streamedContent state in React
    }
    // Return the full content if not updating state chunk-by-chunk
    return fullResponse;
}