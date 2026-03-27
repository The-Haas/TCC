const importaxmlRoute = require('./pedidos');
const loginRoute = require('./login');
const clientesRoute = require('./clientes');

module.exports = (app) => {
    importaxmlRoute(app);
    loginRoute(app);
    clientesRoute(app);
}