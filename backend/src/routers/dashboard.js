const dashboardController = require('../controllers/dashboard');
const autenticarToken = require('../middlewares/auth');
const { apenasCliente, apenasLojista, apenasRepresentante, apenasAdmin } = require('../middlewares/dashboard');

module.exports = (app) => {
    app.get('/dashboard/cliente', autenticarToken, apenasCliente, dashboardController.getDashboardCliente);
    app.get('/dashboard/lojista', autenticarToken, apenasLojista, dashboardController.getDashboardLojista);
    app.get('/dashboard/representante', autenticarToken, apenasRepresentante, dashboardController.getDashboardRepresentante);
    app.get('/dashboard/admin', autenticarToken, apenasAdmin, dashboardController.getDashboardAdmin);
};