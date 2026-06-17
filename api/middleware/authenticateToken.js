// middleware/authenticateToken.js
// Baseado EXATAMENTE na apostila cap22 (APIs - Parte 5)
// Esse middleware intercepta a requisição e verifica se o token JWT é válido
// Se válido, libera o acesso à rota; se não, retorna 401 ou 403

const jwt = require('jsonwebtoken');
const secretKey = 'sua_chave_secreta_biblioteca'; // mesma chave usada no authController

function authenticateToken(req, res, next) {
  // Pega o cabeçalho Authorization da requisição
  // O formato esperado é: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // pega só o token após "Bearer "

  if (!token) {
    return res.sendStatus(401); // 401 = não autenticado (sem token)
  }

  // Verifica se o token é válido usando a chave secreta
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403); // 403 = token inválido ou expirado
    }
    // Salva os dados do usuário decodificados dentro de req.user
    // Assim os controllers podem acessar req.user.id, req.user.tipo etc.
    req.user = user;
    next(); // libera a requisição para o próximo handler (o controller)
  });
}

// Middleware que verifica se o usuário tem o tipo exigido (ex: 'admin')
// Uso: authorize('admin') ou authorize('admin', 'bibliotecario')
function authorize(...tipos) {
  return (req, res, next) => {
    if (!tipos.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso não autorizado para este perfil' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorize };
