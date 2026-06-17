// src/components/pages/UsuariosPage.jsx
// Página de gerenciamento de usuários do sistema — apenas admin acessa
// (Administrador, Bibliotecário e Leitor do sistema de login)

import React, { useState, useEffect } from 'react';
import { getUsuarios, postUsuario, putUsuario, deleteUsuario } from '../../services/api';

const formVazio = { nome: '', login: '', senha: '', tipo: 'leitor' };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarUsuarios(); }, []);

  async function carregarUsuarios() {
    try { setUsuarios(await getUsuarios()); }
    catch { setErro('Erro ao carregar usuários'); }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await putUsuario(editandoId, form);
      } else {
        await postUsuario(form);
      }
      setForm(formVazio);
      setEditandoId(null);
      carregarUsuarios();
    } catch (err) {
      setErro(err.error || 'Erro ao salvar usuário');
    }
  }

  function handleEditar(u) {
    setForm({ ...u, senha: '' }); // não pré-preenche a senha por segurança
    setEditandoId(u.id);
    window.scrollTo(0, 0);
  }

  async function handleDeletar(id) {
    if (!window.confirm('Excluir este usuário?')) return;
    try { await deleteUsuario(id); carregarUsuarios(); }
    catch { setErro('Erro ao excluir usuário'); }
  }

  const thStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '10px', textAlign: 'left' };
  const tdStyle = { padding: '10px', borderBottom: '1px solid #ecf0f1' };
  const inputStyle = { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = (cor) => ({ padding: '6px 12px', backgroundColor: cor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' });

  // Cor do badge de tipo de usuário
  function corTipo(tipo) {
    if (tipo === 'admin') return '#e74c3c';
    if (tipo === 'bibliotecario') return '#3498db';
    return '#27ae60';
  }

  return (
    <div>
      <h2>👤 Usuários do Sistema</h2>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h3>{editandoId ? 'Editar Usuário' : 'Cadastrar Usuário'}</h3>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label>Nome</label><br />
            <input style={inputStyle} name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div>
            <label>Login</label><br />
            <input style={inputStyle} name="login" value={form.login} onChange={handleChange} required />
          </div>
          <div>
            {/* Ao editar, a senha é opcional (em branco = não altera) */}
            <label>Senha {editandoId && '(deixe em branco para não alterar)'}</label><br />
            <input style={inputStyle} type="password" name="senha" value={form.senha} onChange={handleChange} required={!editandoId} />
          </div>
          <div>
            <label>Tipo</label><br />
            <select style={inputStyle} name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="admin">Administrador</option>
              <option value="bibliotecario">Bibliotecário</option>
              <option value="leitor">Leitor</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button type="submit" style={btnStyle('#27ae60')}>{editandoId ? 'Salvar' : 'Cadastrar'}</button>
            {editandoId && <button type="button" onClick={() => { setForm(formVazio); setEditandoId(null); }} style={btnStyle('#95a5a6')}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Tabela de usuários */}
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' }}>
        <thead>
          <tr>
            {['Nome', 'Login', 'Tipo', 'Ações'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td style={tdStyle}>{u.nome}</td>
              <td style={tdStyle}>{u.login}</td>
              <td style={tdStyle}>
                {/* Badge colorido por tipo */}
                <span style={{ backgroundColor: corTipo(u.tipo), color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                  {u.tipo}
                </span>
              </td>
              <td style={tdStyle}>
                <button style={btnStyle('#f39c12')} onClick={() => handleEditar(u)}>Editar</button>
                <button style={btnStyle('#e74c3c')} onClick={() => handleDeletar(u.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
