const db = require('../config');
const bcrypt = require('bcrypt');

const criarCliente = async ({ nome, email, cpfcnpj, senha }) => {
    if (!nome || !email || !cpfcnpj || !senha) {
        throw new Error('Todos os campos são obrigatórios');
    }

    // Verificar se já existe email ou CPF/CNPJ cadastrado
    const { rows } = await db.query(
        'SELECT * FROM clientes WHERE email = $1 OR cpf_cnpj = $2',
        [email, cpfcnpj]
    );

    if (rows.length > 0) {
        throw new Error('Email ou CPF/CNPJ já cadastrado');
    }

    // Criptografar a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo cliente
    await db.query(
        'INSERT INTO clientes (nome, email, cpf_cnpj, senha) VALUES ($1, $2, $3, $4)',
        [nome, email, cpfcnpj, senhaHash]
    );

    return { nome, email, cpfcnpj }; // você pode retornar os dados salvos, se quiser
};

module.exports = {
    criarCliente,
};