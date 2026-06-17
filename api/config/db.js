// config/db.js
// Baseado na apostila cap11 (config_sequelize.js)
// Configura a conexão com o banco PostgreSQL usando Sequelize
// e importa todos os models para que o Sequelize crie as tabelas automaticamente

const Sequelize = require('sequelize');

// Cria a instância do Sequelize com as credenciais do banco
// Ajuste 'biblioteca_db', 'postgres' e '1234' conforme seu ambiente
const sequelize = new Sequelize('biblioteca_db', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // desativa os logs SQL no terminal (coloque true para depurar)
});

// Objeto db que centraliza o Sequelize e todos os models
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importa cada model passando sequelize e Sequelize como parâmetro
// (padrão da apostila - o model recebe esses dois e define a tabela)
db.Usuario  = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Livro    = require('../models/relational/livro.js')(sequelize, Sequelize);
db.Leitor   = require('../models/relational/leitor.js')(sequelize, Sequelize);
db.Emprestimo = require('../models/relational/emprestimo.js')(sequelize, Sequelize);

// Define os relacionamentos entre as tabelas
// Um Leitor pode ter muitos Empréstimos
db.Leitor.hasMany(db.Emprestimo, { foreignKey: 'leitor_id' });
db.Emprestimo.belongsTo(db.Leitor, { foreignKey: 'leitor_id' });

// Um Livro pode aparecer em muitos Empréstimos
db.Livro.hasMany(db.Emprestimo, { foreignKey: 'livro_id' });
db.Emprestimo.belongsTo(db.Livro, { foreignKey: 'livro_id' });

module.exports = db;
