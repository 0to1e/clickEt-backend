import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

export const app = express();

const corsOptions = {
  origin: [`http://localhost${process.env.FRONTPORT}`],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true,
  // maxAge: 3600, // Maximum age of the preflight request cache
};
const apiVersion = "/api/v1";

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

import userRoute from "./routes/userRoute.js";
import moviesRoute from "./routes/movieRoute.js";
import distributorRoute from "./routes/distributorsRoute.js";
import theatreRoute from "./routes/theatreRoute.js";

app.use(`${apiVersion}/auth`, userRoute);
app.use(`${apiVersion}/movie`, moviesRoute);
app.use(`${apiVersion}/distributor`, distributorRoute);
app.use(`${apiVersion}/theatre`, theatreRoute);
