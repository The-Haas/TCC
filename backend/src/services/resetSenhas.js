const db = require('../config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 

// Função auxiliar para mascarar o e-mail (Ex: joao@gmail.com -> jo**@gmail.com)
function mascararEmail(email) {
    if (!email) return '';
    const [nome, dominio] = email.split('@');
    if (!dominio) return email;
    const nomeMascarado = nome.length > 2 
        ? nome.substring(0, 2) + '*'.repeat(nome.length - 2) 
        : nome + '*';
    return `${nomeMascarado}@${dominio}`;
}

async function solicitarRecuperacaoSenha(identificador) {
    try {
        // Limpa a string para buscar apenas por números (útil caso o cpf_cnpj esteja salvo sem máscara)
        const apenasNumeros = identificador.replace(/\D/g, '');

        // 1. Verifica se o usuário existe
        // Apenas 'clientes' tem a coluna 'cpf_cnpj'. Os demais buscam apenas por e-mail.
        const userCheck = await db.query(
            `SELECT email, nome, 'cliente' AS tipo FROM clientes WHERE email = $1 OR cpf_cnpj = $1 OR cpf_cnpj = $2
             UNION
             SELECT email, nome, 'lojista' AS tipo FROM lojistas WHERE email = $1
             UNION
             SELECT email, nome, 'representante' AS tipo FROM representantes WHERE email = $1
             UNION
             SELECT email, nome, 'admin' AS tipo FROM admins WHERE email = $1`,
            [identificador, apenasNumeros || null]
        );

        if (userCheck.rows.length === 0) {
            return { 
                success: false, 
                message: 'Nenhum usuário encontrado com esta informação.' 
            };
        }

        const user = userCheck.rows[0];
        const emailReal = user.email; // Pegamos o e-mail real do banco

        // 2. Gera um código numérico de 6 dígitos seguro
        const codigo = crypto.randomInt(100000, 999999).toString();
        const expiraEm = new Date(Date.now() + 3600000); // +1 hora

        // 3. Salva na tabela resets_senha usando o E-MAIL REAL
        await db.query(
            `INSERT INTO resets_senha (email, codigo, expira_em) VALUES ($1, $2, $3)`,
            [emailReal, codigo, expiraEm]
        );

        // 4. Busca as configurações de SMTP
        const configDb = await db.query(`SELECT * FROM configuracoes LIMIT 1`);
        if (configDb.rows.length === 0) {
            throw new Error('Configurações de SMTP não encontradas no banco.');
        }
        const config = configDb.rows[0];

        // 5. Configura e envia o e-mail
        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_secure, 
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass
            }
        });

        const urlFrontend = process.env.FRONTEND_URL || 'http://localhost:9000';
        const linkRecuperacao = `${urlFrontend}/redefinir-senha?codigo=${codigo}&email=${emailReal}`;

        await transporter.sendMail({
            from: `"Artezza" <${config.smtp_user}>`,
            to: emailReal,
            subject: 'Seu código de recuperação de senha - Artezza',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="text-align: center; color: #1976D2;">Recuperação de Senha</h2>
                    <p>Olá, <strong>${user.nome}</strong>!</p>
                    <p>Recebemos um pedido de recuperação de senha para sua conta. Use o código de 6 dígitos abaixo para criar uma nova senha:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 30px; background-color: #f4f4f4; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; border: 1px dashed #ccc;">
                            ${codigo}
                        </span>
                    </div>

                    <p>Ou, se preferir, clique no link abaixo:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${linkRecuperacao}" style="background-color: #1976D2; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir usando o link</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #777;">Este código expira em 1 hora.</p>
                    <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">Se você não solicitou essa alteração, basta ignorar este e-mail.</p>
                </div>
            `
        });

        return { 
            success: true, 
            message: 'Código de recuperação enviado com sucesso!',
            emailMascarado: mascararEmail(emailReal) // Envia pro front o e-mail parcialmente oculto
        };

    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        return { 
            success: false, 
            message: 'Erro interno ao processar a solicitação.', 
            error: error.message 
        };
    }
}

async function redefinirSenha(identificador, codigo, novaSenha) {
    try {
        const apenasNumeros = identificador.replace(/\D/g, '');

        // 1. Descobre de qual tabela é esse usuário e pega o e-mail real
        const userCheck = await db.query(
            `SELECT email, 'clientes' AS tabela FROM clientes WHERE email = $1 OR cpf_cnpj = $1 OR cpf_cnpj = $2
             UNION
             SELECT email, 'lojistas' AS tabela FROM lojistas WHERE email = $1
             UNION
             SELECT email, 'representantes' AS tabela FROM representantes WHERE email = $1
             UNION
             SELECT email, 'admins' AS tabela FROM admins WHERE email = $1`,
            [identificador, apenasNumeros || null]
        );

        if (userCheck.rows.length === 0) {
            return { success: false, message: 'Usuário não encontrado no sistema.' };
        }

        const emailReal = userCheck.rows[0].email;
        const tabela = userCheck.rows[0].tabela;

        // 2. Verifica se o código existe na tabela resets_senha para este e-mail
        const resetCheck = await db.query(
            `SELECT * FROM resets_senha WHERE email = $1 AND codigo = $2`,
            [emailReal, codigo]
        );

        if (resetCheck.rows.length === 0) {
            return { success: false, message: 'Código inválido ou incorreto.' };
        }

        const resetData = resetCheck.rows[0];

        // 3. Verifica se o código já expirou
        if (new Date() > new Date(resetData.expira_em)) {
            return { success: false, message: 'Este código expirou. Solicite um novo.' };
        }

        // 4. Criptografa a nova senha com bcrypt
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        // 5. Atualiza a senha na tabela correta
        await db.query(`UPDATE ${tabela} SET senha = $1 WHERE email = $2`, [senhaHash, emailReal]);

        // 6. Deleta o código usado para que não possa ser usado novamente
        await db.query(`DELETE FROM resets_senha WHERE id = $1`, [resetData.id]);

        return { 
            success: true, 
            message: 'Senha redefinida com sucesso! Você já pode fazer login.' 
        };

    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return { 
            success: false, 
            message: 'Erro interno ao tentar redefinir a senha.', 
            error: error.message 
        };
    }
}

module.exports = {
    solicitarRecuperacaoSenha,
    redefinirSenha
};