// controllers/leitorController.js
// Gerencia os leitores/alunos que fazem empréstimos

const { Op } = require('sequelize');
const db = require('../config/db');

module.exports = {
  // GET /leitores — lista todos os leitores, com filtro opcional por nome ou cpf_ra
  async getLeitores(req, res) {
    try {
      const { nome, cpf_ra } = req.query;
      const where = {};

      if (nome)   where.nome   = { [Op.iLike]: `%${nome}%` };
      if (cpf_ra) where.cpf_ra = cpf_ra;

      const leitores = await db.Leitor.findAll({ where });
      res.status(200).json(leitores);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar leitores' });
    }
  },

  // GET /leitores/:id — busca um leitor por ID
  async getLeitorById(req, res) {
    try {
      const leitor = await db.Leitor.findByPk(req.params.id);
      if (!leitor) return res.status(404).json({ error: 'Leitor não encontrado' });
      res.status(200).json(leitor);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar leitor' });
    }
  },

  // POST /leitores — cadastra um novo leitor (admin ou bibliotecario)
  async postLeitor(req, res) {
    try {
      const { nome, cpf_ra, email, telefone, endereco } = req.body;
      const leitor = await db.Leitor.create({ nome, cpf_ra, email, telefone, endereco });
      res.status(201).json(leitor);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'CPF/RA já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao cadastrar leitor' });
    }
  },

  // PUT /leitores/:id — edita um leitor (admin ou bibliotecario)
  async putLeitor(req, res) {
    try {
      const leitor = await db.Leitor.findByPk(req.params.id);
      if (!leitor) return res.status(404).json({ error: 'Leitor não encontrado' });
      await leitor.update(req.body);
      res.status(200).json({ message: 'Leitor atualizado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar leitor' });
    }
  },

  // DELETE /leitores/:id — exclui um leitor (apenas admin)
  async deleteLeitor(req, res) {
    try {
      const leitor = await db.Leitor.findByPk(req.params.id);
      if (!leitor) return res.status(404).json({ error: 'Leitor não encontrado' });
      await leitor.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar leitor' });
    }
  },

  // GET /leitores/:id/emprestimos — histórico de empréstimos de um leitor
  async getEmprestimosByLeitor(req, res) {
    try {
      const leitorId = req.params.id;

      // Se o usuário logado for do tipo 'leitor', só pode ver os próprios empréstimos
      if (req.user.tipo === 'leitor' && req.user.leitor_id != leitorId) {
        return res.status(403).json({ error: 'Você só pode ver seus próprios empréstimos' });
      }

      // include faz JOIN com a tabela de livros para trazer o título junto
      const emprestimos = await db.Emprestimo.findAll({
        where: { leitor_id: leitorId },
        include: [{ model: db.Livro, attributes: ['titulo', 'autor'] }],
      });

      res.status(200).json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar empréstimos do leitor' });
    }
  },
};
