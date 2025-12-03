const usuarioController = require('../controllers/usuarios');

// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {

    app.post('/usuarios', usuarioController.postUsuario);
};
