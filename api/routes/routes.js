// routes/routes.js
// Baseado na apostila cap22 (routes.js com JWT)
// Define todas as rotas da API e aplica os middlewares de autenticação e autorização

const express = require('express');
const router = express.Router();

const authController      = require('../controllers/authController');
const usuarioController   = require('../controllers/usuarioController');
const livroController     = require('../controllers/livroController');
const leitorController    = require('../controllers/leitorController');
const emprestimoController = require('../controllers/emprestimoController');

// Middleware de autenticação (verifica JWT) e autorização (verifica o tipo de usuário)
const { authenticateToken, authorize } = require('../middleware/authenticateToken');

// ==================== AUTENTICAÇÃO ====================

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Faz login e retorna o token JWT
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login: { type: string, example: admin }
 *               senha: { type: string, example: "1234" }
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *       401:
 *         description: Senha incorreta
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/login', authController.login);

// ==================== USUÁRIOS ====================

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários do sistema
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/usuarios', authenticateToken, authorize('admin'), usuarioController.getUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Não encontrado
 */
router.get('/usuarios/:id', authenticateToken, authorize('admin'), usuarioController.getUsuarioById);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário (apenas admin)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:  { type: string }
 *               login: { type: string }
 *               senha: { type: string }
 *               tipo:  { type: string, enum: [admin, bibliotecario, leitor] }
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.post('/usuarios', authenticateToken, authorize('admin'), usuarioController.postUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Edita um usuário existente (apenas admin)
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:  { type: string }
 *               login: { type: string }
 *               senha: { type: string, description: "Opcional — se vazio, mantém a senha atual" }
 *               tipo:  { type: string, enum: [admin, bibliotecario, leitor] }
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/usuarios/:id', authenticateToken, authorize('admin'), usuarioController.putUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário do sistema (apenas admin)
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Usuário removido
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/usuarios/:id', authenticateToken, authorize('admin'), usuarioController.deleteUsuario);

// ==================== LIVROS ====================

/**
 * @swagger
 * /livros:
 *   get:
 *     summary: Lista todos os livros (com filtros opcionais)
 *     tags: [Livros]
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema: { type: string }
 *       - in: query
 *         name: autor
 *         schema: { type: string }
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *       - in: query
 *         name: isbn
 *         schema: { type: string }
 *       - in: query
 *         name: disponivel
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de livros
 */
router.get('/livros', authenticateToken, livroController.getLivros);

/**
 * @swagger
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro por ID
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do livro
 *       404:
 *         description: Livro não encontrado
 */
router.get('/livros/:id', authenticateToken, livroController.getLivroById);

/**
 * @swagger
 * /livros:
 *   post:
 *     summary: Cadastra um novo livro (admin ou bibliotecario)
 *     tags: [Livros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:          { type: string }
 *               autor:           { type: string }
 *               editora:         { type: string }
 *               ano_publicacao:  { type: integer }
 *               categoria:       { type: string }
 *               isbn:            { type: string }
 *               quantidade_total: { type: integer }
 *     responses:
 *       201:
 *         description: Livro cadastrado
 */
router.post('/livros', authenticateToken, authorize('admin', 'bibliotecario'), livroController.postLivro);

/**
 * @swagger
 * /livros/{id}:
 *   put:
 *     summary: Edita um livro existente (admin ou bibliotecario)
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:           { type: string }
 *               autor:            { type: string }
 *               editora:          { type: string }
 *               ano_publicacao:   { type: integer }
 *               categoria:        { type: string }
 *               isbn:             { type: string }
 *               quantidade_total: { type: integer }
 *     responses:
 *       200:
 *         description: Livro atualizado
 *       404:
 *         description: Livro não encontrado
 */
router.put('/livros/:id', authenticateToken, authorize('admin', 'bibliotecario'), livroController.putLivro);

/**
 * @swagger
 * /livros/{id}:
 *   delete:
 *     summary: Exclui um livro (apenas admin)
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Livro excluído
 *       404:
 *         description: Livro não encontrado
 */
// Apenas admin pode excluir livros
router.delete('/livros/:id', authenticateToken, authorize('admin'), livroController.deleteLivro);

// ==================== LEITORES ====================

/**
 * @swagger
 * /leitores:
 *   get:
 *     summary: Lista todos os leitores
 *     tags: [Leitores]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *       - in: query
 *         name: cpf_ra
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de leitores
 */
router.get('/leitores', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.getLeitores);

/**
 * @swagger
 * /leitores/{id}:
 *   get:
 *     summary: Busca um leitor por ID
 *     tags: [Leitores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do leitor
 *       404:
 *         description: Leitor não encontrado
 */
router.get('/leitores/:id', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.getLeitorById);

/**
 * @swagger
 * /leitores/{id}/emprestimos:
 *   get:
 *     summary: Histórico de empréstimos de um leitor (admin/bibliotecario veem qualquer leitor; o próprio leitor só vê os seus)
 *     tags: [Leitores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de empréstimos do leitor
 *       403:
 *         description: Leitor tentando consultar empréstimos de outro leitor
 */
router.get('/leitores/:id/emprestimos', authenticateToken, leitorController.getEmprestimosByLeitor);

/**
 * @swagger
 * /leitores:
 *   post:
 *     summary: Cadastra um leitor (admin ou bibliotecario)
 *     tags: [Leitores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:     { type: string }
 *               cpf_ra:   { type: string }
 *               email:    { type: string }
 *               telefone: { type: string }
 *               endereco: { type: string }
 *     responses:
 *       201:
 *         description: Leitor cadastrado
 */
router.post('/leitores', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.postLeitor);

/**
 * @swagger
 * /leitores/{id}:
 *   put:
 *     summary: Edita um leitor existente (admin ou bibliotecario)
 *     tags: [Leitores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:     { type: string }
 *               cpf_ra:   { type: string }
 *               email:    { type: string }
 *               telefone: { type: string }
 *               endereco: { type: string }
 *               status:   { type: string, enum: [ativo, inativo] }
 *     responses:
 *       200:
 *         description: Leitor atualizado
 *       404:
 *         description: Leitor não encontrado
 */
router.put('/leitores/:id', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.putLeitor);

/**
 * @swagger
 * /leitores/{id}:
 *   delete:
 *     summary: Exclui um leitor (apenas admin)
 *     tags: [Leitores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Leitor excluído
 *       404:
 *         description: Leitor não encontrado
 */
router.delete('/leitores/:id', authenticateToken, authorize('admin'), leitorController.deleteLeitor);

// ==================== EMPRÉSTIMOS ====================

/**
 * @swagger
 * /emprestimos:
 *   get:
 *     summary: Lista todos os empréstimos
 *     tags: [Empréstimos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [aberto, devolvido, atrasado] }
 *       - in: query
 *         name: leitor_id
 *         schema: { type: integer }
 *       - in: query
 *         name: data
 *         description: Filtra por uma data exata de empréstimo (YYYY-MM-DD)
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_inicio
 *         description: Filtra empréstimos com data_emprestimo a partir desta data
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_fim
 *         description: Filtra empréstimos com data_emprestimo até esta data
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de empréstimos
 */
router.get('/emprestimos', authenticateToken, authorize('admin', 'bibliotecario'), emprestimoController.getEmprestimos);

/**
 * @swagger
 * /emprestimos/{id}:
 *   get:
 *     summary: Busca um empréstimo por ID
 *     tags: [Empréstimos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados do empréstimo
 *       404:
 *         description: Empréstimo não encontrado
 */
router.get('/emprestimos/:id', authenticateToken, authorize('admin', 'bibliotecario'), emprestimoController.getEmprestimoById);

/**
 * @swagger
 * /emprestimos:
 *   post:
 *     summary: Registra um novo empréstimo
 *     tags: [Empréstimos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leitor_id:              { type: integer }
 *               livro_id:               { type: integer }
 *               data_emprestimo:        { type: string, format: date }
 *               data_prevista_devolucao: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Empréstimo registrado
 *       400:
 *         description: Livro indisponível ou leitor inativo
 */
router.post('/emprestimos', authenticateToken, authorize('admin', 'bibliotecario'), emprestimoController.postEmprestimo);

/**
 * @swagger
 * /emprestimos/{id}/devolver:
 *   put:
 *     summary: Registra a devolução de um livro
 *     tags: [Empréstimos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Devolução registrada
 */
router.put('/emprestimos/:id/devolver', authenticateToken, authorize('admin', 'bibliotecario'), emprestimoController.registrarDevolucao);

module.exports = router;
