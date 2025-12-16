import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MindMapListPage } from './pages/MindMapListPage';
import { MindMapDetailPage } from './pages/MindMapDetailPage';
import { SharedMindMapPage } from './pages/SharedMindMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAnalytics } from './shared/hooks/useAnalytics';
import { useTheme } from './shared/hooks/useTheme';
import { useAppDispatch } from './store/hooks';
import { loadUserProfile } from './store/slices/userProfileSlice';

function AppRoutes() {
  const dispatch = useAppDispatch();

  // Tự động track page views khi route thay đổi
  useAnalytics();
  // Apply theme
  useTheme();

  // ✨ Pre-fetch user profile ngay khi app load
  useEffect(() => {
    dispatch(loadUserProfile({ force: false }));
  }, [dispatch]);

  return (
    <Routes>
      <Route path='/' element={<MindMapListPage />} />
      <Route path='/mindmaps/:id' element={<MindMapDetailPage />} />
      <Route path='/shared/:token' element={<SharedMindMapPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
