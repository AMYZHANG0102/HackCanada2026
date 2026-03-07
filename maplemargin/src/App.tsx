import { useState } from 'react';
import { AdvancedImage, placeholder, lazyload } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { cld, uploadPreset } from './cloudinary/config';
import { UploadWidget } from './cloudinary/UploadWidget';
import type { CloudinaryUploadResult } from './cloudinary/UploadWidget';
import './App.css';

// Check if the Cloudinary upload preset exists
const hasUploadPreset = Boolean(uploadPreset);

// Prompts for the lower "copy and paste" assistant section
const PROMPTS_WITH_UPLOAD = [
  'Create an image gallery with lazy loading and responsive images',
  'Create a video player that plays a Cloudinary video',
  'Add image overlays with text or logos',
];

// Fallback prompts if upload is not configured
const PROMPTS_WITHOUT_UPLOAD = [
  "Let's try uploading — help me add an upload preset and upload widget",
  ...PROMPTS_WITH_UPLOAD,
];

// Prompts used for image generation/modification
const IMAGE_PROMPTS = [
  'Generate a 3d graph of the graph',
  'Convert this graph into an interactive chart with labeled axes',
  'Generate a heatmap visualization of the graph data',
];

function App() {
  // Store copied prompt ids for the lower assistant prompt list
  const [clickedIds, setClickedIds] = useState(new Set<number>());

  // Store the uploaded Cloudinary public id
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);

  // Store the uploaded Cloudinary secure URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Store the prompt selected by the user
  const [selectedPrompt, setSelectedPrompt] = useState<string>('Make it cinematic');

  // Store the generated image URL returned by the backend
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Store whether the app is currently generating an image
  const [isGenerating, setIsGenerating] = useState(false);

  // Runs after a successful Cloudinary upload
  const handleUploadSuccess = async (result: CloudinaryUploadResult) => {
    // Print upload result for debugging
    console.log('Upload successful:', result);

    // Save Cloudinary public id so the original image can be displayed
    setUploadedImageId(result.public_id);

    // Save Cloudinary secure URL so it can be sent to backend services
    setUploadedImageUrl(result.secure_url);

    try {
      // Send the uploaded image URL to the Vision backend
      const response = await fetch('http://localhost:3001/analyze', {
        // Use POST because data is being sent to the server
        method: 'POST',

        // Tell the backend that the request body is JSON
        headers: {
          'Content-Type': 'application/json',
        },

        // Send the image URL to the backend
        body: JSON.stringify({
          imageUrl: result.secure_url,
        }),
      });

      // Convert backend response into JSON
      const data = await response.json();

      // Print Vision results in the browser console
      console.log('Vision result:', data);
    } catch (error) {
      // Print backend/Vision errors
      console.error('Vision request failed:', error);
    }
  };

  // Runs when the upload widget reports an error
  const handleUploadError = (error: Error) => {
    // Print error in browser console
    console.error('Upload error:', error);

    // Show simple error alert to the user
    alert(`Upload failed: ${error.message}`);
  };

  // Copies one of the lower assistant prompts to the clipboard
  const copyPrompt = (text: string, id: number) => {
    // Write the prompt text to the clipboard
    void navigator.clipboard.writeText(text).then(() => {
      // Mark the clicked prompt as selected briefly
      setClickedIds((prev) => new Set(prev).add(id));

      // Remove the clicked style after 2 seconds
      setTimeout(() => {
        setClickedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    });
  };

  // Calls the backend image-generation route
  const handleGenerateImage = async () => {
    // Stop if the user has not uploaded an image yet
    if (!uploadedImageUrl) {
      alert('Please upload an image first.');
      return;
    }

    // Turn on loading state
    setIsGenerating(true);

    try {
      // Print request data for debugging
      console.log('Generate image with:', {
        imageUrl: uploadedImageUrl,
        prompt: selectedPrompt,
      });

      // Send the uploaded image URL and selected prompt to the backend
      const response = await fetch('http://localhost:3001/generate-image', {
        // Use POST because data is being sent to the server
        method: 'POST',

        // Tell the backend that the request body is JSON
        headers: {
          'Content-Type': 'application/json',
        },

        // Send the image URL and prompt to the backend
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          prompt: selectedPrompt,
        }),
      });

      // Convert backend response into JSON
      const data = await response.json();

      // If the backend returned an error, stop and throw it
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // Save the generated image URL so the lower box can display it
      setGeneratedImageUrl(data.generatedImageUrl);
    } catch (error) {
      // Print image-generation errors
      console.error('Generate image error:', error);
    } finally {
      // Turn off loading state
      setIsGenerating(false);
    }
  };

  // Use the uploaded image if available, otherwise fall back to a sample image
  const imageId = uploadedImageId || 'samples/people/bicycle';

  // Build the original display image using Cloudinary transformations
  const displayImage = cld
    .image(imageId)
    .resize(fill().width(600).height(400).gravity(autoGravity()))
    .delivery(format(auto()))
    .delivery(quality(autoQuality()));

  return (
    <div className="app">
      <main className="main-content">
        <h1>Cloudinary React Starter Kit</h1>
        <p>This is a ready-to-use development environment with Cloudinary integration.</p>

        {hasUploadPreset && (
          <div className="upload-section">
            <h2>Upload an Image</h2>
            <UploadWidget
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              buttonText="Upload Image"
            />
          </div>
        )}

        <div className="image-section">
          <h2>Display Image</h2>
          <AdvancedImage
            cldImg={displayImage}
            plugins={[placeholder({ mode: 'blur' }), lazyload()]}
            alt={uploadedImageId ? 'Your uploaded image' : 'Sample image'}
            className="display-image"
          />
          {uploadedImageId && (
            <p className="image-info">Public ID: {uploadedImageId}</p>
          )}
        </div>

        <div className="ai-prompts-section">
          <h2>Select a Prompt</h2>

          <div className="prompts-list">
            {IMAGE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                className={selectedPrompt === prompt ? 'clicked' : ''}
              >
                {prompt}
              </button>
            ))}
          </div>

          <p className="prompts-intro">
            Selected prompt: <strong>{selectedPrompt}</strong>
          </p>

          <button onClick={handleGenerateImage} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Modified Image'}
          </button>
        </div>

        <div className="image-section">
          <h2>Generated / Modified Image</h2>

          {generatedImageUrl ? (
            <img
              src={generatedImageUrl}
              alt="Generated result"
              className="display-image"
            />
          ) : (
            <p className="image-info">
              No generated image yet. Upload an image, choose a prompt, and click Generate.
            </p>
          )}
        </div>

        <div className="ai-prompts-section">
          <h2>🤖 Try Asking Your AI Assistant</h2>
          <p className="prompts-intro">
            <strong>Copy and paste</strong> one of these prompts into your AI assistant:
          </p>

          <ul className="prompts-list">
            {(hasUploadPreset ? PROMPTS_WITH_UPLOAD : PROMPTS_WITHOUT_UPLOAD).map((text, i) => (
              <li
                key={i}
                onClick={() => copyPrompt(text, i)}
                title="Click to copy"
                className={clickedIds.has(i) ? 'clicked' : ''}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;