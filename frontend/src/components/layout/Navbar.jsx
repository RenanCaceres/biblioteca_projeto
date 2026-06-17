// src/components/layout/Navbar.jsx
// Barra de navegação — exibida em todas as páginas após o login
// Baseada na estrutura de layout da apostila cap27 (components/layout/)
// Usa react-router-dom para navegar entre páginas sem recarregar (SPA - cap25)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // Decodifica o token JWT para saber o tipo do usuário logado
  // O token é um JSON base64 dividido em 3 partes por "."
  // A parte do meio (índice 1) contém o payload com os dados do usuário
  function getUsuarioLogado() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  const usuario = getUsuarioLogado();

  // Logout: remove o token do localStorage e redireciona para o login
  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: '#3498db',
  };

  return (
    <nav style={navStyle}>
      <span style={{ color: 'white', fontWeight: 'bold', marginRight: '8px' }}>
        📚 Biblioteca
      </span>

      <Link to="/livros"      style={linkStyle}>Livros</Link>
      <Link to="/emprestimos" style={linkStyle}>Empréstimos</Link>

      {/* Leitores e Usuários só aparecem para admin e bibliotecário */}
      {usuario && usuario.tipo !== 'leitor' && (
        <Link to="/leitores" style={linkStyle}>Leitores</Link>
      )}
      {usuario && usuario.tipo === 'admin' && (
        <Link to="/usuarios" style={linkStyle}>Usuários</Link>
      )}

      {/* Exibe o nome e tipo do usuário logado à direita */}
      <span style={{ color: '#bdc3c7', marginLeft: 'auto' }}>
        {usuario ? `${usuario.nome} (${usuario.tipo})` : ''}
      </span>

      <button
        onClick={handleLogout}
        style={{ ...linkStyle, backgroundColor: '#e74c3c', cursor: 'pointer', border: 'none' }}
      >
        Sair
      </button>
    </nav>
  );
}
