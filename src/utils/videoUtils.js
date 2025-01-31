import axios from "axios";
import ytdl from 'ytdl-core';
import ffmpeg from "fluent-ffmpeg";
import { createWriteStream, unlink, mkdir } from "fs";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { decodeHtmlEntities } from "./urlUtils.js";
import BackBlazeB2 from "backblaze-b2";
import fs from 'fs'

const unlinkAsync = promisify(unlink);
const mkdirAsync = promisify(mkdir);
const TEMP_DIR = path.join(process.cwd(), "src", "vidTemp");

const downloadYouTubeVideo = async (url, outputPath) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Fetching video info...");
        const info = await ytdl.getInfo(url);
        console.log("Video info fetched successfully");

        let format = ytdl.chooseFormat(info.formats, {
          quality: "highest",
          filter: "audioandvideo",
        });

        if (!format) {
          console.log("No combined format found, falling back to separate streams");
          format = ytdl.chooseFormat(info.formats, { quality: "137" }); // 1080p video
        }

        console.log("Starting download...");
        const stream = ytdl(url, {
          format: format,
          quality: "highest",
          requestOptions: {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          },
        });

        stream.on("error", (error) => {
          console.error("YouTube download stream error:", error);
          reject(new Error(`YouTube download error: ${error.message}`));
        });

        stream.on("progress", (chunkLength, downloaded, total) => {
          const percent = (downloaded / total) * 100;
          console.log(`Downloading: ${percent.toFixed(2)}%`);
        });

        const writeStream = createWriteStream(outputPath);

        writeStream.on("error", (error) => {
          console.error("File write error:", error);
          reject(new Error(`File write error: ${error.message}`));
        });

        writeStream.on("finish", () => {
          console.log("Download completed successfully");
          resolve(outputPath);
        });

        stream.pipe(writeStream);
      } catch (error) {
        console.error("YouTube download error:", error);
        if (error.message.includes("Could not extract functions")) {
          reject(new Error("YouTube download failed due to internal changes. Please try again later."));
        } else {
          reject(new Error(`YouTube download failed: ${error.message}`));
        }
      }
    });
  };

// Main download and process function


// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    await mkdirAsync(TEMP_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

// Safe file deletion utility
const safeDeleteFile = async (filePath) => {
  try {
    if (filePath) {
      await unlinkAsync(filePath);
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      // Ignore if file doesn't exist
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

// Download video from direct URL
const downloadDirectVideo = async (url, outputPath) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 30000, // 30 seconds timeout
      maxContentLength: 500 * 1024 * 1024, // 500MB max
    });

    return new Promise((resolve, reject) => {
      const writer = createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", () => resolve(outputPath));
      writer.on("error", reject);
    });
  } catch (error) {
    throw new Error(`Direct download error: ${error.message}`);
  }
};

// Process video for optimal streaming
const processVideo = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v h264",
        "-crf 23",
        "-preset medium",
        "-movflags +faststart",
        "-profile:v main",
        "-level 3.1",
        "-c:a aac",
        "-b:a 128k",
        "-ac 2",
        "-ar 44100",
        "-maxrate 2M",
        "-bufsize 4M",
      ])
      .size("?x720")
      .toFormat("mp4")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .save(outputPath);
  });
};



// // Initialize Backblaze B2
const b2 = new BackBlazeB2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID, 
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY, 
});


// // Upload to Backblaze B2
const uploadToBackblaze = async (filePath, folder) => {
  try {
    await b2.authorize(); // Authorize with Backblaze B2

    const response = await b2.getUploadUrl({
      bucketId: process.env.BUCKET_ID,
    });

    const fileData = await fs.promises.readFile(filePath);
    const fileName = `${folder}/${uuidv4()}.mp4`;

    const uploadResponse = await b2.uploadFile({
      uploadUrl: response.data.uploadUrl,
      uploadAuthToken: response.data.authorizationToken,
      fileName,
      data: fileData,
    });

    return {
      url: `https://YOUR_CLOUDFLARE_DOMAIN/${fileName}`, // Replace with your Cloudflare domain
      fileName,
    };
  } catch (error) {
    throw new Error(`Backblaze upload error: ${error.message}`);
  }
};

// Main download and process function
export const downloadAndProcessVideo = async (videoUrl, folder = "movies") => {
  let tempFilePath = null;
  let processedFilePath = null;
  const decodedVideoUrl=decodeHtmlEntities(videoUrl);
  try {
    await ensureTempDir();

    tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_original.mp4`);
    processedFilePath = path.join(TEMP_DIR, `${uuidv4()}_processed.mp4`);

    if (ytdl.validateURL(decodedVideoUrl)) {
      await downloadYouTubeVideo(decodedVideoUrl, tempFilePath);
    } else {
      await downloadDirectVideo(decodedVideoUrl, tempFilePath);
    }

    await processVideo(tempFilePath, processedFilePath);
    const result = await uploadToBackblaze(processedFilePath, folder);

    // await Promise.all([
    //   safeDeleteFile(tempFilePath),
    //   safeDeleteFile(processedFilePath),
    // ]);

    return {
      url: result.url,
      fileName: result.fileName,
    };
  } catch (error) {
    // await Promise.all([
    //   safeDeleteFile(tempFilePath),
    //   safeDeleteFile(processedFilePath),
    // ]);
    throw new Error(`Video processing failed: ${error.message}`);
  }
};
