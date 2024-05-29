// // redux/middleware/socketMiddleware.ts
// import { Middleware } from "@reduxjs/toolkit";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const socketMiddleware: Middleware = (storeAPI) => {
//   socket.on("deploymentStatus", (deployment) => {
//     console.log("Deployment status updated:", deployment);
//   });

//   return (next) => (action) => {
//     return next(action);
//   };
// };

// export default socketMiddleware;
