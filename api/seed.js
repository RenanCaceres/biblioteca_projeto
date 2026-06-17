// seed.js
// Script para popular o banco com os usuários mínimos exigidos pelo projeto:
// 1 Admin, 1 Bibliotecário, 2 Leitores
// Execute com: node seed.js (dentro da pasta api/)

const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  // Sincroniza as tabelas (cria se não existirem)
  await db.sequelize.sync({ alter: true });
  console.log('Banco sincronizado.');

  // Cria os usuários do sistema (quem faz login)
  const usuarios = [
    { nome: 'Administrador', login: 'admin', senha: 'admin123', tipo: 'admin' },
    { nome: 'Bibliotecário João', login: 'joao', senha: 'joao123', tipo: 'bibliotecario' },
    { nome: 'Leitor Ana', login: 'ana', senha: 'ana123', tipo: 'leitor' },
    { nome: 'Leitor Pedro', login: 'pedro', senha: 'pedro123', tipo: 'leitor' },
  ];

  for (const u of usuarios) {
    const existe = await db.Usuario.findOne({ where: { login: u.login } });
    if (!existe) {
      const senhaHash = await bcrypt.hash(u.senha, 10);
      await db.Usuario.create({ ...u, senha: senhaHash });
      console.log(`Usuário criado: ${u.login} (${u.tipo})`);
    } else {
      console.log(`Usuário já existe: ${u.login}`);
    }
  }

  // Cria alguns leitores (alunos) de exemplo
  const leitores = [
    { nome: 'Ana Souza', cpf_ra: '111.111.111-11', email: 'ana@email.com', telefone: '(43) 99999-0001', endereco: 'Rua das Flores, 10', status: 'ativo' },
    { nome: 'Pedro Alves', cpf_ra: '222.222.222-22', email: 'pedro@email.com', telefone: '(43) 99999-0002', endereco: 'Av. Brasil, 200', status: 'ativo' },
  ];

  for (const l of leitores) {
    const existe = await db.Leitor.findOne({ where: { cpf_ra: l.cpf_ra } });
    if (!existe) {
      await db.Leitor.create(l);
      console.log(`Leitor criado: ${l.nome}`);
    }
  }

  // Cria alguns livros de exemplo
  const livros = [
    { titulo: 'Clean Code', autor: 'Robert C. Martin', editora: 'Alta Books', ano_publicacao: 2009, categoria: 'Programação', isbn: '978-85-7608-364-6', quantidade_total: 3, quantidade_disponivel: 3 },
    { titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', editora: 'Martins Fontes', ano_publicacao: 2001, categoria: 'Fantasia', isbn: '978-85-336-0481-5', quantidade_total: 2, quantidade_disponivel: 2 },
    { titulo: 'Dom Casmurro', autor: 'Machado de Assis', editora: 'Ática', ano_publicacao: 1899, categoria: 'Literatura Brasileira', isbn: '978-85-08-11389-4', quantidade_total: 5, quantidade_disponivel: 5 },
  ];

  for (const l of livros) {
    const existe = await db.Livro.findOne({ where: { isbn: l.isbn } });
    if (!existe) {
      await db.Livro.create(l);
      console.log(`Livro criado: ${l.titulo}`);
    }
  }

  console.log('\nSeed concluído! Credenciais de acesso:');
  console.log('  admin        / admin123  (Administrador)');
  console.log('  joao         / joao123   (Bibliotecário)');
  console.log('  ana          / ana123    (Leitor)');
  console.log('  pedro        / pedro123  (Leitor)');

  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
