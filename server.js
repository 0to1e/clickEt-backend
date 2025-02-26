import mongoose from "mongoose";
import app from "./src/app.js";

const port = process.env.BACK_PORT || 8080;

mongoose
  .connect("mongodb://localhost:27017/bookEt")
  .then(() => {
    console.log("MongoDB connected");
    const server = app.listen(port, () => {
      console.log(`Listening on PORT ${port}`);
    });
    app.set("server", server);
  })
  .catch((error) => {
    console.error(`Mongoose Connection Error.\nError: ${error.message}`);
  });
