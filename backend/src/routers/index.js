const decodeRoute = require('./decode');
const loginRoute = require('./login');
const cadastroClienteRoute = require('./cadastroCliente');
const validarJWT = require('./validarJWT');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    cadastroClienteRoute(app);
    validarJWT(app);
}