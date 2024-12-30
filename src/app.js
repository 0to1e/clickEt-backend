// src/app.js
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import loggingMiddleware from "./middleware/utils/loggingMiddleware.js";
export const app = express();

const corsOptions = {
  origin: [`${process.env.FRONT_PORT}`],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  // maxAge: 3600, // Maximum age of the preflight request cache
};
const apiVersion = "/api/v1";

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(loggingMiddleware);

import userRoute from "./routes/userRoute.js";
import moviesRoute from "./routes/movieRoute.js";
import distributorRoute from "./routes/distributorsRoute.js";
import theatreRoute from "./routes/theatreRoute.js";

app.use(`${apiVersion}/auth`, userRoute);
app.use(`${apiVersion}/movie`, moviesRoute);
app.use(`${apiVersion}/distributor`, distributorRoute);
app.use(`${apiVersion}/theatre`, theatreRoute);
