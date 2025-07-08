const { validarTokenController } = require('../controllers/validarJWT.js');
const autenticarJWT = require('../middlewares/autenticarJWT.js');

module.exports = (app) => {
  app.get('/validarToken', autenticarJWT, validarTokenController);
};
