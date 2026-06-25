const lojistasService = require('../services/lojistas');

async function postLojista(req, res) {
    const resultado = await lojistasService.postLojista(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getLojistas(req, res) {
    // ← passa o filtro injetado pelo middleware (null = admin, id = representante)
    const resultado = await lojistasService.getLojistas(req.filtroRepresentante);

    if (resultado.success) {
        res.status(200).json(resultado.lojistas);
    } else {
        res.status(400).json(resultado);
    }
}

async function getLojistaById(req, res) {
    const { id } = req.params;
    const resultado = await lojistasService.getLojistaById(id);

    if (resultado.success) {
        res.status(200).json(resultado.lojista);
    } else {
        res.status(404).json(resultado);
    }
}

async function putLojista(req, res) {
    const { id } = req.params;

    // ← Lojista não pode trocar o próprio id_representante
    if (req.user.tipo === 'lojista') {
        delete req.body.id_representante;
    }

    const resultado = await lojistasService.putLojista(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.lojista);
    } else {
        res.status(404).json(resultado);
    }
}

async function patchLojista(req, res) {
    const { id } = req.params;

    // ← Lojista não pode trocar o próprio id_representante
    if (req.user.tipo === 'lojista') {
        delete req.body.id_representante;
    }

    const resultado = await lojistasService.patchLojista(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.lojista);
    } else {
        res.status(404).json(resultado);
    }
}

async function deleteLojista(req, res) {
    const { id } = req.params;
    const resultado = await lojistasService.deleteLojista(id);

    if (resultado.success) {
        res.status(200).json({ message: resultado.message });
    } else {
        res.status(404).json(resultado);
    }
}

module.exports = {
    postLojista,
    getLojistas,
    getLojistaById,
    putLojista,
    patchLojista,
    deleteLojista
};