// models/relational/leitor.js
// Model de Leitor/Aluno — é diferente do Usuário do sistema
// Um Leitor é quem pega livros emprestados

module.exports = (sequelize, Sequelize) => {
  const Leitor = sequelize.define('leitor', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    nome: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    // CPF ou Registro Acadêmico do aluno
    cpf_ra: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    telefone: {
      type: Sequelize.STRING,
    },
    endereco: {
      type: Sequelize.STRING,
    },
    // Leitor inativo não pode fazer empréstimos (regra do projeto)
    status: {
      type: Sequelize.ENUM('ativo', 'inativo'),
      allowNull: false,
      defaultValue: 'ativo',
    },
  });

  return Leitor;
};
