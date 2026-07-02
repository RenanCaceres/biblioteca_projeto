====================================================
  SISTEMA DE GERENCIAMENTO DE BIBLIOTECA
  Projeto 2 — Web 2 — UTFPR Cornélio Procópio
  Análise e Desenvolvimento de Sistemas
====================================================

------------------------------------------------------
O QUE É ESTE PROJETO?  
------------------------------------------------------
Um sistema web completo para gerenciar uma biblioteca,
com API backend em Node.js/Express e frontend em React.
Desenvolvido com base no conteúdo teórico da disciplina.

------------------------------------------------------
TECNOLOGIAS USADAS (E ONDE FORAM ENSINADAS)
------------------------------------------------------
Backend:
  - Node.js + Express        (Apostila cap3 - Rotas e Express)
  - Sequelize + PostgreSQL   (Apostila cap4/cap6 - ORM e Sequelize)
  - JWT (jsonwebtoken)       (Apostila cap22 - APIs Parte 5)
  - bcryptjs                 (Apostila cap22 - Hash de senha)
  - CORS                     (Apostila cap27 - React Parte 4)
  - Swagger                  (swagger-jsdoc + swagger-ui-express)
  - Padrão MVC               (Apostila cap11/12 - MVC)

Frontend:
  - React + Vite             (Apostila cap24/25/27 - React)
  - useState / useEffect     (Apostila cap24 - Props e States)
  - React Router DOM         (Apostila cap25 - SPA e Router)
  - localStorage para token  (Apostila cap27 - React Parte 4)
  - fetch() para chamar a API

------------------------------------------------------
ESTRUTURA DE PASTAS
------------------------------------------------------
biblioteca/
├── api/                      ← Backend Node.js
│   ├── app.js                ← Ponto de entrada (Express + CORS + Swagger)
│   ├── seed.js               ← Popula banco com dados iniciais
│   ├── package.json
│   ├── config/
│   │   ├── db.js             ← Conexão com PostgreSQL + importação dos models
│   │   └── swagger.js        ← Configuração da documentação Swagger
│   ├── models/
│   │   └── relational/
│   │       ├── usuario.js    ← Model: usuários do sistema (login)
│   │       ├── livro.js      ← Model: livros do acervo
│   │       ├── leitor.js     ← Model: alunos/leitores
│   │       └── emprestimo.js ← Model: empréstimos
│   ├── controllers/
│   │   ├── authController.js       ← Login e geração do JWT
│   │   ├── usuarioController.js    ← CRUD de usuários
│   │   ├── livroController.js      ← CRUD de livros + filtros
│   │   ├── leitorController.js     ← CRUD de leitores
│   │   └── emprestimoController.js ← Empréstimos e devoluções
│   ├── middleware/
│   │   └── authenticateToken.js  ← Verifica JWT (apostila cap22)
│   └── routes/
│       └── routes.js         ← Todas as rotas da API
│
└── frontend/                 ← Frontend React (Vite)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx           ← Renderiza o App no DOM
        ├── App.jsx            ← Rotas do React Router
        ├── services/
        │   └── api.js         ← Funções para chamar a API
        └── components/
            ├── layout/
            │   └── Navbar.jsx ← Barra de navegação
            └── pages/
                ├── LoginPage.jsx      ← Tela de login
                ├── LivrosPage.jsx     ← Cadastro e listagem de livros
                ├── LeitoresPage.jsx   ← Cadastro e listagem de leitores
                ├── EmprestimosPage.jsx ← Empréstimos e devoluções
                └── UsuariosPage.jsx   ← Gerenciar usuários (só admin)

------------------------------------------------------
PRÉ-REQUISITOS
------------------------------------------------------
1. Node.js instalado (versão 18 ou superior)
2. PostgreSQL instalado e rodando
3. Um banco de dados criado com o nome: biblioteca_db

Para criar o banco no PostgreSQL (via psql):
  CREATE DATABASE biblioteca_db;

