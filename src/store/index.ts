import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import mindMapReducer from './slices/mindMapSlice';
import userProfileReducer from './slices/userProfileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    mindMap: mindMapReducer,
    userProfile: userProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'mindMap/setHighlightedTexts',
          'mindMap/saveData',
          'mindMap/saveToHistory',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.highlightedTexts',
          'meta.arg.highlightedTexts',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['mindMap.highlightedTexts', 'mindMap.history'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
