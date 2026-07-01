const dashboardController = require('../controllers/dashboard');
const autenticarToken = require('../middlewares/auth');
const { apenasCliente } = require('../middlewares/dashboard');

module.exports = (app) => {
    app.get('/dashboard/cliente', autenticarToken, apenasCliente, dashboardController.getDashboardCliente);
};