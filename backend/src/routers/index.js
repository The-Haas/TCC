const decodeRoute = require('./decode');
const loginRoute = require('./login');
const cadastroClienteRoute = require('./cadastroCliente');
const validarJWT = require('./validarJWT');
const redefinirSenha = require('./redefinirSenha');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    cadastroClienteRoute(app);
    validarJWT(app);
    redefinirSenha(app);
}