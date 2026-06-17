// src/App.jsx
// Componente raiz da aplicação
// Configura o React Router DOM (apostila cap25: SPA com react-router)
// e protege as rotas para usuários não autenticados

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LoginPage from './components/pages/LoginPage';
import LivrosPage from './components/pages/LivrosPage';
import LeitoresPage from './components/pages/LeitoresPage';
import EmprestimosPage from './components/pages/EmprestimosPage';
import UsuariosPage from './components/pages/UsuariosPage';

// Componente que protege rotas privadas
// Se não houver token no localStorage, redireciona para o login
function RotaPrivada({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública: página de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas privadas: exigem token JWT */}
        <Route
          path="/*"
          element={
            <RotaPrivada>
              {/* Navbar é exibida em todas as páginas autenticadas */}
              <Navbar />
              <div style={{ padding: '20px' }}>
                <Routes>
                  <Route path="/livros"      element={<LivrosPage />} />
                  <Route path="/leitores"    element={<LeitoresPage />} />
                  <Route path="/emprestimos" element={<EmprestimosPage />} />
                  <Route path="/usuarios"    element={<UsuariosPage />} />
                  {/* Redireciona a raiz para livros */}
                  <Route path="/"            element={<Navigate to="/livros" />} />
                </Routes>
              </div>
            </RotaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
