const db = require('../config');

async function postStatus(dados) {
    const { descricao, cor, padrao } = dados;

    try {
        if (!descricao) {
            return { success: false, message: 'Descrição é obrigatória.' };
        }

        if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
            return { success: false, message: 'Cor inválida. Use o formato hexadecimal #RRGGBB.' };
        }

        // Se esse vai ser o padrão, tira o padrão do atual
        if (padrao) {
            await db.query(
                `UPDATE status_pedido SET padrao = false WHERE padrao = true`
            );
        }

        const result = await db.query(
            `INSERT INTO status_pedido (descricao, cor, padrao)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [descricao, cor || '#000000', padrao || false]
        );

        return { success: true, message: 'Status criado com sucesso.', status: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao criar status.', error: error.message };
    }
}

async function getStatus() {
    try {
        const result = await db.query(
            `SELECT * FROM status_pedido ORDER BY id ASC`
        );

        return { success: true, status: result.rows };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar status.', error: error.message };
    }
}

async function getStatusById(id) {
    try {
        const result = await db.query(
            `SELECT * FROM status_pedido WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Status não encontrado.' };
        }

        return { success: true, status: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar status.', error: error.message };
    }
}

async function putStatus(id, dados) {
    const { descricao, cor, padrao } = dados;

    try {
        const statusCheck = await db.query('SELECT * FROM status_pedido WHERE id = $1', [id]);
        if (statusCheck.rows.length === 0) {
            return { success: false, message: 'Status não encontrado.' };
        }

        if (!descricao) {
            return { success: false, message: 'Descrição é obrigatória.' };
        }

        if (cor && !/^#[0-9A-Fa-f]{6}$/.test(cor)) {
            return { success: false, message: 'Cor inválida. Use o formato hexadecimal #RRGGBB.' };
        }

        // Se esse vai ser o padrão, tira o padrão do atual (exceto ele mesmo)
        if (padrao) {
            await db.query(
                `UPDATE status_pedido SET padrao = false WHERE padrao = true AND id <> $1`,
                [id]
            );
        }

        const result = await db.query(
            `UPDATE status_pedido
             SET descricao = $1,
                 cor = $2,
                 padrao = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [descricao, cor || '#000000', padrao || false, id]
        );

        return { success: true, status: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar status.', error: error.message };
    }
}

async function patchStatus(id, dados) {
    try {
        const statusCheck = await db.query('SELECT * FROM status_pedido WHERE id = $1', [id]);
        if (statusCheck.rows.length === 0) {
            return { success: false, message: 'Status não encontrado.' };
        }

        if (dados.cor && !/^#[0-9A-Fa-f]{6}$/.test(dados.cor)) {
            return { success: false, message: 'Cor inválida. Use o formato hexadecimal #RRGGBB.' };
        }

        // Se esse vai ser o padrão, tira o padrão do atual (exceto ele mesmo)
        if (dados.padrao) {
            await db.query(
                `UPDATE status_pedido SET padrao = false WHERE padrao = true AND id <> $1`,
                [id]
            );
        }

        const fields = [];
        const values = [];
        let idx = 1;

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
            UPDATE status_pedido
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return { success: true, status: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar status.', error: error.message };
    }
}

async function deleteStatus(id, idNovoPadrao) {
    try {
        const statusCheck = await db.query('SELECT * FROM status_pedido WHERE id = $1', [id]);
        if (statusCheck.rows.length === 0) {
            return { success: false, message: 'Status não encontrado.' };
        }

        const isPadrao = statusCheck.rows[0].padrao;

        if (isPadrao) {
            if (!idNovoPadrao) {
                return {
                    success: false,
                    message: 'Este é o status padrão. Informe o id_novo_padrao para definir outro antes de deletar.'
                };
            }

            if (Number(idNovoPadrao) === Number(id)) {
                return { success: false, message: 'O novo status padrão não pode ser o mesmo que está sendo deletado.' };
            }

            const novoPadraoCheck = await db.query(
                'SELECT * FROM status_pedido WHERE id = $1',
                [idNovoPadrao]
            );
            if (novoPadraoCheck.rows.length === 0) {
                return { success: false, message: 'Novo status padrão não encontrado.' };
            }

            // Primeiro remove o padrão do atual, depois seta o novo
            await db.query(
                `UPDATE status_pedido SET padrao = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [id]
            );
            await db.query(
                `UPDATE status_pedido SET padrao = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [idNovoPadrao]
            );
        }

        await db.query('DELETE FROM status_pedido WHERE id = $1', [id]);

        return { success: true, message: 'Status deletado com sucesso.' };

    } catch (error) {
        if (error.code === '23503') {
            return {
                success: false,
                message: 'Não é possível deletar este status pois existem pedidos vinculados a ele.'
            };
        }

        console.error(error);
        return { success: false, message: 'Erro ao deletar status.', error: error.message };
    }
}

module.exports = {
    postStatus,
    getStatus,
    getStatusById,
    putStatus,
    patchStatus,
    deleteStatus
};