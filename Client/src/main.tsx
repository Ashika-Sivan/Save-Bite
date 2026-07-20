import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./index.css";
import { Provider } from 'react-redux';
import { store } from "./redux/store";
import AuthInitializer from './components/AuthInitializer.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
    <App />
    </AuthInitializer>
    </Provider>
  </StrictMode>,
)
