const representantesService = require('../services/representantes');


async function postRepresentante(req, res) {
    const resultado = await representantesService.postRepresentante(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getRepresentantes(req, res) {
    const resultado = await representantesService.getRepresentantes();

    if (resultado.success) {
        res.status(200).json(resultado.representantes);
    } else {
        res.status(400).json(resultado);
    }
}

async function getRepresentanteById(req, res) {
    const { id } = req.params;
    const resultado = await representantesService.getRepresentanteById(id);

    if (resultado.success) {
        res.status(200).json(resultado.representante);
    } else {
        res.status(404).json(resultado);
    }
}

async function putRepresentante(req, res) {
    const { id } = req.params;
    const resultado = await representantesService.putRepresentante(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.representante);
    } else {
        res.status(404).json(resultado);
    }
}

async function patchRepresentante(req, res) {
    const { id } = req.params;
    const resultado = await representantesService.patchRepresentante(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.representante);
    } else {
        res.status(404).json(resultado);
    }
}

async function deleteRepresentante(req, res) {
    const { id } = req.params;
    const resultado = await representantesService.deleteRepresentante(id);

    if (resultado.success) {
        res.status(200).json({ message: resultado.message });
    } else {
        res.status(404).json(resultado);
    }
}

module.exports = {
    postRepresentante,
    getRepresentantes,
    getRepresentanteById,
    putRepresentante,
    patchRepresentante,
    deleteRepresentante
};