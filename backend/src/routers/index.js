const importaxmlRoute = require('./pedidos');
const loginRoute = require('./login');
const clientesRoute = require('./clientes');
const representantesRoute = require('./representantes');
const lojistasRoute = require('./lojistas');

module.exports = (app) => {
    importaxmlRoute(app);
    loginRoute(app);
    clientesRoute(app);
    representantesRoute(app);
    lojistasRoute(app);
}