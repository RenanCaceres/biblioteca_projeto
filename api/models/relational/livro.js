// models/relational/livro.js
// Model de Livro — campos mínimos exigidos pelo projeto

module.exports = (sequelize, Sequelize) => {
  const Livro = sequelize.define('livro', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    titulo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    autor: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    editora: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ano_publicacao: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    categoria: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isbn: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    quantidade_total: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // quantidade_disponivel é atualizada a cada empréstimo/devolução
    quantidade_disponivel: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  return Livro;
};
