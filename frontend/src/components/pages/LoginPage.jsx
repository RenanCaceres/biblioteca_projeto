// src/components/pages/LoginPage.jsx
// Página de login — usa useState (apostila cap24) para gerenciar o formulário
// Após login bem-sucedido, salva o token no localStorage (apostila cap27)
// e navega para a página de livros

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';

export default function LoginPage() {
  // useState: armazena os valores dos campos do formulário (apostila cap24)
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Atualiza o estado do formulário a cada tecla digitada
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Ao submeter: chama a API e salva o token
  async function handleSubmit(e) {
    e.preventDefault(); // evita recarregar a página
    setErro('');
    try {
      const data = await login(form);
      // Salva o token JWT no localStorage (apostila cap27)
      // Ele será lido pelo api.js em toda requisição futura
      localStorage.setItem('token', data.token);
      navigate('/livros');
    } catch (err) {
      setErro(err.error || 'Erro ao fazer login');
    }
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '320px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '8px',
    marginBottom: '16px',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  const btnStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>📚 Biblioteca</h2>
        <h3 style={{ textAlign: 'center', color: '#7f8c8d', fontWeight: 'normal' }}>Entrar no sistema</h3>

        {/* Formulário de login */}
        <form onSubmit={handleSubmit}>
          <label>Login</label>
          <input
            style={inputStyle}
            type="text"
            name="login"
            value={form.login}
            onChange={handleChange}
            required
          />

          <label>Senha</label>
          <input
            style={inputStyle}
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            required
          />

          {/* Exibe mensagem de erro se o login falhar */}
          {erro && <p style={{ color: 'red', fontSize: '14px' }}>{erro}</p>}

          <button type="submit" style={btnStyle}>Entrar</button>
        </form>

        <p style={{ textAlign: 'center', color: '#95a5a6', marginTop: '16px', fontSize: '13px' }}>
          Admin padrão: admin / admin123
        </p>
      </div>
    </div>
  );
}
