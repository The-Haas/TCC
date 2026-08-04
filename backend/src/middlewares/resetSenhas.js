function validarRequisicaoEsqueceuSenha(req, res, next) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'O campo e-mail é obrigatório.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Formato de e-mail inválido.' });
    }

    return next();
}

module.exports = {
    validarRequisicaoEsqueceuSenha
};