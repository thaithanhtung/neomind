import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  initializeAuth,
  setSession,
  signUp,
  signIn,
  signOut,
  clearError,
} from '@/store/slices/authSlice';
import { supabase } from '@/features/mindmap/services/supabaseService';

/**
 * Hook to use authentication with Redux
 * Replaces the old AuthContext
 */
export const useAuthRedux = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Initialize auth on mount (chỉ 1 lần, dùng Redux state thay vì ref)
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [isInitialized, dispatch]);

  // Listen for auth changes - chỉ setup listener một lần
  useEffect(() => {
    // Listen for auth changes - update state trực tiếp thay vì dispatch initializeAuth
    // để tránh vòng lặp vô hạn
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Chỉ update nếu session thay đổi thực sự
      dispatch(setSession(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const handleSignUp = async (email: string, password: string) => {
    const result = await dispatch(signUp({ email, password }));
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    const result = await dispatch(signIn({ email, password }));
    return result;
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    clearError: handleClearError,
  };
};

