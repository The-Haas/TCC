const importaxmlRoute = require('./pedidos');
const loginRoute = require('./login');
const clientesRoute = require('./clientes');
const representantesRoute = require('./representantes');
const lojistasRoute = require('./lojistas');
const adminsRoute = require('./admins');
const statusPedidoRoute = require('./statusPedido');

module.exports = (app) => {
    importaxmlRoute(app);
    loginRoute(app);
    clientesRoute(app);
    representantesRoute(app);
    lojistasRoute(app);
    adminsRoute(app);
    statusPedidoRoute(app);
}