// models/relational/emprestimo.js
// Model de Empréstimo — associa um Leitor a um Livro com datas e status

module.exports = (sequelize, Sequelize) => {
  const Emprestimo = sequelize.define('emprestimo', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    // leitor_id e livro_id são as chaves estrangeiras (definidas no db.js via hasMany/belongsTo)
    leitor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    livro_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    data_emprestimo: {
      type: Sequelize.DATEONLY, // apenas data, sem horário
      allowNull: false,
    },
    data_prevista_devolucao: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    // data_real_devolucao é nula até o livro ser devolvido
    data_real_devolucao: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    // Status: aberto = ainda emprestado, devolvido = livro entregue, atrasado = passou da data
    status: {
      type: Sequelize.ENUM('aberto', 'devolvido', 'atrasado'),
      allowNull: false,
      defaultValue: 'aberto',
    },
  });

  return Emprestimo;
};