------------------------------------------------------
COMO RODAR O PROJETO
------------------------------------------------------

PASSO 1 — Configurar o banco de dados
  Abra o arquivo api/config/db.js e ajuste:
    - 'biblioteca_db' → nome do banco (se mudou)
    - 'postgres'      → seu usuário do PostgreSQL
    - '1234'          → sua senha do PostgreSQL

PASSO 2 — Instalar dependências do backend
  cd biblioteca/api
  npm install

PASSO 3 — Iniciar a API
  node app.js
  
  O terminal vai mostrar:
  > Banco de dados sincronizado com sucesso!
  > Admin padrão criado — login: admin | senha: admin123
  > API rodando em http://localhost:3001
  > Swagger disponível em http://localhost:3001/api-docs

PASSO 4 (opcional) — Popular com dados de exemplo
  node seed.js
  
  Isso cria os 4 usuários mínimos do projeto + livros e leitores de exemplo.

PASSO 5 — Instalar dependências do frontend
  Abra outro terminal:
  cd biblioteca/frontend
  npm install

PASSO 6 — Iniciar o frontend
  npm run dev
  
  O terminal vai mostrar:
  > Local: http://localhost:5173

PASSO 7 — Acessar o sistema
  Abra no navegador: http://localhost:5173

------------------------------------------------------
USUÁRIOS PADRÃO (após rodar o seed.js)
------------------------------------------------------
  Login       Senha       Tipo
  ─────────────────────────────────────────────
  admin       admin123    Administrador
  joao        joao123     Bibliotecário
  ana         ana123      Leitor
  pedro       pedro123    Leitor

------------------------------------------------------
DOCUMENTAÇÃO DA API (SWAGGER)
------------------------------------------------------
Com a API rodando, acesse:
  http://localhost:3001/api-docs

Para testar rotas autenticadas no Swagger:
  1. Faça POST /api/login para obter o token
  2. Clique no botão "Authorize" (cadeado)
  3. Cole o token no campo e clique em Authorize

------------------------------------------------------
CONTROLE DE ACESSO (BASEADO NO TIPO DO USUÁRIO)
------------------------------------------------------
Admin:
  - Acessa tudo: usuários, livros, leitores, empréstimos
  - Único que pode EXCLUIR livros, leitores e usuários

Bibliotecário:
  - Cadastra/edita livros e leitores
  - Registra empréstimos e devoluções
  - Não pode excluir nem gerenciar usuários

Leitor:
  - Vê os livros disponíveis
  - Consulta apenas os próprios empréstimos
  - Não pode cadastrar nada

------------------------------------------------------
REGRAS DE NEGÓCIO IMPLEMENTADAS
------------------------------------------------------
✓ Leitor inativo não pode fazer empréstimo
✓ Livro sem estoque não pode ser emprestado
✓ Ao emprestar: quantidade_disponivel diminui em 1
✓ Ao devolver: quantidade_disponivel aumenta em 1
✓ Empréstimos passados da data são marcados como "atrasado"
✓ Leitor só vê os próprios empréstimos (pelo token)
✓ Todas as rotas protegidas por JWT

------------------------------------------------------
REFERÊNCIAS (APOSTILAS DA DISCIPLINA)
------------------------------------------------------
  - Cap 3:  Node.js + Express (rotas, HTTP)
  - Cap 4:  Sequelize Parte 1 (ORM, conexão)
  - Cap 6:  Sequelize Parte 2 (relacionamentos)
  - Cap 11: MVC Parte 1 (padrão de arquitetura)
  - Cap 12: MVC Parte 2 (models, controllers)
  - Cap 19: APIs Parte 2 (Richardson, REST)
  - Cap 20: APIs Parte 3 (Status Codes)
  - Cap 22: APIs Parte 5 (JWT, autenticação)
  - Cap 24: React Parte 1 e 2 (useState, props)
  - Cap 25: React Parte 3 (SPA, React Router)
  - Cap 27: React Parte 4 (CORS, localStorage, token)
