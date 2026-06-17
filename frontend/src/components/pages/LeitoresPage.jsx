// src/components/pages/LeitoresPage.jsx
// Página de gerenciamento de leitores (alunos)
// Apenas admin e bibliotecário acessam

import React, { useState, useEffect } from 'react';
import { getLeitores, postLeitor, putLeitor, deleteLeitor } from '../../services/api';

function getTipoUsuario() {
  const token = localStorage.getItem('token');
  if (!token) return '';
  try { return JSON.parse(atob(token.split('.')[1])).tipo; } catch { return ''; }
}

const formVazio = { nome: '', cpf_ra: '', email: '', telefone: '', endereco: '', status: 'ativo' };

export default function LeitoresPage() {
  const [leitores, setLeitores] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [erro, setErro] = useState('');
  const tipo = getTipoUsuario();
  const podeExcluir = tipo === 'admin';

  useEffect(() => { carregarLeitores(); }, []);

  async function carregarLeitores(query = '') {
    try {
      const dados = await getLeitores(query ? `?nome=${query}` : '');
      setLeitores(dados);
    } catch { setErro('Erro ao carregar leitores'); }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await putLeitor(editandoId, form);
      } else {
        await postLeitor(form);
      }
      setForm(formVazio);
      setEditandoId(null);
      carregarLeitores();
    } catch (err) {
      setErro(err.error || 'Erro ao salvar leitor');
    }
  }

  function handleEditar(leitor) {
    setForm(leitor);
    setEditandoId(leitor.id);
    window.scrollTo(0, 0);
  }

  async function handleDeletar(id) {
    if (!window.confirm('Excluir este leitor?')) return;
    try { await deleteLeitor(id); carregarLeitores(); }
    catch { setErro('Erro ao excluir leitor'); }
  }

  const thStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '10px', textAlign: 'left' };
  const tdStyle = { padding: '10px', borderBottom: '1px solid #ecf0f1' };
  const inputStyle = { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = (cor) => ({ padding: '6px 12px', backgroundColor: cor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' });

  return (
    <div>
      <h2>👥 Leitores</h2>

      {/* Formulário de cadastro/edição */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h3>{editandoId ? 'Editar Leitor' : 'Cadastrar Leitor'}</h3>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[['nome','Nome'],['cpf_ra','CPF ou RA'],['email','E-mail'],['telefone','Telefone'],['endereco','Endereço']].map(([name, label]) => (
            <div key={name}>
              <label>{label}</label><br />
              <input style={inputStyle} name={name} value={form[name]} onChange={handleChange} required={['nome','cpf_ra','email'].includes(name)} />
            </div>
          ))}
          <div>
            <label>Status</label><br />
            {/* Select: leitor ativo ou inativo */}
            <select style={inputStyle} name="status" value={form.status} onChange={handleChange}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button type="submit" style={btnStyle('#27ae60')}>{editandoId ? 'Salvar' : 'Cadastrar'}</button>
            {editandoId && <button type="button" onClick={() => { setForm(formVazio); setEditandoId(null); }} style={btnStyle('#95a5a6')}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Busca por nome */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input style={{ ...inputStyle, width: '300px' }} placeholder="Buscar por nome..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        <button style={btnStyle('#3498db')} onClick={() => carregarLeitores(filtro)}>Buscar</button>
        <button style={btnStyle('#95a5a6')} onClick={() => { setFiltro(''); carregarLeitores(); }}>Limpar</button>
      </div>

      {/* Tabela de leitores */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' }}>
          <thead>
            <tr>
              {['Nome', 'CPF/RA', 'E-mail', 'Telefone', 'Status', 'Ações'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leitores.map(l => (
              <tr key={l.id}>
                <td style={tdStyle}>{l.nome}</td>
                <td style={tdStyle}>{l.cpf_ra}</td>
                <td style={tdStyle}>{l.email}</td>
                <td style={tdStyle}>{l.telefone}</td>
                {/* Status destacado por cor */}
                <td style={{ ...tdStyle, color: l.status === 'ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {l.status}
                </td>
                <td style={tdStyle}>
                  <button style={btnStyle('#f39c12')} onClick={() => handleEditar(l)}>Editar</button>
                  {podeExcluir && <button style={btnStyle('#e74c3c')} onClick={() => handleDeletar(l.id)}>Excluir</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leitores.length === 0 && <p style={{ textAlign: 'center', color: '#95a5a6' }}>Nenhum leitor encontrado.</p>}
      </div>
    </div>
  );
}
