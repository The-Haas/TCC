const { solicitarRecuperacaoSenha, redefinirSenha } = require('../services/resetSenhas');

const esqueceuSenha = async (req, res) => {
    // Agora aceitamos "identificador", que pode ser email ou CPF
    const { identificador } = req.body;

    if (!identificador) {
        return res.status(400).json({ success: false, message: 'Informe seu e-mail ou CPF.' });
    }

    const resultado = await solicitarRecuperacaoSenha(identificador);

    if (!resultado.success) {
        return res.status(400).json(resultado);
    }

    return res.status(200).json(resultado);
};

const redefinir = async (req, res) => {
    // Mudou "email" para "identificador"
    const { identificador, codigo, novaSenha } = req.body;

    if (!identificador || !codigo || !novaSenha) {
        return res.status(400).json({
            success: false,
            message: 'E-mail/CPF, código e nova senha são obrigatórios.'
        });
    }

    const resultado = await redefinirSenha(identificador, codigo, novaSenha);

    if (!resultado.success) {
        return res.status(400).json(resultado);
    }

    return res.status(200).json(resultado);
};

module.exports = {
    esqueceuSenha,
    redefinir
};