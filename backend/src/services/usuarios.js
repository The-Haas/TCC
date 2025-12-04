const db = require('../config');
const bcrypt = require('bcrypt');


async function postUsuario(email, senha) {
    try {

        // Verificar se o email já está em uso
        const emailCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
       
        // se já existir retorna mensagem de erro
        if (emailCheck.rows.length > 0) {
            return { success: false, message: 'Email já está em uso.' };
        }

        if (senha.length < 8) {
            return { success: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
        }

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        // Inserir novo usuário no banco de dados
        const result = await db.query(
            'INSERT INTO usuarios (email, senha, admin) VALUES ($1, $2, true) RETURNING id',
            [email, hashedPassword]
        );

        return { success: true, message: 'Usuário criado com sucesso.', id_usuario: result.rows[0].id_usuario };


    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return { success: false, message: 'Erro ao criar usuário.', error: error.message };
    }
}



async function getUsuarios() {
    try {
        const result = await db.query(
            `
            SELECT 
                u.id AS usuario_id,
                u.email,
                u.admin,
                u.id_cliente,

                c.nome AS cliente_nome,
                c.razao_social,
                c.cpf_cnpj,
                c.email AS cliente_email,
                c.telefone AS cliente_telefone,
                c.endereco,
                c.numero,
                c.bairro,
                c.cidade,
                c.uf,
                c.cep,
                c.endereco_entrega,
                c.tipo_cliente
            FROM usuarios u
            LEFT JOIN clientes c ON c.id = u.id_cliente
            ORDER BY u.id ASC;
            `
        );

        return { success: true, usuarios: result.rows };

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return { success: false, message: 'Erro ao buscar usuários.', error: error.message };
    }
}



module.exports = {
    postUsuario,
    getUsuarios
};