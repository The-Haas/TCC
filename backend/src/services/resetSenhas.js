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
            subject: 'Recuperação de senha | Artezza',
            html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light">
            <title>Recuperação de senha - Artezza</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f3f5f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #1d2939;
        ">

            <!-- Preheader -->
            <div style="
                display: none;
                max-height: 0;
                overflow: hidden;
                opacity: 0;
                color: transparent;
            ">
                Use o código de segurança enviado pela Artezza para redefinir sua senha.
            </div>

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="width: 100%; background-color: #f3f5f7;"
            >
                <tr>
                    <td align="center" style="padding: 40px 16px;">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            role="presentation"
                            style="
                                width: 100%;
                                max-width: 620px;
                                background-color: #ffffff;
                                border-radius: 18px;
                                overflow: hidden;
                                border: 1px solid #e4e7ec;
                                box-shadow: 0 10px 30px rgba(16, 24, 40, 0.08);
                            "
                        >

                            <!-- Barra de identidade -->
                            <tr>
                                <td
                                    height="5"
                                    style="
                                        height: 5px;
                                        background-color: #f47b20;
                                        font-size: 0;
                                        line-height: 0;
                                    "
                                >
                                    &nbsp;
                                </td>
                            </tr>

                            <!-- Header -->
                            <tr>
                                <td
                                    style="
                                        background-color: #101828;
                                        padding: 28px 36px;
                                    "
                                >
                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        role="presentation"
                                    >
                                        <tr>
                                            <td>
                                                <div style="
                                                    font-size: 22px;
                                                    line-height: 26px;
                                                    font-weight: 800;
                                                    letter-spacing: 2px;
                                                    color: #ffffff;
                                                ">
                                                    ARTEZZA
                                                </div>

                                                <div style="
                                                    margin-top: 5px;
                                                    font-size: 12px;
                                                    line-height: 18px;
                                                    color: #98a2b3;
                                                    letter-spacing: 0.4px;
                                                ">
                                                    Portal de projetos sob medida
                                                </div>
                                            </td>

                                            <td align="right" valign="middle">
                                                <div style="
                                                    display: inline-block;
                                                    padding: 7px 12px;
                                                    border-radius: 20px;
                                                    background-color: rgba(244, 123, 32, 0.12);
                                                    border: 1px solid rgba(244, 123, 32, 0.35);
                                                    color: #f79045;
                                                    font-size: 11px;
                                                    font-weight: 700;
                                                    letter-spacing: 0.5px;
                                                ">
                                                    SEGURANÇA
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Conteúdo -->
                            <tr>
                                <td style="padding: 38px 36px 18px 36px;">

                                    <div style="
                                        display: inline-block;
                                        padding: 7px 11px;
                                        margin-bottom: 16px;
                                        border-radius: 7px;
                                        background-color: #fff4eb;
                                        color: #e86612;
                                        font-size: 11px;
                                        line-height: 14px;
                                        font-weight: 700;
                                        letter-spacing: 0.6px;
                                        text-transform: uppercase;
                                    ">
                                        Recuperação de acesso
                                    </div>

                                    <h1 style="
                                        margin: 0 0 14px 0;
                                        font-size: 27px;
                                        line-height: 34px;
                                        font-weight: 700;
                                        color: #101828;
                                    ">
                                        Redefina sua senha
                                    </h1>

                                    <p style="
                                        margin: 0 0 14px 0;
                                        font-size: 15px;
                                        line-height: 24px;
                                        color: #475467;
                                    ">
                                        Olá, <strong style="color: #101828;">${user.nome}</strong>!
                                    </p>

                                    <p style="
                                        margin: 0;
                                        font-size: 15px;
                                        line-height: 24px;
                                        color: #475467;
                                    ">
                                        Recebemos uma solicitação para redefinir a senha da sua conta Artezza.
                                        Utilize o código abaixo para continuar:
                                    </p>

                                </td>
                            </tr>

                            <!-- Código -->
                            <tr>
                                <td align="center" style="padding: 18px 36px 24px 36px;">

                                    <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        role="presentation"
                                        style="
                                            width: 100%;
                                            background-color: #f8fafc;
                                            border: 1px solid #e4e7ec;
                                            border-radius: 14px;
                                        "
                                    >
                                        <tr>
                                            <td align="center" style="padding: 24px 20px;">

                                                <div style="
                                                    margin-bottom: 8px;
                                                    font-size: 11px;
                                                    line-height: 16px;
                                                    font-weight: 700;
                                                    letter-spacing: 1px;
                                                    text-transform: uppercase;
                                                    color: #667085;
                                                ">
                                                    Seu código de segurança
                                                </div>

                                                <div style="
                                                    font-family: 'Courier New', Courier, monospace;
                                                    font-size: 34px;
                                                    line-height: 42px;
                                                    font-weight: 700;
                                                    letter-spacing: 8px;
                                                    color: #101828;
                                                ">
                                                    ${codigo}
                                                </div>

                                                <div style="
                                                    margin-top: 10px;
                                                    font-size: 12px;
                                                    line-height: 18px;
                                                    color: #98a2b3;
                                                ">
                                                    Válido por 1 hora
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Divisor -->
                            <tr>
                                <td style="padding: 0 36px;">
                                    <div style="
                                        height: 1px;
                                        background-color: #eaecf0;
                                        font-size: 0;
                                        line-height: 0;
                                    ">
                                        &nbsp;
                                    </div>
                                </td>
                            </tr>

                            <!-- Link -->
                            <tr>
                                <td style="padding: 24px 36px 8px 36px;">

                                    <p style="
                                        margin: 0 0 18px 0;
                                        text-align: center;
                                        font-size: 14px;
                                        line-height: 22px;
                                        color: #667085;
                                    ">
                                        Se preferir, você também pode redefinir sua senha diretamente pelo botão abaixo.
                                    </p>

                                    <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        role="presentation"
                                        align="center"
                                    >
                                        <tr>
                                            <td
                                                align="center"
                                                bgcolor="#f47b20"
                                                style="
                                                    border-radius: 9px;
                                                    background-color: #f47b20;
                                                "
                                            >
                                                <a
                                                    href="${linkRecuperacao}"
                                                    target="_blank"
                                                    style="
                                                        display: inline-block;
                                                        padding: 14px 26px;
                                                        font-size: 14px;
                                                        line-height: 18px;
                                                        font-weight: 700;
                                                        color: #ffffff;
                                                        text-decoration: none;
                                                        border-radius: 9px;
                                                        background-color: #f47b20;
                                                    "
                                                >
                                                    Redefinir minha senha
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Segurança -->
                            <tr>
                                <td style="padding: 24px 36px 32px 36px;">

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        role="presentation"
                                        style="
                                            width: 100%;
                                            background-color: #fff7ed;
                                            border: 1px solid #fed7aa;
                                            border-radius: 10px;
                                        "
                                    >
                                        <tr>
                                            <td style="padding: 14px 16px;">
                                                <div style="
                                                    margin-bottom: 4px;
                                                    font-size: 13px;
                                                    line-height: 19px;
                                                    font-weight: 700;
                                                    color: #9a3412;
                                                ">
                                                    Não solicitou esta alteração?
                                                </div>

                                                <div style="
                                                    font-size: 12px;
                                                    line-height: 19px;
                                                    color: #b54708;
                                                ">
                                                    Nenhuma alteração será realizada enquanto o código
                                                    ou o link acima não forem utilizados. Você pode ignorar
                                                    este e-mail com segurança.
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Rodapé -->
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding: 24px 36px;
                                        background-color: #f9fafb;
                                        border-top: 1px solid #eaecf0;
                                    "
                                >
                                    <p style="
                                        margin: 0 0 5px 0;
                                        font-size: 12px;
                                        line-height: 18px;
                                        color: #667085;
                                    ">
                                        Este é um e-mail automático enviado pelo sistema Artezza.
                                    </p>

                                    <p style="
                                        margin: 0;
                                        font-size: 11px;
                                        line-height: 17px;
                                        color: #98a2b3;
                                    ">
                                        Por segurança, não responda a esta mensagem e nunca compartilhe seu código.
                                    </p>
                                </td>
                            </tr>

                        </table>

                        <!-- Rodapé externo -->
                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            role="presentation"
                            style="width: 100%; max-width: 620px;"
                        >
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding-top: 20px;
                                        font-size: 11px;
                                        line-height: 17px;
                                        color: #98a2b3;
                                    "
                                >
                                    © ${new Date().getFullYear()} Artezza · Todos os direitos reservados
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
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