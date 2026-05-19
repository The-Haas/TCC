const db = require('../config');
const bcrypt = require('bcrypt');

function validarSenha(senha) {
    if (!senha || senha.length < 8) {
        return 'A senha deve ter pelo menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(senha)) {
        return 'A senha deve conter pelo menos uma letra maiúscula.';
    }
    if (!/[a-z]/.test(senha)) {
        return 'A senha deve conter pelo menos uma letra minúscula.';
    }
    if (!/[0-9]/.test(senha)) {
        return 'A senha deve conter pelo menos um número.';
    }
    if (!/[^A-Za-z0-9]/.test(senha)) {
        return 'A senha deve conter pelo menos um caractere especial.';
    }
    return null;
}

async function verificarEmailTelefone(email, telefone, idIgnorar = null) {
    if (email) {
        const emailCheck = await db.query(
            `SELECT 'x' FROM clientes WHERE email = $1
             UNION
             SELECT 'x' FROM lojistas WHERE email = $1
             UNION
             SELECT 'x' FROM representantes WHERE email = $1
             UNION
             SELECT 'x' FROM admins WHERE email = $1 ${idIgnorar ? 'AND id <> $2' : ''}`,
            idIgnorar ? [email, idIgnorar] : [email]
        );

        if (emailCheck.rows.length > 0) {
            return 'Email já está em uso.';
        }
    }

    if (telefone) {
        const telefoneCheck = await db.query(
            `SELECT 'x' FROM admins WHERE telefone = $1 ${idIgnorar ? 'AND id <> $2' : ''}`,
            idIgnorar ? [telefone, idIgnorar] : [telefone]
        );

        if (telefoneCheck.rows.length > 0) {
            return 'Telefone já está em uso por outro admin.';
        }
    }

    return null;
}

async function postAdmin(dados) {
    const { nome, email, senha, telefone } = dados;

    try {
        if (!nome || !email || !senha) {
            return { success: false, message: 'Nome, email e senha são obrigatórios.' };
        }

        const senhaErro = validarSenha(senha);
        if (senhaErro) {
            return { success: false, message: senhaErro };
        }

        const conflito = await verificarEmailTelefone(email, telefone);
        if (conflito) {
            return { success: false, message: conflito };
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await db.query(
            `INSERT INTO admins (nome, email, telefone, senha)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [nome, email, telefone || null, hashedPassword]
        );

        return {
            success: true,
            message: 'Admin criado com sucesso.',
            id_admin: result.rows[0].id
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao cadastrar admin.', error: error.message };
    }
}

async function getAdmins() {
    try {
        const result = await db.query(
            `SELECT id AS admin_id, nome, email, telefone, created_at, updated_at
             FROM admins
             ORDER BY id ASC`
        );

        return { success: true, admins: result.rows };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar admins.', error: error.message };
    }
}

async function getAdminById(id) {
    try {
        const result = await db.query(
            `SELECT id AS admin_id, nome, email, telefone, created_at, updated_at
             FROM admins
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Admin não encontrado.' };
        }

        return { success: true, admin: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao buscar admin.', error: error.message };
    }
}

async function putAdmin(id, dados) {
    const { nome, email, senha, telefone } = dados;

    try {
        const adminCheck = await db.query('SELECT id FROM admins WHERE id = $1', [id]);
        if (adminCheck.rows.length === 0) {
            return { success: false, message: 'Admin não encontrado.' };
        }

        if (!nome || !email || !senha) {
            return { success: false, message: 'Nome, email e senha são obrigatórios.' };
        }

        const senhaErro = validarSenha(senha);
        if (senhaErro) {
            return { success: false, message: senhaErro };
        }

        const conflito = await verificarEmailTelefone(email, telefone, id);
        if (conflito) {
            return { success: false, message: conflito };
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await db.query(
            `UPDATE admins
             SET nome = $1,
                 email = $2,
                 telefone = $3,
                 senha = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id AS admin_id, nome, email, telefone, created_at, updated_at`,
            [nome, email, telefone || null, hashedPassword, id]
        );

        return { success: true, admin: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar admin.', error: error.message };
    }
}

async function patchAdmin(id, dados) {
    try {
        const adminCheck = await db.query('SELECT id FROM admins WHERE id = $1', [id]);
        if (adminCheck.rows.length === 0) {
            return { success: false, message: 'Admin não encontrado.' };
        }

        if (dados.senha) {
            const senhaErro = validarSenha(dados.senha);
            if (senhaErro) {
                return { success: false, message: senhaErro };
            }
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        if (dados.email || dados.telefone) {
            const conflito = await verificarEmailTelefone(
                dados.email || null,
                dados.telefone || null,
                id
            );
            if (conflito) {
                return { success: false, message: conflito };
            }
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
            UPDATE admins
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${idx}
            RETURNING id AS admin_id, nome, email, telefone, created_at, updated_at
        `;

        const result = await db.query(query, values);
        return { success: true, admin: result.rows[0] };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao atualizar admin.', error: error.message };
    }
}

async function deleteAdmin(id) {
    try {
        const result = await db.query(
            `DELETE FROM admins WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Admin não encontrado.' };
        }

        return { success: true, message: 'Admin deletado com sucesso.' };

    } catch (error) {
        console.error(error);
        return { success: false, message: 'Erro ao deletar admin.', error: error.message };
    }
}

module.exports = {
    postAdmin,
    getAdmins,
    getAdminById,
    putAdmin,
    patchAdmin,
    deleteAdmin
};