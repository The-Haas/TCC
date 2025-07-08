const { validarTokenController } = require('../controllers/autenticarJWT.js');
const autenticarJWT = require('../middlewares/autenticarJWT');

module.exports = (app) => {
  app.get('/validarToken', autenticarJWT, validarTokenController);
};
