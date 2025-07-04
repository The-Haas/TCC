const { criarCliente } = require('../services/cadastroCliente.js');

const cadastrarCliente = async (req, res) => {
    try {
        const { nome, email, cpfcnpj, senha } = req.body;

        // Chama a função que faz a criação e validação
        const clienteCriado = await criarCliente({ nome, email, cpfcnpj, senha });

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso',
            cliente: clienteCriado,
        });
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error.message);

        if (error.message === 'Email ou CPF/CNPJ já cadastrado') {
            return res.status(409).json({ erro: error.message });
        }

        if (error.message === 'Todos os campos são obrigatórios') {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};

module.exports = {
    cadastrarCliente,
};
