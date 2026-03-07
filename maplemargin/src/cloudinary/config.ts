import { Cloudinary } from '@cloudinary/url-gen';

// Get environment variables - Vite requires VITE_ prefix
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

console.log("cloud name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log("upload preset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

if (!cloudName) {
  throw new Error(
    'VITE_CLOUDINARY_CLOUD_NAME is not set. Please create a .env file with your Cloudinary cloud name.\n' +
    'See .env.example for reference.'
  );
}

// Create and export Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName,
  },
});

// Export upload preset for convenience
export const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
