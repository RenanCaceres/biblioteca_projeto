// controllers/emprestimoController.js
// Controla registro de empréstimos, devoluções e consultas
// Aplica as regras do projeto: livro disponível, leitor ativo, atualização de quantidade

const db = require('../config/db');
const { Op } = require('sequelize');

module.exports = {
  // GET /emprestimos — lista todos os empréstimos com filtros opcionais

  async getEmprestimos(req, res) {
    try {
      const { status, leitor_id, data, data_inicio, data_fim } = req.query;
      const where = {};

      if (status)    where.status    = status;
      if (leitor_id) where.leitor_id = leitor_id;

      // Filtro por data do empréstimo
      if (data) {
        where.data_emprestimo = data;
      } else if (data_inicio || data_fim) {
        where.data_emprestimo = {};
        if (data_inicio) where.data_emprestimo[Op.gte] = data_inicio;
        if (data_fim)    where.data_emprestimo[Op.lte] = data_fim;
      }

      // Verifica automaticamente empréstimos atrasados antes de retornar
      // (atualiza no banco quem passou da data_prevista_devolucao e ainda está "aberto")
      await atualizarAtrasados();

      const emprestimos = await db.Emprestimo.findAll({
        where,
        // include faz JOINs para trazer dados do leitor e do livro junto com o empréstimo
        include: [
          { model: db.Leitor, attributes: ['nome', 'cpf_ra'] },
          { model: db.Livro,  attributes: ['titulo', 'autor'] },
        ],
        order: [['data_emprestimo', 'DESC']], // mais recentes primeiro
      });

      res.status(200).json(emprestimos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar empréstimos' });
    }
  },

  // GET /emprestimos/:id — busca um empréstimo por ID
  async getEmprestimoById(req, res) {
    try {
      const emprestimo = await db.Emprestimo.findByPk(req.params.id, {
        include: [
          { model: db.Leitor, attributes: ['nome', 'cpf_ra'] },
          { model: db.Livro,  attributes: ['titulo', 'autor'] },
        ],
      });
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      res.status(200).json(emprestimo);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar empréstimo' });
    }
  },

  // POST /emprestimos — registra um novo empréstimo
  // Regras: leitor deve estar ativo e livro deve ter quantidade disponível
  async postEmprestimo(req, res) {
    try {
      const { leitor_id, livro_id, data_emprestimo, data_prevista_devolucao } = req.body;

      // Verifica se o leitor existe e está ativo
      const leitor = await db.Leitor.findByPk(leitor_id);
      if (!leitor) return res.status(404).json({ error: 'Leitor não encontrado' });
      if (leitor.status === 'inativo') {
        return res.status(400).json({ error: 'Leitor inativo não pode fazer empréstimos' });
      }

      // Verifica se o livro existe e tem exemplares disponíveis
      const livro = await db.Livro.findByPk(livro_id);
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });
      if (livro.quantidade_disponivel <= 0) {
        return res.status(400).json({ error: 'Livro indisponível no momento' });
      }

      // Cria o empréstimo
      const emprestimo = await db.Emprestimo.create({
        leitor_id, livro_id, data_emprestimo, data_prevista_devolucao,
        status: 'aberto',
      });

      // Diminui a quantidade disponível do livro (regra do projeto)
      await livro.update({ quantidade_disponivel: livro.quantidade_disponivel - 1 });

      res.status(201).json(emprestimo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao registrar empréstimo' });
    }
  },

  // PUT /emprestimos/:id/devolver — registra a devolução de um livro
  // Aumenta a quantidade disponível do livro e marca o status como 'devolvido'
  async registrarDevolucao(req, res) {
    try {
      const emprestimo = await db.Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ error: 'Empréstimo não encontrado' });
      if (emprestimo.status === 'devolvido') {
        return res.status(400).json({ error: 'Livro já foi devolvido' });
      }

      const hoje = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      await emprestimo.update({ status: 'devolvido', data_real_devolucao: hoje });

      // Aumenta a quantidade disponível do livro (regra do projeto)
      const livro = await db.Livro.findByPk(emprestimo.livro_id);
      await livro.update({ quantidade_disponivel: livro.quantidade_disponivel + 1 });

      res.status(200).json({ message: 'Devolução registrada com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao registrar devolução' });
    }
  },
};

// Função auxiliar: atualiza para 'atrasado' todos os empréstimos abertos cuja
// data_prevista_devolucao já passou. Chamada antes de listar os empréstimos.
async function atualizarAtrasados() {
  const hoje = new Date().toISOString().split('T')[0];
  await db.Emprestimo.update(
    { status: 'atrasado' },
    {
      where: {
        status: 'aberto',
        data_prevista_devolucao: { [Op.lt]: hoje }, // menor que hoje = atrasado
      },
    }
  );
}
