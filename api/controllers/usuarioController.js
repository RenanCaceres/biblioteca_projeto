// controllers/usuarioController.js
// Gerencia os usuários do sistema (quem faz login)
// Apenas admins podem criar, editar e excluir usuários

const bcrypt = require('bcryptjs');
const db = require('../config/db');

module.exports = {
  // GET /usuarios — lista todos os usuários (admin)
  async getUsuarios(req, res) {
    try {
      // Busca todos sem retornar a senha (campo omitido no attributes)
      const usuarios = await db.Usuario.findAll({
        attributes: ['id', 'nome', 'login', 'tipo'],
      });
      res.status(200).json(usuarios);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  // GET /usuarios/:id — busca um usuário específico
  async getUsuarioById(req, res) {
    try {
      const usuario = await db.Usuario.findByPk(req.params.id, {
        attributes: ['id', 'nome', 'login', 'tipo'],
      });
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.status(200).json(usuario);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  },

  // POST /usuarios — cria um novo usuário (admin)
  async postUsuario(req, res) {
    try {
      const { nome, login, senha, tipo } = req.body;

      // Criptografa a senha antes de salvar no banco (bcrypt, custo 10)
      const senhaHash = await bcrypt.hash(senha, 10);

      const usuario = await db.Usuario.create({ nome, login, senha: senhaHash, tipo });
      res.status(201).json({ id: usuario.id, nome: usuario.nome, login: usuario.login, tipo: usuario.tipo });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Login já está em uso' });
      }
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  // PUT /usuarios/:id — edita um usuário (admin)
  async putUsuario(req, res) {
    try {
      const { nome, login, senha, tipo } = req.body;
      const usuario = await db.Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Se uma nova senha for enviada, recriptografa; senão mantém a atual
      const senhaHash = senha ? await bcrypt.hash(senha, 10) : usuario.senha;

      await usuario.update({ nome, login, senha: senhaHash, tipo });
      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  // DELETE /usuarios/:id — remove um usuário (admin)
  async deleteUsuario(req, res) {
    try {
      const usuario = await db.Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
      await usuario.destroy();
      res.status(204).send(); // 204 = sucesso sem conteúdo de retorno
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  },
};
