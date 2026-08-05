const db = require('../config');
const bcrypt = require('bcrypt');

async function postRepresentante(dados) {
    const { nome, email, telefone, senha } = dados;

    try {
        // Verifica se o email já existe em representantes, clientes ou lojistas
        const emailCheck = await db.query(
            `SELECT 'x' FROM representantes WHERE email = $1
             UNION
             SELECT 'x' FROM clientes WHERE email = $1
             UNION
             SELECT 'x' FROM lojistas WHERE email = $1`,
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

        // Cria representante
        const result = await db.query(
            `INSERT INTO representantes (nome, email, telefone, senha)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [nome, email, telefone, hashedPassword]
        );

        return {
            success: true,
            message: 'Representante criado com sucesso.',
            id_representante: result.rows[0].id
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao cadastrar representante.', error: error.message };
    }
}

async function getRepresentantes() {
    try {
        const result = await db.query(`
            SELECT id, nome, email, telefone, created_at, updated_at
            FROM representantes
            ORDER BY id ASC
        `);

        return { success: true, representantes: result.rows };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar representantes.', error: error.message };
    }
}

async function getRepresentanteById(id) {
    try {
        const result = await db.query(
            `SELECT id, nome, email, telefone, created_at, updated_at
             FROM representantes
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        return { success: true, representante: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar representante.', error: error.message };
    }
}

async function putRepresentante(id, dados) {
    try {
        const { nome, email, telefone, senha } = dados;

        // 1. Verifica se o representante existe
        const repCheck = await db.query('SELECT id FROM representantes WHERE id = $1', [id]);
        if (repCheck.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        // 2. Valida campos obrigatórios
        if (!nome || !email || !telefone || !senha) {
            return {
                success: false,
                message: 'Todos os campos obrigatórios (nome, email, telefone, senha) devem ser fornecidos.'
            };
        }

        // 3. Valida email nas 3 tabelas, excluindo o próprio representante
        const emailCheck = await db.query(
            `SELECT 'x' FROM representantes WHERE email = $1 AND id <> $2
             UNION
             SELECT 'x' FROM clientes WHERE email = $1
             UNION
             SELECT 'x' FROM lojistas WHERE email = $1`,
            [email, id]
        );

        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // 4. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 5. Atualiza o representante
        const result = await db.query(
            `UPDATE representantes
             SET nome = $1, email = $2, telefone = $3, senha = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, nome, email, telefone, created_at, updated_at`,
            [nome, email, telefone, hashedPassword, id]
        );

        return { success: true, representante: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar representante.', error: error.message };
    }
}

async function patchRepresentante(id, dados) {
    try {
        // 1. Verifica se o representante existe
        const repCheck = await db.query('SELECT id FROM representantes WHERE id = $1', [id]);
        if (repCheck.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        // 2. Valida email se estiver sendo atualizado
        if (dados.email) {
            const emailCheck = await db.query(
                `SELECT 'x' FROM representantes WHERE email = $1 AND id <> $2
                 UNION
                 SELECT 'x' FROM clientes WHERE email = $1
                 UNION
                 SELECT 'x' FROM lojistas WHERE email = $1`,
                [dados.email, id]
            );
            if (emailCheck.rows.length > 0) {
                return { success: false, message: 'Email já está em uso.' };
            }
        }

        // 3. Atualiza campos fornecidos
        const fields = [];
        const values = [];
        let idx = 1;

        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

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
            UPDATE representantes
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx}
            RETURNING id, nome, email, telefone, created_at, updated_at
        `;

        const result = await db.query(query, values);
        return { success: true, representante: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar representante.', error: error.message };
    }
}

async function deleteRepresentante(id) {
    try {
        // 1. Verifica se existem lojistas vinculados a este representante
        const lojistasCheck = await db.query(
            `SELECT id FROM lojistas WHERE id_representante = $1 LIMIT 1`,
            [id]
        );

        // Se encontrou algum lojista, bloqueia a exclusão
        if (lojistasCheck.rows.length > 0) {
            return { 
                success: false, 
                message: 'Não é possível excluir: este representante possui lojistas vinculados a ele.' 
            };
        }

        // 2. Se não houver vínculos, prossegue com a exclusão
        const result = await db.query(
            `DELETE FROM representantes WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        return { success: true, message: 'Representante deletado com sucesso.' };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao deletar representante.', error: error.message };
    }
}

module.exports = {
    postRepresentante,
    getRepresentantes,
    getRepresentanteById,
    putRepresentante,
    patchRepresentante,
    deleteRepresentante
};