import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capture PWA install prompt globally as early as possible
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent('zelora_install_ready'));
  });

  window.addEventListener('appinstalled', () => {
    window.deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('zelora_installed'));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
