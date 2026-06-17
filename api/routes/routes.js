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
router.put('/usuarios/:id', authenticateToken, authorize('admin'), usuarioController.putUsuario);
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
 *         name: disponivel
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de livros
 */
router.get('/livros', authenticateToken, livroController.getLivros);
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
router.put('/livros/:id', authenticateToken, authorize('admin', 'bibliotecario'), livroController.putLivro);
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
router.get('/leitores/:id', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.getLeitorById);
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
router.put('/leitores/:id', authenticateToken, authorize('admin', 'bibliotecario'), leitorController.putLeitor);
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
 *     responses:
 *       200:
 *         description: Lista de empréstimos
 */
router.get('/emprestimos', authenticateToken, authorize('admin', 'bibliotecario'), emprestimoController.getEmprestimos);
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
