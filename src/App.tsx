import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MindMapListPage } from './pages/MindMapListPage';
import { MindMapDetailPage } from './pages/MindMapDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MindMapListPage />} />
        <Route path='/mindmaps/:id' element={<MindMapDetailPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
