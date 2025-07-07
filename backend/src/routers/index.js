const decodeRoute = require('./decode');
const loginRoute = require('./login');
const logoutRoute = require('./logout');
const cadastroClienteRoute = require('./cadastroCliente');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    logoutRoute(app);
    cadastroClienteRoute(app);
}