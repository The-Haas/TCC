const statusService = require('../services/statusPedido');

async function postStatus(req, res) {
    const resultado = await statusService.postStatus(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getStatus(req, res) {
    const resultado = await statusService.getStatus();

    if (resultado.success) {
        res.status(200).json(resultado.status);
    } else {
        res.status(400).json(resultado);
    }
}

async function getStatusById(req, res) {
    const { id } = req.params;
    const resultado = await statusService.getStatusById(id);

    if (resultado.success) {
        res.status(200).json(resultado.status);
    } else {
        res.status(404).json(resultado);
    }
}

async function putStatus(req, res) {
    const { id } = req.params;
    const resultado = await statusService.putStatus(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.status);
    } else {
        res.status(400).json(resultado);
    }
}

async function patchStatus(req, res) {
    const { id } = req.params;
    const resultado = await statusService.patchStatus(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.status);
    } else {
        res.status(400).json(resultado);
    }
}

async function deleteStatus(req, res) {
    const { id } = req.params;
    const id_novo_padrao = req.body?.id_novo_padrao || null;
    const resultado = await statusService.deleteStatus(id, id_novo_padrao);

    if (resultado.success) {
        res.status(200).json({ message: resultado.message });
    } else {
        res.status(400).json(resultado);
    }
}

module.exports = {
    postStatus,
    getStatus,
    getStatusById,
    putStatus,
    patchStatus,
    deleteStatus
};