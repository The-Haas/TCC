function autenticar(req, res, next) {
    if (req.session && req.session.usuario) {
        next(); // Permite continuar para a próxima rota
    } else {
        res.status(401).json({ erro: 'Não autorizado' });
    }
}

module.exports = autenticar;