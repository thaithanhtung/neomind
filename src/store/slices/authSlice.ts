import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/features/mindmap/services/supabaseService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // Flag để track xem đã initialize chưa
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isInitialized: false,
};

// Async thunks
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
});

export const signUp = createAsyncThunk<
  { user: User | null; error: AuthError | null },
  { email: string; password: string }
>('auth/signUp', async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { user: data.user, error };
});

export const signIn = createAsyncThunk<
  { user: User | null; error: AuthError | null },
  { email: string; password: string }
>('auth/signIn', async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data.user, error };
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await supabase.auth.signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      // Chỉ update nếu session thực sự thay đổi để tránh re-render không cần thiết
      if (state.session?.access_token !== action.payload?.access_token) {
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        // Chỉ set loading nếu chưa initialize
        if (!state.isInitialized) {
          state.loading = true;
        }
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true; // Đánh dấu đã initialize dù có lỗi
      })
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.error) {
          state.error = action.payload.error.message;
        } else if (action.payload.user) {
          state.user = action.payload.user;
          // Lấy session mới sau khi sign up
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              state.session = session;
            }
          });
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.error) {
          state.error = action.payload.error.message;
        } else if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.session = null;
      });
  },
});

export const { setUser, setSession, clearError } = authSlice.actions;
export default authSlice.reducer;
