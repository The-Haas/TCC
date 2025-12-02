const importaxmlRoute = require('./importaxml');
const usuarioRoute = require('./usuarios');
const loginRoute = require('./login');
const clientesRoute = require('./clientes');

module.exports = (app) => {
    importaxmlRoute(app);
    usuarioRoute(app);
    loginRoute(app);
    clientesRoute(app);
}