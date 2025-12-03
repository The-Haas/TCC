const clienteService = require('../services/clientes');

async function postCliente(req, res) {
    const resultado = await clienteService.postCliente(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postCliente
};
