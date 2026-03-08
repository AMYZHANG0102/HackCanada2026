// Import Express so we can create backend routes
import express from "express";

// Import CORS so your React frontend can call this backend
import cors from "cors";

// Import dotenv so values from .env are loaded into process.env
import dotenv from "dotenv";

// Import Google Cloud Vision so the backend can analyze uploaded images
import vision from "@google-cloud/vision";

import { GoogleGenAI } from "@google/genai";

// Load environment variables from the .env file
dotenv.config();

// Create the Express app
const app = express();

// Allow requests from your frontend during development
app.use(cors());

// Allow the backend to read JSON request bodies
app.use(express.json());



// Create the Google Vision client
const visionClient = new vision.ImageAnnotatorClient();

const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});



// Analyze the uploaded image with Vision and return a short summary
async function analyzeImageWithVision(imageUrl) {
    // Ask Vision to detect labels in the uploaded image
    const [result] = await visionClient.labelDetection(imageUrl);

    // Convert the labels into a simpler format
    const labels = (result.labelAnnotations || []).map((item) => ({
        description: item.description,
        score: item.score,
    }));

    // Return the simplified labels
    return labels;
}

// Convert the selected frontend prompt into a stronger backend prompt
function buildEnhancedPrompt(userPrompt, labels = []) {
    // Turn Vision labels into a readable string for debugging or prompt building
    const labelText = labels.map((label) => label.description).join(", ");

    // Handle the futuristic neon prompt
    if (userPrompt === "Transform this graph into a futuristic neon-style visualization") {
        return `Transform the uploaded graph into a futuristic neon-style visualization. Preserve the graph structure and key layout. Use glowing cyan and magenta tones, dark background, high contrast, and a polished sci-fi dashboard look. Detected visual context: ${labelText}`;
    }

    // Handle the 3D holographic dashboard prompt
    if (userPrompt === "Convert this graph into a 3D holographic dashboard display") {
        return `Convert the uploaded graph into a 3D holographic dashboard display. Preserve the graph structure and make it look like a floating futuristic data interface with blue holographic glow and depth. Detected visual context: ${labelText}`;
    }

    // Handle the infographic prompt
    if (userPrompt === "Turn this graph into a modern infographic illustration") {
        return `Turn the uploaded graph into a modern infographic illustration. Preserve the core graph meaning and layout while redesigning it with clean typography, strong readability, polished layout, and presentation-ready visual styling. Detected visual context: ${labelText}`;
    }

    // Fallback for any future prompt
    return `${userPrompt}. Detected visual context: ${labelText}`;
}

/* =========================================================
   ROUTES
========================================================= */

// Simple test route so you can check if the backend is running
app.get("/", (req, res) => {
    // Send back a plain message
    res.send("Vision server is running");
});

// Route that analyzes the uploaded image with Google Vision
app.post("/analyze", async (req, res) => {
    try {
        // Get the image URL from the frontend request body
        const { imageUrl } = req.body;

        // Validate that the frontend sent an image URL
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL required" });
        }

        // Analyze the uploaded image with Vision
        const labels = await analyzeImageWithVision(imageUrl);

        // Return the Vision labels to the frontend
        res.json({ labels });
    } catch (error) {
        // Log the real backend error
        console.error("Vision API error:", error);

        // Return a safe error message to the frontend
        res.status(500).json({ error: "Vision API error" });
    }
});

// Route that will later call Google image generation
app.post("/generate-image", async (req, res) => {
    try {
        // Read the uploaded image URL and selected prompt from the frontend
        const { imageUrl, prompt } = req.body;

        // Validate required input
        if (!imageUrl || !prompt) {
            return res.status(400).json({ error: "imageUrl and prompt are required" });
        }

        // First analyze the uploaded image using Vision
        const labels = await analyzeImageWithVision(imageUrl);

        // Build a stronger final prompt for the future image generation model
        const enhancedPrompt = buildEnhancedPrompt(prompt, labels);

        // Print debugging info in the backend terminal
        console.log("Original prompt:", prompt);
        console.log("Enhanced prompt:", enhancedPrompt);
        console.log("Image URL:", imageUrl);

        // Ask Gemini to generate a transformed image based on the enhanced prompt
        const response = await genAI.models.generateContent({
            // Use Google's lighter image-generation preview model
            model: "gemini-3.1-flash-image-preview",

            // Send the enhanced prompt as the content
            contents: enhancedPrompt,
        });

        // Look through the returned parts and find the generated image bytes
        const imagePart = response.candidates?.[0]?.content?.parts?.find(
            (part) => part.inlineData && part.inlineData.mimeType?.startsWith("image/")
        );

        // Stop if Gemini did not return an image
        if (!imagePart?.inlineData?.data) {
            return res.status(500).json({ error: "No image returned by Gemini" });
        }

        // Build a browser-displayable data URL from the base64 image bytes
        const generatedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

        res.json({
            generatedImageUrl,
            enhancedPrompt,
            labels,
        });

    } catch (error) {
        // Log backend errors
        console.error("Image generation error:", error);

        // Return safe error message
        res.status(500).json({ error: "Image generation failed" });
    }
});

/* =========================================================
   SERVER START
========================================================= */

// Start the backend server on port 3001
app.listen(3001, () => {
    // Print a startup message so you know the backend is running
    console.log("Vision server running on port 3001");
});