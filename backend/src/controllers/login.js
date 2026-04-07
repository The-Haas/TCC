const authService = require('../services/login.js');

async function postLogin(req, res) {
    const { email, senha } = req.body;

    try {
        const resultado = await authService.login(email, senha);

        return res.status(200).json({
            success: true,
            ...resultado
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    postLogin
};