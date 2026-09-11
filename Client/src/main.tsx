import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import { Provider } from 'react-redux';
import { store } from "./redux/store";
import AuthInitializer from './components/AuthInitializer.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "971184169971-umpca7fr81kfur1ghb8ihgrkempmt91l.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
