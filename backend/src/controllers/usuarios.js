const usuarioService = require('../services/usuarios');


async function criarUsuario(req, res) {
    const { email, senha } = req.body;

    const resultado = await usuarioService.criarUsuario(email, senha);

    if (resultado.success) {
        res.status(201).json({ message: resultado.message, id_usuario: resultado.id_usuario });
    } else {
        res.status(400).json({ message: resultado.message, error: resultado.error });
    }
}

module.exports = {
    criarUsuario
};