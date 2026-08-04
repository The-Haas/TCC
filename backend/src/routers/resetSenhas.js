const authController = require('../controllers/resetSenhas.js');
const { validarRequisicaoEsqueceuSenha } = require('../middlewares/resetSenhas.js');

module.exports = (app) => {
    // Rota 1: Pede o código por e-mail
    app.post('/resetsenha', validarRequisicaoEsqueceuSenha, authController.esqueceuSenha);

    // Rota 2: Redefine a senha de fato
    app.post('/redefinir-senha', authController.redefinir);
};