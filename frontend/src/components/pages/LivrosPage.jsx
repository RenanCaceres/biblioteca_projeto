// src/components/pages/LivrosPage.jsx
// Página de gerenciamento de livros
// Demonstra: useState (apostila cap24), useEffect para buscar dados da API,
// e renderização condicional baseada no tipo do usuário

import React, { useState, useEffect } from 'react';
import { getLivros, postLivro, putLivro, deleteLivro } from '../../services/api';
import { decodeJWT } from '../../utils/jwt.js';

// Retorna o tipo do usuário logado decodificando o JWT do localStorage
function getTipoUsuario() {
  const token = localStorage.getItem('token');
  return decodeJWT(token)?.tipo || '';
}

const formVazio = {
  titulo: '', autor: '', editora: '', ano_publicacao: '',
  categoria: '', isbn: '', quantidade_total: 1,
};

// Estado inicial dos filtros de busca (separado do formulário de cadastro)
const filtroVazio = { titulo: '', autor: '', categoria: '', isbn: '', disponivel: '' };

export default function LivrosPage() {
  const [livros, setLivros] = useState([]);   // lista de livros (state = apostila cap24)
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null); // null = modo criação
  const [filtro, setFiltro] = useState(filtroVazio);
  const [erro, setErro] = useState('');
  const tipo = getTipoUsuario();
  const podeEditar = tipo === 'admin' || tipo === 'bibliotecario';
  const podeExcluir = tipo === 'admin';

  // useEffect: carrega os livros assim que a página é montada (apostila cap24)
  useEffect(() => {
    carregarLivros();
  }, []);

  // Monta a query string a partir do objeto de filtros (só inclui campos preenchidos)
  // Suporta busca por título, autor, categoria, ISBN e disponibilidade — conforme exigido no projeto
  async function carregarLivros(filtros = filtro) {
    try {
      const params = new URLSearchParams();
      if (filtros.titulo)     params.set('titulo', filtros.titulo);
      if (filtros.autor)      params.set('autor', filtros.autor);
      if (filtros.categoria)  params.set('categoria', filtros.categoria);
      if (filtros.isbn)       params.set('isbn', filtros.isbn);
      if (filtros.disponivel) params.set('disponivel', filtros.disponivel);
      const query = params.toString() ? `?${params.toString()}` : '';
      const dados = await getLivros(query);
      setLivros(dados);
    } catch { setErro('Erro ao carregar livros'); }
  }

  function handleFiltroChange(e) {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await putLivro(editandoId, form);
      } else {
        await postLivro(form);
      }
      setForm(formVazio);
      setEditandoId(null);
      carregarLivros();
    } catch (err) {
      setErro(err.error || 'Erro ao salvar livro');
    }
  }

  function handleEditar(livro) {
    setForm(livro);
    setEditandoId(livro.id);
    window.scrollTo(0, 0);
  }

  async function handleDeletar(id) {
    if (!window.confirm('Excluir este livro?')) return;
    try {
      await deleteLivro(id);
      carregarLivros();
    } catch { setErro('Erro ao excluir livro'); }
  }

  const thStyle = { backgroundColor: '#2c3e50', color: 'white', padding: '10px', textAlign: 'left' };
  const tdStyle = { padding: '10px', borderBottom: '1px solid #ecf0f1' };
  const inputStyle = { padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = (cor) => ({ padding: '6px 12px', backgroundColor: cor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' });

  return (
    <div>
      <h2>📖 Livros</h2>

      {/* Formulário de cadastro/edição — visível apenas para admin e bibliotecário */}
      {podeEditar && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3>{editandoId ? 'Editar Livro' : 'Cadastrar Livro'}</h3>
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              ['titulo', 'Título'], ['autor', 'Autor'], ['editora', 'Editora'],
              ['ano_publicacao', 'Ano'], ['categoria', 'Categoria'], ['isbn', 'ISBN'],
            ].map(([name, label]) => (
              <div key={name}>
                <label>{label}</label><br />
                <input style={inputStyle} name={name} value={form[name]} onChange={handleChange} required />
              </div>
            ))}
            <div>
              <label>Quantidade</label><br />
              <input style={inputStyle} type="number" name="quantidade_total" value={form.quantidade_total} onChange={handleChange} min="1" required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button type="submit" style={btnStyle('#27ae60')}>{editandoId ? 'Salvar' : 'Cadastrar'}</button>
              {editandoId && <button type="button" onClick={() => { setForm(formVazio); setEditandoId(null); }} style={btnStyle('#95a5a6')}>Cancelar</button>}
            </div>
          </form>
        </div>
      )}

      {/* Filtros de busca: título, autor, categoria, ISBN e disponibilidade */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '8px' }}>
          <input style={inputStyle} name="titulo" placeholder="Título..." value={filtro.titulo} onChange={handleFiltroChange} />
          <input style={inputStyle} name="autor" placeholder="Autor..." value={filtro.autor} onChange={handleFiltroChange} />
          <input style={inputStyle} name="categoria" placeholder="Categoria..." value={filtro.categoria} onChange={handleFiltroChange} />
          <input style={inputStyle} name="isbn" placeholder="ISBN..." value={filtro.isbn} onChange={handleFiltroChange} />
          <select style={inputStyle} name="disponivel" value={filtro.disponivel} onChange={handleFiltroChange}>
            <option value="">Disponibilidade (todas)</option>
            <option value="true">Somente disponíveis</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={btnStyle('#3498db')} onClick={() => carregarLivros(filtro)}>Buscar</button>
          <button style={btnStyle('#95a5a6')} onClick={() => { setFiltro(filtroVazio); carregarLivros(filtroVazio); }}>Limpar</button>
        </div>
      </div>

      {/* Tabela de livros */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px' }}>
          <thead>
            <tr>
              {['Título', 'Autor', 'Categoria', 'ISBN', 'Disponível', 'Total', 'Status', 'Ações'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {livros.map(l => (
              <tr key={l.id}>
                <td style={tdStyle}>{l.titulo}</td>
                <td style={tdStyle}>{l.autor}</td>
                <td style={tdStyle}>{l.categoria}</td>
                <td style={tdStyle}>{l.isbn}</td>
                {/* Destaca em vermelho quando não há exemplares disponíveis */}
                <td style={{ ...tdStyle, color: l.quantidade_disponivel === 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                  {l.quantidade_disponivel}
                </td>
                <td style={tdStyle}>{l.quantidade_total}</td>
                <td style={{ ...tdStyle, color: l.status === 'disponivel' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {l.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                </td>
                <td style={tdStyle}>
                  {podeEditar && <button style={btnStyle('#f39c12')} onClick={() => handleEditar(l)}>Editar</button>}
                  {podeExcluir && <button style={btnStyle('#e74c3c')} onClick={() => handleDeletar(l.id)}>Excluir</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {livros.length === 0 && <p style={{ textAlign: 'center', color: '#95a5a6' }}>Nenhum livro encontrado.</p>}
      </div>
    </div>
  );
}
