function validarRequisicaoEsqueceuSenha(req, res, next) {
    // Agora capturamos o "identificador" em vez de "email"
    const { identificador } = req.body;

    if (!identificador) {
        return res.status(400).json({
            success: false,
            message: 'O campo E-mail ou CPF/CNPJ é obrigatório.'
        });
    }

    // Se o texto contém "@", validamos como E-mail
    if (identificador.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identificador)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de e-mail inválido.'
            });
        }
    } else {
        // Se não tem "@", validamos como CPF/CNPJ (remover formatação e checar tamanho)
        const apenasNumeros = identificador.replace(/\D/g, '');
        if (apenasNumeros.length < 11) {
            return res.status(400).json({
                success: false,
                message: 'Formato de CPF ou CNPJ inválido. Digite no mínimo 11 números.'
            });
        }
    }

    return next();
}

module.exports = {
    validarRequisicaoEsqueceuSenha
};