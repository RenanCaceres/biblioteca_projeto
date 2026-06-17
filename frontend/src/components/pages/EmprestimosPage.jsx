// src/components/pages/EmprestimosPage.jsx
// Página de empréstimos e devoluções
// Leitores veem apenas os próprios empréstimos; admin/bibliotecário veem todos

import React, { useState, useEffect } from 'react';
import { getEmprestimos, postEmprestimo, registrarDevolucao, getLivros, getLeitores } from '../../services/api';

function getUsuarioLogado() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

const hoje = new Date().toISOString().split('T')[0];
// Data padrão de devolução = 14 dias a partir de hoje
const em14dias = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const formVazio = { leitor_id: '', livro_id: '', data_emprestimo: hoje, data_prevista_devolucao: em14dias };

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [leitores, setLeitores] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [erro, setErro] = useState('');
  const usuario = getUsuarioLogado();
  const podeRegistrar = usuario?.tipo === 'admin' || usuario?.tipo === 'bibliotecario';

  useEffect(() => {
    carregarEmprestimos();
    if (podeRegistrar) {
      // Carrega lista de livros e leitores para os selects do formulário
      getLivros().then(setLivros).catch(() => {});
      getLeitores().then(setLeitores).catch(() => {});
    }
  }, []);

  async function carregarEmprestimos(status = '') {
    try {
      // Se for leitor, filtra pelo leitor_id do token — mas a proteção real está na API
      const query = status ? `?status=${status}` : '';
      const dados = await getEmprestimos(query);
      setEmprestimos(dados);
    } catch { setErro('Erro ao carregar empréstimos'); }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await postEmprestimo(form);
      setForm(formVazio);
      carregarEmprestimos();
    } catch (err) {
      setErro(err.error || 'Erro ao registrar empréstimo');
    }
  }

  async function handleDevolver(id) {
    if (!window.confirm('Confirmar devolução?')) return;
    try {
      await registrarDevolucao(id);
      carregarEmprestimos(filtroStatus);
    } catch { setErro('Erro ao registrar devolução'); }
  }

  // Cor do badge de status
  function corStatus(status) {
    if (status === 'devolvido') return 'green';
    if (status === 'atrasado')  return 'red';
    return '#f39c12'; // aberto = laranja
  }

  const thStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '10px', textAlign: 'left' };
  const tdStyle = { padding: '10px', borderBottom: '1px solid #ecf0f1' };
  const inputStyle = { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = (cor) => ({ padding: '6px 12px', backgroundColor: cor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' });

  return (
    <div>
      <h2>🔄 Empréstimos</h2>

      {/* Formulário de novo empréstimo — apenas para admin e bibliotecário */}
      {podeRegistrar && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>Registrar Empréstimo</h3>
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label>Leitor</label><br />
              {/* Select preenchido com os leitores ativos do banco */}
              <select style={inputStyle} name="leitor_id" value={form.leitor_id} onChange={handleChange} required>
                <option value="">Selecione um leitor...</option>
                {leitores.filter(l => l.status === 'ativo').map(l => (
                  <option key={l.id} value={l.id}>{l.nome} ({l.cpf_ra})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Livro</label><br />
              {/* Select preenchido com os livros disponíveis */}
              <select style={inputStyle} name="livro_id" value={form.livro_id} onChange={handleChange} required>
                <option value="">Selecione um livro...</option>
                {livros.filter(l => l.quantidade_disponivel > 0).map(l => (
                  <option key={l.id} value={l.id}>{l.titulo} — {l.autor} (disp: {l.quantidade_disponivel})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Data do Empréstimo</label><br />
              <input style={inputStyle} type="date" name="data_emprestimo" value={form.data_emprestimo} onChange={handleChange} required />
            </div>
            <div>
              <label>Data Prevista de Devolução</label><br />
              <input style={inputStyle} type="date" name="data_prevista_devolucao" value={form.data_prevista_devolucao} onChange={handleChange} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" style={btnStyle('#27ae60')}>Registrar Empréstimo</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtro por status */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {['', 'aberto', 'devolvido', 'atrasado'].map(s => (
          <button
            key={s}
            style={{ ...btnStyle(filtroStatus === s ? '#2c3e50' : '#95a5a6') }}
            onClick={() => { setFiltroStatus(s); carregarEmprestimos(s); }}
          >
            {s === '' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabela de empréstimos */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' }}>
          <thead>
            <tr>
              {['Leitor', 'Livro', 'Emprestado em', 'Devolução Prevista', 'Devolvido em', 'Status', 'Ações'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {emprestimos.map(e => (
              <tr key={e.id}>
                <td style={tdStyle}>{e.leitor?.nome || e.leitor_id}</td>
                <td style={tdStyle}>{e.livro?.titulo || e.livro_id}</td>
                <td style={tdStyle}>{e.data_emprestimo}</td>
                <td style={tdStyle}>{e.data_prevista_devolucao}</td>
                <td style={tdStyle}>{e.data_real_devolucao || '—'}</td>
                <td style={{ ...tdStyle, color: corStatus(e.status), fontWeight: 'bold' }}>{e.status}</td>
                <td style={tdStyle}>
                  {/* Botão de devolução apenas para empréstimos ainda em aberto/atrasados */}
                  {podeRegistrar && e.status !== 'devolvido' && (
                    <button style={btnStyle('#27ae60')} onClick={() => handleDevolver(e.id)}>Devolver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {emprestimos.length === 0 && <p style={{ textAlign: 'center', color: '#95a5a6' }}>Nenhum empréstimo encontrado.</p>}
      </div>
    </div>
  );
}
