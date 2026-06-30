// controllers/authController.js
// Baseado na apostila cap22 (APIs - Parte 5)
// Responsável pelo login e geração do token JWT

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const secretKey = 'sua_chave_secreta_biblioteca'; // deve ser a mesma do middleware

module.exports = {
  // Rota POST /login
  // Recebe login e senha, verifica no banco, e retorna o token JWT
  async login(req, res) {
    try {
      const { login, senha } = req.body;

      // Busca o usuário pelo campo login
      const user = await db.Usuario.findOne({ where: { login } });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Compara a senha digitada com o hash armazenado no banco (bcrypt)
      const senhaCorreta = await bcrypt.compare(senha, user.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gera o token JWT com os dados do usuário
      const token = gerarToken(user);
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },
};

// Função auxiliar que gera o token JWT
// O payload contém id, login e tipo do usuário
// O tipo é usado pelo middleware authorize() para controle de acesso
function gerarToken(user) {
  const payload = {
    id: user.id,
    login: user.login,
    tipo: user.tipo, // 'admin', 'bibliotecario' ou 'leitor'
    nome: user.nome,
    leitor_id: user.leitor_id, // vincula ao registro da tabela "leitor" (só relevante quando tipo = 'leitor')
  };
  // Token expira em 8 horas (suficiente para um dia de uso)
  return jwt.sign(payload, secretKey, { expiresIn: '8h' });
}
