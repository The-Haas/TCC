const decodeRoute = require('./decode');
const cadastroClienteRoute = require('./cadastroCliente');

module.exports = (app) => {
    decodeRoute(app);
    cadastroClienteRoute(app);
}