// Import Express so we can create a backend server
import express from "express";

// Import CORS so the React frontend can call this backend
import cors from "cors";

// Import dotenv so values from .env are loaded into process.env
import dotenv from "dotenv";

// Import the Google Cloud Vision client library
import vision from "@google-cloud/vision";

// Load environment variables from the .env file
dotenv.config();

// Create the Express app
const app = express();

// Allow requests from your frontend during local development
app.use(cors());

// Allow the backend to read JSON request bodies
app.use(express.json());

// Create a Google Vision client
const client = new vision.ImageAnnotatorClient();

// Create a simple test route so you can check if the backend is running
app.get("/", (req, res) => {
    // Send back a plain message
    res.send("Vision server is running");
});

// Create the route that will analyze an uploaded image
app.post("/analyze", async (req, res) => {
    try {
        // Get the image URL from the frontend request body
        const { imageUrl } = req.body;

        // Validate that the frontend actually sent an image URL
        if (!imageUrl) {
            return res.status(400).json({ error: "Image URL required" });
        }

        // Ask Google Vision to detect labels in the image
        const [result] = await client.labelDetection(imageUrl);

        // Convert the labels into a simpler structure for the frontend
        const labels = (result.labelAnnotations || []).map((item) => ({
            description: item.description,
            score: item.score,
        }));

        // Send the labels back to the frontend
        res.json({ labels });
    } catch (error) {
        // Log the real error in the backend terminal
        console.error("Vision API error:", error);

        // Return a safe error response to the frontend
        res.status(500).json({ error: "Vision API error" });
    }
});

// Start the backend server on port 3001
app.listen(3001, () => {
    // Print a startup message so you know the server is running
    console.log("Vision server running on port 3001");
});