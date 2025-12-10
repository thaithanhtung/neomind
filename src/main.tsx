import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.tsx';
import './index.css';
import { initGA } from './shared/utils/analytics';

// Khởi tạo Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  initGA(GA_MEASUREMENT_ID);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
