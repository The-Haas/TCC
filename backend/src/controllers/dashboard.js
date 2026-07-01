const dashboardService = require('../services/dashboard.js');

async function getDashboardCliente(req, res) {
    const resultado = await dashboardService.getDashboardCliente(req.user.id);

    if (resultado.success) {
        res.status(200).json(resultado.dashboard);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    getDashboardCliente
};