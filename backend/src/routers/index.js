const importaxmlRoute = require('./pedidos');
const loginRoute = require('./login');
const clientesRoute = require('./clientes');
const representantesRoute = require('./representantes');
const lojistasRoute = require('./lojistas');
const adminsRoute = require('./admins');

module.exports = (app) => {
    importaxmlRoute(app);
    loginRoute(app);
    clientesRoute(app);
    representantesRoute(app);
    lojistasRoute(app);
    adminsRoute(app);
}