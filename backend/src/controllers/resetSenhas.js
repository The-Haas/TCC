const { solicitarRecuperacaoSenha, redefinirSenha } = require('../services/resetSenhas');

const esqueceuSenha = async (req, res) => {
    const { email } = req.body;

    const resultado = await solicitarRecuperacaoSenha(email);

    if (!resultado.success) {
        return res.status(400).json(resultado);
    }

    return res.status(200).json(resultado);
};

const redefinir = async (req, res) => {
    const { email, codigo, novaSenha } = req.body;

    // Validação básica
    if (!email || !codigo || !novaSenha) {
        return res.status(400).json({ 
            success: false, 
            message: 'E-mail, código e nova senha são obrigatórios.' 
        });
    }

    // Chamamos a função redefinirSenha diretamente aqui
    const resultado = await redefinirSenha(email, codigo, novaSenha);

    if (!resultado.success) {
        return res.status(400).json(resultado); 
    }

    return res.status(200).json(resultado);
};

module.exports = {
    esqueceuSenha,
    redefinir
};