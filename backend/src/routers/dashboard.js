const dashboardController = require('../controllers/dashboard');
const autenticarToken = require('../middlewares/auth');
const { apenasCliente, apenasLojista } = require('../middlewares/dashboard');

module.exports = (app) => {
    app.get('/dashboard/cliente', autenticarToken, apenasCliente, dashboardController.getDashboardCliente);
    app.get('/dashboard/lojista', autenticarToken, apenasLojista, dashboardController.getDashboardLojista);
};