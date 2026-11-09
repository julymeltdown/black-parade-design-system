import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bodoni-moda/latin-700.css';
import '@fontsource/bodoni-moda/latin-900.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import App from './App';
import './app.css';
import './reading.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
