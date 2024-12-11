import mongoose from "mongoose";
import {app} from './src/app.js'

try {
  mongoose.connect("mongodb://localhost:27017/bookEt").then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening on PORT ${process.env.PORT}`);
    });
  });
} catch (error) {
  console.error(`Mongoose Connection Error.\nError:${error.message}`);
}
