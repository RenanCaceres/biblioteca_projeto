// src/main.jsx
// Ponto de entrada da aplicação React (equivalente ao index.js da apostila cap27)
// Renderiza o componente App dentro da div#root do index.html

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
