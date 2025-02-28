// import mongoose from 'mongoose';
// import app from './src/app.js';

// const port = process.env.BACK_PORT || 8080;

// export const startServer = () => {
//   return new Promise((resolve, reject) => {
//     mongoose.connect(process.env.MONGODB_URI,)
//       .then(() => {
//         console.log(`MongoDB connected to ${process.env.MONGODB_URI}`);
//         const server = app.listen(port, () => {
//           console.log(`Listening on PORT ${port}`);
//           resolve(server);
//         });
//       })
//       .catch((error) => {
//         console.error(`Mongoose Connection Error.\nError: ${error.message}`);
//         reject(error);
//       });
//   });
// };

// export const stopServer = (server) => {
//   return new Promise((resolve, reject) => {
//     mongoose.connection.close(() => {
//       server.close((err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   });
// };