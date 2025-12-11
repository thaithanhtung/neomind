import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  userProfileService,
  UserProfile,
} from '@/features/user/services/userProfileService';

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp để tracking cache
}

const initialState: UserProfileState = {
  profile: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 5 phút
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Load user profile từ Supabase
 * Có built-in caching: không refetch nếu data còn fresh
 */
export const loadUserProfile = createAsyncThunk<
  UserProfile | null,
  { force?: boolean } // force = true để bypass cache
>('userProfile/load', async ({ force = false }, { getState }) => {
  const state = getState() as { userProfile: UserProfileState };
  const now = Date.now();

  // Check cache: nếu có data và chưa hết hạn, return cached data
  if (
    !force &&
    state.userProfile.profile &&
    state.userProfile.lastFetched &&
    now - state.userProfile.lastFetched < CACHE_DURATION
  ) {
    console.log('✅ Using cached user profile');
    return state.userProfile.profile;
  }

  console.log('🔄 Fetching user profile from database...');
  const profile = await userProfileService.getCurrentUserProfile();
  return profile;
});

/**
 * Update AI model và refresh cache
 */
export const updateAIModelInStore = createAsyncThunk<{ model: string }, string>(
  'userProfile/updateAIModel',
  async (model) => {
    const result = await userProfileService.updateAIModel(model);
    if (!result.success) {
      throw new Error(result.error || 'Failed to update AI model');
    }
    return { model };
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.lastFetched = null;
    },
    // Manually update profile (for optimistic updates)
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user profile
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
        state.lastFetched = Date.now();
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load user profile';
      })
      // Update AI model
      .addCase(updateAIModelInStore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAIModelInStore.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.ai_model = action.payload.model;
          state.profile.updated_at = new Date().toISOString();
        }
        state.isLoading = false;
        state.lastFetched = Date.now();
      })
      .addCase(updateAIModelInStore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update AI model';
      });
  },
});

export const { clearUserProfile, setProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
