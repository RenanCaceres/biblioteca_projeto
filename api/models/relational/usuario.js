// models/relational/usuario.js
// Model de Usuário do sistema (Administrador, Bibliotecário ou Leitor)
// Padrão da apostila cap11: exporta uma função que recebe (sequelize, Sequelize)

module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define('usuario', {
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
    login: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // login deve ser único no sistema
    },
    senha: {
      type: Sequelize.STRING,
      allowNull: false, // senha armazenada com hash bcrypt
    },
    // Tipo define o nível de acesso: admin, bibliotecario ou leitor
    tipo: {
      type: Sequelize.ENUM('admin', 'bibliotecario', 'leitor'),
      allowNull: false,
      defaultValue: 'leitor',
    },
    // Vincula este usuário de login a um registro da tabela "leitor"
    // Só é usado quando tipo = 'leitor': é o que permite ao leitor
    // consultar os próprios empréstimos (ver leitorController.getEmprestimosByLeitor)
    leitor_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  });

  return Usuario;
};
