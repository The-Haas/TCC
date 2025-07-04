const decodeRoute = require('./decode');
const loginRoute = require('./login');
const cadastroClienteRoute = require('./cadastroCliente');

module.exports = (app) => {
    decodeRoute(app);
    loginRoute(app);
    cadastroClienteRoute(app);
}