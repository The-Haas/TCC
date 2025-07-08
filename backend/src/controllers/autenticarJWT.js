const { validarToken } = require('../services/autenticarJWT.js');

const validarTokenController = (req, res) => {
  try {
    const dadosUsuario = validarToken(req.usuario);
    return res.status(200).json({
      mensagem: 'Token válido',
      usuario: dadosUsuario
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao validar token' });
  }
};

module.exports = {
  validarTokenController
};
