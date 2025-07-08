const controller = require('../controllers/redefinirSenha');

module.exports = (app) => {
  app.post('/redefinirSenha', controller.redefinirSenhaController);
};