const { validarTokenController } = require('../controllers/validarJWT.js');
const autenticarJWT = require('../middlewares/autenticarJWT.js');
const { permitirCliente, permitirOperador } = require('../middlewares/autorizar.js');

module.exports = (app) => {
  // Rota para validar token e liberar só para clientes
  app.get('/validarToken/cliente', autenticarJWT, permitirCliente, validarTokenController);

  // Rota para validar token e liberar só para operadores
  app.get('/validarToken/operador', autenticarJWT, permitirOperador, validarTokenController);
};
