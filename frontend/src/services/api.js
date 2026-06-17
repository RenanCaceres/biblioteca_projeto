// src/services/api.js
// Centraliza todas as chamadas HTTP para a API backend
// Baseado na apostila cap27: tokens são armazenados no localStorage
// e enviados no cabeçalho Authorization de cada requisição

const BASE_URL = 'http://localhost:3001/api';

// Retorna o token salvo no localStorage (salvo na página de Login)
function getToken() {
  return localStorage.getItem('token');
}

// Monta os headers padrão com o token JWT no formato "Bearer <token>"
// Esse é o formato esperado pelo middleware authenticateToken da API
function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

// Função genérica para fazer requisições GET
async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: headers() });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Função genérica para POST (criação de recursos)
async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Função genérica para PUT (atualização de recursos)
async function put(endpoint, body = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Função genérica para DELETE
async function del(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok && res.status !== 204) throw await res.json();
}

// ========== AUTENTICAÇÃO ==========
export const login = (dados) => post('/login', dados);

// ========== LIVROS ==========
export const getLivros    = (params = '') => get(`/livros${params}`);
export const getLivroById = (id) => get(`/livros/${id}`);
export const postLivro    = (dados) => post('/livros', dados);
export const putLivro     = (id, dados) => put(`/livros/${id}`, dados);
export const deleteLivro  = (id) => del(`/livros/${id}`);

// ========== LEITORES ==========
export const getLeitores    = (params = '') => get(`/leitores${params}`);
export const getLeitorById  = (id) => get(`/leitores/${id}`);
export const postLeitor     = (dados) => post('/leitores', dados);
export const putLeitor      = (id, dados) => put(`/leitores/${id}`, dados);
export const deleteLeitor   = (id) => del(`/leitores/${id}`);
export const getEmprestimosByLeitor = (id) => get(`/leitores/${id}/emprestimos`);

// ========== EMPRÉSTIMOS ==========
export const getEmprestimos   = (params = '') => get(`/emprestimos${params}`);
export const postEmprestimo   = (dados) => post('/emprestimos', dados);
export const registrarDevolucao = (id) => put(`/emprestimos/${id}/devolver`);

// ========== USUÁRIOS ==========
export const getUsuarios   = () => get('/usuarios');
export const postUsuario   = (dados) => post('/usuarios', dados);
export const putUsuario    = (id, dados) => put(`/usuarios/${id}`, dados);
export const deleteUsuario = (id) => del(`/usuarios/${id}`);
