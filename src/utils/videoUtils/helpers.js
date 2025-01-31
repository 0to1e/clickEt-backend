import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const unlinkAsync = promisify(unlink);
const mkdirAsync = promisify(mkdir);
const TEMP_DIR = path.join(process.cwd(), "src", "vidTemp");

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
