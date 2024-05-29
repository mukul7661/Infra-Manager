// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import deploymentReducer from "./slices/deploymentSlice";
// import socketMiddleware from "./middleware/socketMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    deployments: deploymentReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
