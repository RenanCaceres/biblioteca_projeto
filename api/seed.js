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

  // Cria alguns leitores (alunos) de exemplo
  // IMPORTANTE: isso precisa acontecer ANTES de criar os usuários de login,
  // pois os usuários do tipo 'leitor' são vinculados a esses registros
  // (via cpf_ra) logo abaixo.
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

  // Cria os usuários do sistema (quem faz login)
  // Observação: usuários do tipo 'leitor' precisam ser vinculados a um
  // registro da tabela "leitor" (campo leitor_id) para poderem consultar
  // seus próprios empréstimos. Esse vínculo é feito logo abaixo, usando
  // os leitores criados no bloco acima.
  const usuarios = [
    { nome: 'Administrador', login: 'admin', senha: 'admin123', tipo: 'admin' },
    { nome: 'Bibliotecário João', login: 'joao', senha: 'joao123', tipo: 'bibliotecario' },
    { nome: 'Leitor Ana', login: 'ana', senha: 'ana123', tipo: 'leitor', cpf_ra: '111.111.111-11' },
    { nome: 'Leitor Pedro', login: 'pedro', senha: 'pedro123', tipo: 'leitor', cpf_ra: '222.222.222-22' },
  ];

  for (const u of usuarios) {
    const existe = await db.Usuario.findOne({ where: { login: u.login } });
    if (!existe) {
      const senhaHash = await bcrypt.hash(u.senha, 10);
      // Se o usuário for do tipo 'leitor', busca o registro correspondente
      // na tabela "leitor" (pelo cpf_ra) e salva o id como leitor_id
      let leitor_id = null;
      if (u.tipo === 'leitor' && u.cpf_ra) {
        const leitorVinculado = await db.Leitor.findOne({ where: { cpf_ra: u.cpf_ra } });
        if (leitorVinculado) leitor_id = leitorVinculado.id;
      }
      await db.Usuario.create({ nome: u.nome, login: u.login, senha: senhaHash, tipo: u.tipo, leitor_id });
      console.log(`Usuário criado: ${u.login} (${u.tipo})`);
    } else {
      console.log(`Usuário já existe: ${u.login}`);
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
