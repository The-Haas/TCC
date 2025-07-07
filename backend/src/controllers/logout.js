const { logoutCliente } = require('../services/logout.js');

const logout = async (req, res) => {
    try {
        await logoutCliente(req);
        res.clearCookie('connect.sid'); // se estiver usando cookie-session
        return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro ao fazer logout:', error.message);
        return res.status(500).json({ erro: 'Erro ao encerrar a sessão' });
    }
};

module.exports = {
    logout,
};
