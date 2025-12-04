const db = require('../config');
const bcrypt = require('bcrypt');

async function postCliente(dados) {
    const {
        nome,
        email,
        senha,
        telefone,
        cpf_cnpj,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        cep,
        endereco_entrega,
        tipo_cliente
    } = dados;

    try {
        // Verifica se o email já existe em usuarios
        const emailCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // Valida senha
        if (!senha || senha.length < 8) {
            return { success: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
        }

        // Cria cliente
        const clienteResult = await db.query(
            `INSERT INTO clientes 
            (nome, cpf_cnpj, email, telefone, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, tipo_cliente)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING id`,
            [
                nome, cpf_cnpj, email, telefone, endereco, numero,
                bairro, cidade, uf, cep, endereco_entrega, tipo_cliente
            ]
        );

        const idCliente = clienteResult.rows[0].id;

        // Hash senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria usuário vinculado ao cliente
        const usuarioResult = await db.query(
            `INSERT INTO usuarios (email, senha, id_cliente, admin)
             VALUES ($1, $2, $3, false)
             RETURNING id`,
            [email, hashedPassword, idCliente]
        );

        return {
            success: true,
            message: 'Cliente e usuário criados com sucesso.',
            id_cliente: idCliente,
            id_usuario: usuarioResult.rows[0].id
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao cadastrar cliente.', error: error.message };
    }
}



async function getClientes() {
    try {
        const result = await db.query(`
            SELECT
                c.id AS cliente_id,
                c.nome,
                c.razao_social,
                c.cpf_cnpj,
                c.email,
                c.telefone,
                c.endereco,
                c.numero,
                c.bairro,
                c.cidade,
                c.uf,
                c.cep,
                c.endereco_entrega,
                c.tipo_cliente,
                c.created_at,
                c.updated_at,

                u.id AS usuario_id,
                u.email AS usuario_email,
                u.admin AS usuario_admin
            FROM clientes c
            LEFT JOIN usuarios u ON u.id_cliente = c.id
            ORDER BY c.id ASC;
        `);

        return { success: true, clientes: result.rows };

    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        return { success: false, message: "Erro ao buscar clientes.", error: error.message };
    }
}


module.exports = {
    postCliente,
    getClientes
};
