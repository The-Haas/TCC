const { autenticarCliente } = require('../services/loginCliente.js');

const loginCliente = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const cliente = await autenticarCliente({ email, senha });

        // Se chegou aqui, login OK
        req.session.cliente = {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            perfil: cliente.perfil,
        };

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            cliente: req.session.cliente,
        });

    } catch (error) {
        // Tratamento específico dos erros do service
        if (
            error.message === 'Cliente não encontrado!' ||
            error.message === 'Senha inválida!' ||
            error.message === 'Email e senha são obrigatórios!'
        ) {
            return res.status(401).json({ erro: 'Email ou senha inválidos' });
        }

        console.error('Erro ao fazer login:', error.message);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = {
    loginCliente,
};
