import {v2 as cloudinary} from "cloudinary";
import sharp from 'sharp'
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export const convertToWebP = async (imageBuffer) => {
  try {
    const webpBuffer = await sharp(imageBuffer)
      .toFormat('webp', { quality: 80 }) // Convert to WebP
      .toBuffer(); // Get the buffer of the converted image
    return webpBuffer;
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    throw error;
  }
};

export const uploadToCloudinary = (imageBuffer, folder = 'profile_pictures') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder, // Optional: specify a folder in Cloudinary
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      )
      .end(imageBuffer); // Pass the image buffer to Cloudinary
  });
};
