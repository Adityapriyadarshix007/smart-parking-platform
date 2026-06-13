// Cloudinary configuration for image uploads
// Get free API keys from cloudinary.com

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
};

const isCloudinaryAvailable = () => {
  return !!(cloudinaryConfig.cloud_name && cloudinaryConfig.api_key);
};

module.exports = { cloudinaryConfig, isCloudinaryAvailable };
