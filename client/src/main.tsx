import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import './styles/fonts.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
            <App />
            <Toaster />
        </ThemeProvider>
    </React.StrictMode>,
);
