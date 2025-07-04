const db = require('../config');
const bcrypt = require('bcrypt');

const autenticarCliente = async ({ email, senha }) => {
    if (!email || !senha) {
        throw new Error('Email e senha são obrigatórios!');
    }

    const { rows } = await db.query(
        'SELECT * FROM clientes WHERE email = $1',
        [email]
    );

    if (rows.length === 0) {
        throw new Error('Cliente não encontrado!');
    }

    const cliente = rows[0];

    const senhaValida = await bcrypt.compare(senha, cliente.senha);
    if (!senhaValida) {
        throw new Error('Senha inválida!');
    }
    return {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        perfil: cliente.perfil,
    };
};

module.exports = {
    autenticarCliente,
};
