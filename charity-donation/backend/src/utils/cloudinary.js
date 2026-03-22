const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - Cloudinary folder (e.g., "HopeFund/projects")
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadImage(fileBuffer, folder = "HopeFund") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = { uploadImage, cloudinary };
