const importaxmlRoute = require('./importaxml');
const usuarioRoute = require('./usuarios');
const loginRoute = require('./login');

module.exports = (app) => {
    importaxmlRoute(app);
    usuarioRoute(app);
    loginRoute(app);
}