const path = require('path');
const autenticar = require('../middlewares/authMiddleware.js');

module.exports = (app) => {
    // Rota de login
    app.post('/login', (req, res) => {
        const { usuario, senha } = req.body;

        // Simulação de login fixo
        if (usuario === 'admin' && senha === '123') {
            req.session.usuario = usuario;
            return res.redirect('/painelcliente.html');
        }

        return res.status(401).send('Usuário ou senha inválidos');
    });

    // Rota de logout
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Erro ao encerrar sessão");
            }
            res.redirect('/index.html');
        });
    });

    // Rota protegida
    app.get('/painel', autenticar, (req, res) => {
        res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'painelcliente.html'));
        res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'painelcontrole.html'));
    });
};
