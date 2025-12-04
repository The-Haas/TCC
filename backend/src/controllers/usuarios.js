const usuarioService = require('../services/usuarios');


async function postUsuario(req, res) {
    const { email, senha } = req.body;

    const resultado = await usuarioService.postUsuario(email, senha);

    if (resultado.success) {
        res.status(201).json({ message: resultado.message, id_usuario: resultado.id_usuario });
    } else {
        res.status(400).json({ message: resultado.message, error: resultado.error });
    }
}


async function getUsuarios(req, res) {
    const resultado = await usuarioService.getUsuarios();

    if (resultado.success) {
        res.status(200).json(resultado.usuarios);
    } else {
        res.status(400).json({ message: resultado.message, error: resultado.error });
    }
}


module.exports = {
    postUsuario,
    getUsuarios
};