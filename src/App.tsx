import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MindMapListPage } from './pages/MindMapListPage';
import { MindMapDetailPage } from './pages/MindMapDetailPage';
import { useAnalytics } from './shared/hooks/useAnalytics';

function AppRoutes() {
  // Tự động track page views khi route thay đổi
  useAnalytics();

  return (
    <Routes>
      <Route path='/' element={<MindMapListPage />} />
      <Route path='/mindmaps/:id' element={<MindMapDetailPage />} />
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
