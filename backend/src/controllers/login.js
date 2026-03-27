const authService = require('../services/login.js');

async function postLogin(req, res) {
    const { email, senha } = req.body;

    try {
        const resultado = await authService.login(email, senha);

        res.status(200).json(resultado);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    postLogin
};