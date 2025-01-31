import ytdl from 'ytdl-core';
import { createWriteStream, unlink, mkdir } from "fs";

export const downloadYouTubeVideo = async (url, outputPath) => {
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




// Download video from direct URL
export const downloadDirectVideo = async (url, outputPath) => {
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