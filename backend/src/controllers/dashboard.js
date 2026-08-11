const dashboardService = require('../services/dashboard.js');

async function getDashboardCliente(req, res) {
    const resultado = await dashboardService.getDashboardCliente(req.user.id);

    if (resultado.success) {
        res.status(200).json(resultado.dashboard);
    } else {
        res.status(400).json(resultado);
    }
}

async function getDashboardLojista(req, res) {
    // Pegamos os filtros que o frontend vai mandar pela URL
    const { dataInicio, dataFim, agrupamento } = req.query;

    // Passamos os filtros como um objeto para o Service
    const resultado = await dashboardService.getDashboardLojista(req.user.id, {
        dataInicio, 
        dataFim, 
        agrupamento
    });

    if (resultado.success) {
        res.status(200).json(resultado.dashboard);
    } else {
        res.status(400).json(resultado);
    }
}

async function getDashboardRepresentante(req, res) {
    // Pegamos os filtros que o frontend vai mandar pela URL
    const { dataInicio, dataFim, agrupamento } = req.query;

    // Passamos os filtros para o Service, usando o id do usuário logado (representante)
    const resultado = await dashboardService.getDashboardRepresentante(req.user.id, {
        dataInicio, 
        dataFim, 
        agrupamento
    });

    if (resultado.success) {
        res.status(200).json(resultado.dashboard);
    } else {
        res.status(400).json(resultado);
    }
}

async function getDashboardAdmin(req, res) {
    const { dataInicio, dataFim, agrupamento } = req.query;

    const resultado = await dashboardService.getDashboardAdmin({
        dataInicio, 
        dataFim, 
        agrupamento
    });

    if (resultado.success) {
        // Agora retornamos o objeto completo (contendo success, data, graficos, etc)
        res.status(200).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    getDashboardCliente,
    getDashboardLojista,
    getDashboardRepresentante,
    getDashboardAdmin
};