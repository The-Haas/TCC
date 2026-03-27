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
        endereco_entrega
    } = dados;

    try {
        // Verifica se o email já existe em clientes, lojistas ou representantes
        const emailCheck = await db.query(
            `SELECT 'x' FROM clientes WHERE email = $1
             UNION
             SELECT 'x' FROM lojistas WHERE email = $1
             UNION
             SELECT 'x' FROM representantes WHERE email = $1`,
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // Valida senha
        if (!senha || senha.length < 8) {
            return { success: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria cliente já com senha
        const clienteResult = await db.query(
            `INSERT INTO clientes 
    (nome, razao_social, cpf_cnpj, email, telefone, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, senha)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING id`,
            [
                nome,
                dados.razao_social || null, // adicionando razao_social
                cpf_cnpj,
                email,
                telefone,
                endereco,
                numero,
                bairro,
                cidade,
                uf,
                cep,
                endereco_entrega,
                hashedPassword
            ]
        );

        return {
            success: true,
            message: 'Cliente criado com sucesso.',
            id_cliente: clienteResult.rows[0].id
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Erro ao cadastrar cliente.',
            error: error.message
        };
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
                c.created_at,
                c.updated_at

            FROM clientes c
            ORDER BY c.id ASC;
        `);

        return { success: true, clientes: result.rows };

    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        return { success: false, message: "Erro ao buscar clientes.", error: error.message };
    }
}

async function getClienteById(id) {
    try {
        const result = await db.query(
            `SELECT
                id AS cliente_id,
                nome,
                razao_social,
                cpf_cnpj,
                email,
                telefone,
                endereco,
                numero,
                bairro,
                cidade,
                uf,
                cep,
                endereco_entrega,
                created_at,
                updated_at
             FROM clientes
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Cliente não encontrado.' };
        }

        return { success: true, cliente: result.rows[0] };

    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        return { success: false, message: "Erro ao buscar cliente.", error: error.message };
    }
}

async function putCliente(id, dados) {
    try {
        const {
            nome,
            razao_social,
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
            endereco_entrega
        } = dados;

        // 1. Verifica se o cliente existe
        const clienteCheck = await db.query('SELECT id FROM clientes WHERE id = $1', [id]);
        if (clienteCheck.rows.length === 0) {
            return { success: false, message: 'Cliente não encontrado.' };
        }

        // 2. Valida campos obrigatórios
        if (!nome || !email || !senha || !telefone || !cpf_cnpj || !endereco || !numero || !bairro || !cidade || !uf || !cep) {
            return { success: false, message: 'Todos os campos obrigatórios devem ser fornecidos.' };
        }

        // 3. Verifica se o email já existe em outra tabela ou outro cliente
        const emailCheck = await db.query(
            `SELECT 'x' FROM clientes WHERE email = $1 AND id <> $2
             UNION
             SELECT 'x' FROM representantes WHERE email = $1
             UNION
             SELECT 'x' FROM lojistas WHERE email = $1`,
            [email, id]
        );
        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // 4. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 5. Atualiza cliente
        const result = await db.query(
            `UPDATE clientes
     SET nome = $1,
         razao_social = $2,
         email = $3,
         senha = $4,
         telefone = $5,
         cpf_cnpj = $6,
         endereco = $7,
         numero = $8,
         bairro = $9,
         cidade = $10,
         uf = $11,
         cep = $12,
         endereco_entrega = $13,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $14
     RETURNING id AS cliente_id, nome, razao_social, email, telefone, cpf_cnpj, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, created_at, updated_at`,
            [nome, dados.razao_social || null, email, hashedPassword, telefone, cpf_cnpj, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, id]
        );

        return { success: true, cliente: result.rows[0] };

    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return { success: false, message: "Erro ao atualizar cliente.", error: error.message };
    }
}

async function patchCliente(id, dados) {
    try {
        // 1. Verifica se o cliente existe
        const clienteCheck = await db.query('SELECT id FROM clientes WHERE id = $1', [id]);
        if (clienteCheck.rows.length === 0) {
            return { success: false, message: 'Cliente não encontrado.' };
        }

        const fields = [];
        const values = [];
        let idx = 1;

        // 2. Se senha for fornecida, hash
        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        // 3. Se email for fornecido, valida em todas as tabelas
        if (dados.email) {
            const emailCheck = await db.query(
                `SELECT 'x' FROM clientes WHERE email = $1 AND id <> $2
                 UNION
                 SELECT 'x' FROM representantes WHERE email = $1
                 UNION
                 SELECT 'x' FROM lojistas WHERE email = $1`,
                [dados.email, id]
            );
            if (emailCheck.rows.length > 0) {
                return { success: false, message: 'Email já está em uso.' };
            }
        }

        // 4. Monta query dinamicamente
        for (const [key, value] of Object.entries(dados)) {
            fields.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }

        if (fields.length === 0) {
            return { success: false, message: 'Nenhum dado fornecido para atualização.' };
        }

        values.push(id);
        const query = `
            UPDATE clientes
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx}
            RETURNING id AS cliente_id, nome, razao_social, email, telefone, cpf_cnpj, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, created_at, updated_at
        `;

        const result = await db.query(query, values);
        return { success: true, cliente: result.rows[0] };

    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return { success: false, message: "Erro ao atualizar cliente.", error: error.message };
    }
}

async function deleteCliente(id) {
    try {
        const result = await db.query(
            `DELETE FROM clientes
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Cliente não encontrado.' };
        }

        return { success: true, message: 'Cliente deletado com sucesso.' };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao deletar cliente.', error: error.message };
    }
}

module.exports = {
    postCliente,
    getClientes,
    getClienteById,
    putCliente,
    patchCliente,
    deleteCliente
};
