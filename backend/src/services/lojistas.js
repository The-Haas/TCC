const db = require('../config');
const bcrypt = require('bcrypt');

async function postLojista(dados) {
    const { nome, email, telefone, senha, id_representante } = dados;

    try {
        // Verifica se o email já existe em lojistas, representantes ou clientes
        const emailCheck = await db.query(
            `SELECT 'x' FROM lojistas WHERE email = $1
             UNION
             SELECT 'x' FROM representantes WHERE email = $1
             UNION
             SELECT 'x' FROM clientes WHERE email = $1`,
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // Valida senha
        if (!senha || senha.length < 8) {
            return { success: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
        }

        // Verifica se representante existe
        const repCheck = await db.query(
            'SELECT id FROM representantes WHERE id = $1',
            [id_representante]
        );
        if (repCheck.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria lojista
        const result = await db.query(
            `INSERT INTO lojistas (nome, email, telefone, senha, id_representante)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [nome, email, telefone, hashedPassword, id_representante]
        );

        return {
            success: true,
            message: 'Lojista criado com sucesso.',
            id_lojista: result.rows[0].id
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao cadastrar lojista.', error: error.message };
    }
}

async function getLojistas(filtroRepresentante = null) {
    try {
        let query = `
            SELECT l.id, l.nome, l.email, l.telefone, l.id_representante, r.nome AS nome_representante,
                   l.created_at, l.updated_at
            FROM lojistas l
            JOIN representantes r ON l.id_representante = r.id
            ORDER BY l.id ASC
        `;
        const params = [];

        if (filtroRepresentante) {
            query = `
                SELECT l.id, l.nome, l.email, l.telefone, l.id_representante, r.nome AS nome_representante,
                       l.created_at, l.updated_at
                FROM lojistas l
                JOIN representantes r ON l.id_representante = r.id
                WHERE l.id_representante = $1
                ORDER BY l.id ASC
            `;
            params.push(filtroRepresentante);
        }

        const result = await db.query(query, params);
        return { success: true, lojistas: result.rows };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar lojistas.', error: error.message };
    }
}

async function getLojistaById(id) {
    try {
        const result = await db.query(
            `SELECT l.id, l.nome, l.email, l.telefone, l.id_representante, r.nome AS nome_representante,
                    l.created_at, l.updated_at
             FROM lojistas l
             JOIN representantes r ON l.id_representante = r.id
             WHERE l.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Lojista não encontrado.' };
        }

        return { success: true, lojista: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar lojista.', error: error.message };
    }
}

async function putLojista(id, dados) {
    try {
        const { nome, email, telefone, senha, id_representante } = dados;

        // 1. Verifica se o lojista existe
        const lojCheck = await db.query('SELECT id FROM lojistas WHERE id = $1', [id]);
        if (lojCheck.rows.length === 0) {
            return { success: false, message: 'Lojista não encontrado.' };
        }

        // 2. Valida campos obrigatórios
        if (!nome || !email || !telefone || !senha || !id_representante) {
            return {
                success: false,
                message: 'Todos os campos obrigatórios (nome, email, telefone, senha, id_representante) devem ser fornecidos.'
            };
        }

        // 3. Verifica se representante existe
        const repCheck = await db.query('SELECT id FROM representantes WHERE id = $1', [id_representante]);
        if (repCheck.rows.length === 0) {
            return { success: false, message: 'Representante não encontrado.' };
        }

        // 4. Valida email nas 3 tabelas, excluindo o próprio lojista
        const emailCheck = await db.query(
            `SELECT 'x' FROM lojistas WHERE email = $1 AND id <> $2
             UNION
             SELECT 'x' FROM representantes WHERE email = $1
             UNION
             SELECT 'x' FROM clientes WHERE email = $1`,
            [email, id]
        );
        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        // 5. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 6. Atualiza lojista
        const result = await db.query(
            `UPDATE lojistas
             SET nome = $1, email = $2, telefone = $3, senha = $4, id_representante = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING id, nome, email, telefone, id_representante, created_at, updated_at`,
            [nome, email, telefone, hashedPassword, id_representante, id]
        );

        return { success: true, lojista: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar lojista.', error: error.message };
    }
}

async function patchLojista(id, dados) {
    try {
        // 1. Verifica se o lojista existe
        const lojCheck = await db.query('SELECT id FROM lojistas WHERE id = $1', [id]);
        if (lojCheck.rows.length === 0) {
            return { success: false, message: 'Lojista não encontrado.' };
        }

        // 2. Valida email se estiver sendo atualizado
        if (dados.email) {
            const emailCheck = await db.query(
                `SELECT 'x' FROM lojistas WHERE email = $1 AND id <> $2
                 UNION
                 SELECT 'x' FROM representantes WHERE email = $1
                 UNION
                 SELECT 'x' FROM clientes WHERE email = $1`,
                [dados.email, id]
            );
            if (emailCheck.rows.length > 0) {
                return { success: false, message: 'Email já está em uso.' };
            }
        }

        const fields = [];
        const values = [];
        let idx = 1;

        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        if (dados.id_representante) {
            const repCheck = await db.query('SELECT id FROM representantes WHERE id = $1', [dados.id_representante]);
            if (repCheck.rows.length === 0) {
                return { success: false, message: 'Representante não encontrado.' };
            }
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
            UPDATE lojistas
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx}
            RETURNING id, nome, email, telefone, id_representante, created_at, updated_at
        `;

        const result = await db.query(query, values);
        return { success: true, lojista: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar lojista.', error: error.message };
    }
}

async function deleteLojista(id) {
    try {
        const result = await db.query(
            `DELETE FROM lojistas WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Lojista não encontrado.' };
        }

        return { success: true, message: 'Lojista deletado com sucesso.' };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao deletar lojista.', error: error.message };
    }
}

module.exports = {
    postLojista,
    getLojistas,
    getLojistaById,
    putLojista,
    patchLojista,
    deleteLojista
};