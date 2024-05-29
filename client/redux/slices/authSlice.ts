// redux/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { serialize } from "cookie";

interface AuthState {
  user: any;
  isUserLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isUserLoggedIn: false,
  status: "idle",
  error: null,
};

export const checkTokenValidity = createAsyncThunk(
  "auth/checkTokenValidity",
  async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      credentials,
      { withCredentials: true }
    );
    return response.data;
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData: { username: string; email: string; password: string }) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
      userData
    );
    return response.data;
  }
);

function delete_cookie(name: string) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isUserLoggedIn = false;
      // const cookieValue = serialize("token-scoutflo", "", {
      //   // httpOnly: true,
      //   maxAge: 30 * 60 * 60 * 24,
      //   path: "/",
      // domain: ".mukulyadav.com",
      // });

      // document.cookie = cookieValue;
      delete_cookie("token-scoutflo");
    },
    setUserLoggedIn: (state) => {
      state.isUserLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isUserLoggedIn = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(checkTokenValidity.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkTokenValidity.fulfilled, (state) => {
        state.status = "succeeded";
        state.isUserLoggedIn = true;
      })
      .addCase(checkTokenValidity.rejected, (state) => {
        state.status = "failed";
        state.isUserLoggedIn = false;
      });
  },
});

export const { logout, setUserLoggedIn } = authSlice.actions;
export default authSlice.reducer;
