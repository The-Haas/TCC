// middlewares/autorizacao.js

const permitirCliente = (req, res, next) => {
  if (req.usuario.perfil !== 'cliente') {
    return res.status(403).json({ erro: 'Acesso restrito a clientes' });
  }
  next();
};

const permitirOperador = (req, res, next) => {
  if (req.usuario.perfil !== 'operador') {
    return res.status(403).json({ erro: 'Acesso restrito a operadores' });
  }
  next();
};

module.exports = {
  permitirCliente,
  permitirOperador
};
