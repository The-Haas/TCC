const jwt = require('jsonwebtoken');

const autenticarJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }

    req.usuario = usuario; // dados do cliente
    next();
  });
};

module.exports = autenticarJWT;
