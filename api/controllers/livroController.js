// controllers/livroController.js
// Gerencia o cadastro, listagem, busca, edição e exclusão de livros
// Apostila cap19/20: uso correto dos verbos HTTP e status codes

const { Op } = require('sequelize'); // Op permite usar operadores como LIKE, OR etc.
const db = require('../config/db');

module.exports = {
  // GET /livros — lista todos os livros, com filtros opcionais por query string
  // Exemplos: /livros?titulo=harry, /livros?categoria=ficção, /livros?disponivel=true
  async getLivros(req, res) {
    try {
      const { titulo, autor, categoria, isbn, disponivel } = req.query;
      const where = {};

      // Op.iLike = busca sem diferenciar maiúsculas/minúsculas (case-insensitive no Postgres)
      if (titulo)    where.titulo    = { [Op.iLike]: `%${titulo}%` };
      if (autor)     where.autor     = { [Op.iLike]: `%${autor}%` };
      if (categoria) where.categoria = { [Op.iLike]: `%${categoria}%` };
      if (isbn)      where.isbn      = isbn;

      // Filtro de disponibilidade: só retorna livros com quantidade_disponivel > 0
      if (disponivel === 'true') where.quantidade_disponivel = { [Op.gt]: 0 };

      const livros = await db.Livro.findAll({ where });
      res.status(200).json(livros);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar livros' });
    }
  },

  // GET /livros/:id — busca um livro por ID
  async getLivroById(req, res) {
    try {
      const livro = await db.Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });
      res.status(200).json(livro);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar livro' });
    }
  },

  // POST /livros — cadastra um novo livro (admin ou bibliotecario)
  async postLivro(req, res) {
    try {
      const { titulo, autor, editora, ano_publicacao, categoria, isbn, quantidade_total } = req.body;

      // quantidade_disponivel começa igual ao total ao cadastrar
      const livro = await db.Livro.create({
        titulo, autor, editora, ano_publicacao, categoria, isbn,
        quantidade_total,
        quantidade_disponivel: quantidade_total,
      });

      res.status(201).json(livro);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'ISBN já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao cadastrar livro' });
    }
  },

  // PUT /livros/:id — edita um livro (admin ou bibliotecario)
  async putLivro(req, res) {
    try {
      const livro = await db.Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });

      await livro.update(req.body);
      res.status(200).json({ message: 'Livro atualizado com sucesso' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar livro' });
    }
  },

  // DELETE /livros/:id — exclui um livro (apenas admin)
  async deleteLivro(req, res) {
    try {
      const livro = await db.Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ error: 'Livro não encontrado' });
      await livro.destroy();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Erro ao deletar livro' });
    }
  },
};
