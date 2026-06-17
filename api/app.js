// app.js
// Ponto de entrada da API — baseado nas apostilas da disciplina
// Configura Express, CORS (cap27), Swagger e inicializa o banco

const express = require('express');
const cors    = require('cors'); // cap27: necessário para o frontend React acessar a API
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const db = require('./config/db');
const routes = require('./routes/routes');

const app  = express();
const PORT = 3001;

// Habilita CORS para que o frontend (porta 5173 do Vite) possa chamar a API (porta 3001)
// Conforme a apostila cap27, é obrigatório ao usar frontend separado da API
app.use(cors());

// Permite que o Express leia o corpo das requisições em formato JSON
app.use(express.json());

// Rota da documentação Swagger — acessível em http://localhost:3001/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Monta todas as rotas da aplicação com o prefixo /api
app.use('/api', routes);

// Sincroniza os models com o banco de dados
// sync({ alter: true }) atualiza as tabelas existentes sem apagar os dados
// (use { force: true } apenas para recriar tudo do zero durante desenvolvimento)
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Banco de dados sincronizado com sucesso!');
    // Cria o usuário administrador padrão se não existir
    criarAdminPadrao();
  })
  .catch(err => console.error('Erro ao sincronizar banco:', err));

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});

// Cria um admin padrão na primeira execução para facilitar o acesso inicial
async function criarAdminPadrao() {
  const bcrypt = require('bcryptjs');
  const existente = await db.Usuario.findOne({ where: { login: 'admin' } });
  if (!existente) {
    const senhaHash = await bcrypt.hash('admin123', 10);
    await db.Usuario.create({ nome: 'Administrador', login: 'admin', senha: senhaHash, tipo: 'admin' });
    console.log('Admin padrão criado — login: admin | senha: admin123');
  }
}
