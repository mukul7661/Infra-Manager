import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Deployment {
  id: string;
  namespace: string;
  appName: string;
  status: string;
}

interface DeploymentState {
  deployments: Deployment[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DeploymentState = {
  deployments: [],
  status: "idle",
  error: null,
};

export const fetchDeployments = createAsyncThunk(
  "deployments/fetchDeployments",
  async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/apps`,
      {
        withCredentials: true,
      }
    );
    console.log(response.data);
    return response.data;
  }
);

// export const fetchDeploymentsById = createAsyncThunk(
//   "deployments/fetchDeployments",
//   async (id) => {
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_API_URL}/apps/${id}`,
//       {
//         withCredentials: true,
//       }
//     );
//     console.log(response.data);
//     return response.data;
//   }
// );

export const createDeployment = createAsyncThunk(
  "deployments/createDeployment",
  async (newDeployment: {
    namespace: string;
    appName: string;
    chart: string;
  }) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/deploy`,
      newDeployment,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const deleteDeployment = createAsyncThunk(
  "deployments/deleteDeployment",
  async (id: string) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/apps/${id}`, {
      withCredentials: true,
    });
    return id;
  }
);

export const updateDeployment = createSlice({
  name: "deployments",
  initialState,
  reducers: {
    updateDeployment: (state, action: PayloadAction<Deployment>) => {
      const index = state.deployments.findIndex(
        (deployment) => deployment.id === action.payload.id
      );
      if (index !== -1) {
        state.deployments[index] = action.payload;
      }
    },
  },
});

const deploymentSlice = createSlice({
  name: "deployments",
  initialState,
  reducers: {
    updateDeployment: (state, action: PayloadAction<Deployment>) => {
      console.log("Updating deployment:", action.payload);
      const index = state.deployments.findIndex(
        (deployment) => deployment.id === action.payload.id
      );
      if (index !== -1) {
        state.deployments[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeployments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDeployments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deployments = action.payload;
      })
      .addCase(fetchDeployments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(deleteDeployment.fulfilled, (state, action) => {
        state.deployments = state.deployments.filter(
          (deployment) => deployment.id !== action.payload
        );
      })
      .addCase(createDeployment.fulfilled, (state, action) => {
        state.deployments.push(action.payload);
      });
  },
});

// export const { updateDeployment } = deploymentSlice.actions;

export default deploymentSlice.reducer;
