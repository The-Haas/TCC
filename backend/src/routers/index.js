const decodeRoute = require('./decode');
const loginRoute = require('./loginCliente');
const cadastroClienteRoute = require('./cadastroCliente');
const loginCliente = require('./loginCliente');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    cadastroClienteRoute(app);
    loginCliente(app);
}