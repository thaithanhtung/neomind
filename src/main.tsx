import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.tsx';
import './index.css';
import 'intro.js/minified/introjs.min.css';
import { initGA } from './shared/utils/analytics';
import { initHotjar } from './shared/utils/hotjar';

// Khởi tạo Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  initGA(GA_MEASUREMENT_ID);
}

// Khởi tạo Hotjar
const HOTJAR_SITE_ID = import.meta.env.VITE_HOTJAR_SITE_ID;
if (HOTJAR_SITE_ID) {
  const siteId = parseInt(HOTJAR_SITE_ID, 10);
  if (!isNaN(siteId)) {
    initHotjar(siteId);
  } else {
    console.warn('VITE_HOTJAR_SITE_ID phải là một số hợp lệ');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
