import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MindMapListPage } from './pages/MindMapListPage';
import { MindMapDetailPage } from './pages/MindMapDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAnalytics } from './shared/hooks/useAnalytics';
import { useTheme } from './shared/hooks/useTheme';

function AppRoutes() {
  // Tự động track page views khi route thay đổi
  useAnalytics();
  // Apply theme
  useTheme();

  return (
    <Routes>
      <Route path='/' element={<MindMapListPage />} />
      <Route path='/mindmaps/:id' element={<MindMapDetailPage />} />
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
