const adminService = require('../services/admins');

async function postAdmin(req, res) {
    const resultado = await adminService.postAdmin(req.body);

    if (resultado.success) {
        res.status(201).json(resultado);
    } else {
        res.status(400).json(resultado);
    }
}

async function getAdmins(req, res) {
    const resultado = await adminService.getAdmins();

    if (resultado.success) {
        res.status(200).json(resultado.admins);
    } else {
        res.status(400).json(resultado);
    }
}

async function getAdminById(req, res) {
    const { id } = req.params;
    const resultado = await adminService.getAdminById(id);

    if (resultado.success) {
        res.status(200).json(resultado.admin);
    } else {
        res.status(404).json(resultado);
    }
}

async function putAdmin(req, res) {
    const { id } = req.params;
    const resultado = await adminService.putAdmin(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.admin);
    } else {
        res.status(400).json(resultado);
    }
}

async function patchAdmin(req, res) {
    const { id } = req.params;
    const resultado = await adminService.patchAdmin(id, req.body);

    if (resultado.success) {
        res.status(200).json(resultado.admin);
    } else {
        res.status(400).json(resultado);
    }
}

async function deleteAdmin(req, res) {
    const { id } = req.params;
    const resultado = await adminService.deleteAdmin(id);

    if (resultado.success) {
        res.status(200).json({ message: resultado.message });
    } else {
        res.status(404).json(resultado);
    }
}

module.exports = {
    postAdmin,
    getAdmins,
    getAdminById,
    putAdmin,
    patchAdmin,
    deleteAdmin
};