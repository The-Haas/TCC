const decodeRoute = require('./decode');
const loginRoute = require('./login');
const cadastroClienteRoute = require('./cadastroCliente');
const autenticarJWT = require('./autenticarJWT');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    cadastroClienteRoute(app);
    autenticarJWT(app);
}