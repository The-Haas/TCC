const db = require('../config');
const nodemailer = require('nodemailer');

/**
 * Envia notificações por e-mail em SEGUNDO PLANO com conteúdo dinâmico e personalizado por perfil.
 */
function dispararNotificacaoPedido({ idPedido, usuarioAutor, evento, dadosExtras = {} }) {
    // Executa em segundo plano sem travar a API do Node.js
    setImmediate(async () => {
        try {
            // 1. Busca os dados completos do pedido e envolvidos
            const queryPedido = `
                SELECT 
                    p.id AS pedido_id,
                    p.nome_projeto,
                    p.valor,
                    TO_CHAR(p.data_pedido, 'DD/MM/YYYY') AS data_pedido_formatada,
                    TO_CHAR(p.data_previsao_pedido, 'DD/MM/YYYY') AS data_previsao_formatada,
                    c.id AS cliente_id, c.email AS cliente_email, c.nome AS cliente_nome,
                    l.id AS lojista_id, l.email AS lojista_email, l.nome AS lojista_nome,
                    r.id AS representante_id, r.email AS representante_email, r.nome AS representante_nome,
                    sp.id AS status_id, sp.descricao AS status_nome, sp.ordem AS status_ordem, sp.cor AS status_cor
                FROM pedidos p
                LEFT JOIN clientes c ON c.id = p.id_cliente
                LEFT JOIN lojistas l ON l.id = p.id_lojista
                LEFT JOIN representantes r ON r.id = l.id_representante
                LEFT JOIN status_pedido sp ON sp.id = p.id_status
                WHERE p.id = $1
            `;

            const { rows } = await db.query(queryPedido, [idPedido]);

            if (rows.length === 0) {
                return;
            }

            const pedido = rows[0];

            // 2. Determina evento final
            // Concluído se for maior ordem, Recusado se ordem 0
            let eventoFinal = evento;

            if (evento !== 'CRIACAO') {
                const maxOrdemQuery = await db.query(`
                    SELECT MAX(ordem) AS max_ordem
                    FROM status_pedido
                `);

                const maxOrdem = maxOrdemQuery.rows[0]?.max_ordem;

                if (pedido.status_ordem === 0) {
                    eventoFinal = 'RECUSADO';
                } else if (
                    pedido.status_ordem === maxOrdem &&
                    maxOrdem > 0
                ) {
                    eventoFinal = 'CONCLUIDO';
                } else {
                    eventoFinal = 'STATUS_ALTERADO';
                }
            }

            // 3. Busca Admins
            const { rows: admins } = await db.query(`
                SELECT id, email, nome
                FROM admins
            `);

            // 4. Mapeia destinatários removendo quem executou a alteração
            const pessoasMap = new Map();

            const adicionarPessoa = (tipo, id, email, nome) => {
                if (email && email.trim() !== '') {
                    const eOAutor =
                        usuarioAutor &&
                        tipo === usuarioAutor.tipo &&
                        String(id) === String(usuarioAutor.id);

                    if (
                        !eOAutor &&
                        !pessoasMap.has(email.toLowerCase())
                    ) {
                        pessoasMap.set(email.toLowerCase(), {
                            tipo,
                            id,
                            email: email.trim(),
                            nome: nome || 'Usuário'
                        });
                    }
                }
            };

            adicionarPessoa(
                'cliente',
                pedido.cliente_id,
                pedido.cliente_email,
                pedido.cliente_nome
            );

            adicionarPessoa(
                'lojista',
                pedido.lojista_id,
                pedido.lojista_email,
                pedido.lojista_nome
            );

            adicionarPessoa(
                'representante',
                pedido.representante_id,
                pedido.representante_email,
                pedido.representante_nome
            );

            admins.forEach(admin => {
                adicionarPessoa(
                    'admin',
                    admin.id,
                    admin.email,
                    admin.nome
                );
            });

            const destinatarios = Array.from(pessoasMap.values());

            if (destinatarios.length === 0) {
                return;
            }

            // 5. Configuração SMTP do Banco
            const configDb = await db.query(`
                SELECT *
                FROM configuracoes
                LIMIT 1
            `);

            if (configDb.rows.length === 0) {
                return;
            }

            const config = configDb.rows[0];

            const transporter = nodemailer.createTransport({
                host: config.smtp_host,
                port: config.smtp_port,
                secure: config.smtp_secure,
                auth: {
                    user: config.smtp_user,
                    pass: config.smtp_pass
                }
            });

            const urlFrontend =
                process.env.FRONTEND_URL ||
                'http://localhost:9000';

            const nomeProj =
                dadosExtras.nome_projeto ||
                pedido.nome_projeto ||
                `Projeto #${pedido.pedido_id}`;

            const statusProj =
                dadosExtras.status_nome ||
                pedido.status_nome ||
                'Status Atualizado';

            // 6. Identidade visual do e-mail por evento
            // O cabeçalho permanece Artezza (navy)
            // e a cor do evento aparece apenas como sinalização
            let layout = {
                assunto: `Projeto #${pedido.pedido_id} atualizado | ${statusProj}`,
                badgeText: 'STATUS ATUALIZADO',
                accentColor: '#f47b20',
                accentSoft: '#fff4eb',
                accentBorder: '#fed7aa',
                accentText: '#c2410c',
                simbolo: '↗',
                titulo: 'O projeto avançou para uma nova etapa',
                subtitulo: 'Uma atualização foi registrada no fluxo do projeto.',
                mensagem: `
                    O status do projeto foi alterado para
                    <strong style="color:#101828;">
                        ${statusProj}
                    </strong>.
                `
            };

            switch (eventoFinal) {
                case 'CRIACAO':
                    layout = {
                        assunto:
                            `Novo projeto cadastrado | #${pedido.pedido_id} - ${nomeProj}`,
                        badgeText: 'NOVO PROJETO',
                        accentColor: '#16a34a',
                        accentSoft: '#f0fdf4',
                        accentBorder: '#bbf7d0',
                        accentText: '#15803d',
                        simbolo: '+',
                        titulo: 'Novo projeto cadastrado',
                        subtitulo:
                            'O projeto já está disponível para acompanhamento no sistema.',
                        mensagem:
                            'Um novo projeto foi cadastrado com sucesso e já entrou no fluxo de acompanhamento da Artezza.'
                    };
                    break;

                case 'RECUSADO':
                    layout = {
                        assunto:
                            `Ação necessária | Projeto #${pedido.pedido_id} - ${statusProj}`,
                        badgeText: 'ATENÇÃO NECESSÁRIA',
                        accentColor: '#dc2626',
                        accentSoft: '#fef2f2',
                        accentBorder: '#fecaca',
                        accentText: '#b91c1c',
                        simbolo: '!',
                        titulo: 'O projeto requer atenção',
                        subtitulo:
                            'O status indica que é necessário consultar os detalhes do projeto.',
                        mensagem: `
                            O projeto teve seu status alterado para
                            <strong style="color:#101828;">
                                ${statusProj}
                            </strong>.
                            Consulte o sistema para verificar os detalhes
                            e as próximas ações.
                        `
                    };
                    break;

                case 'CONCLUIDO':
                    layout = {
                        assunto:
                            `Projeto concluído | #${pedido.pedido_id} - ${nomeProj}`,
                        badgeText: 'PROJETO CONCLUÍDO',
                        accentColor: '#16a34a',
                        accentSoft: '#f0fdf4',
                        accentBorder: '#bbf7d0',
                        accentText: '#15803d',
                        simbolo: '✓',
                        titulo: 'Projeto concluído com sucesso',
                        subtitulo:
                            'Todas as etapas previstas para este projeto foram finalizadas.',
                        mensagem:
                            'Temos uma ótima notícia: o projeto foi concluído e todas as etapas do fluxo foram finalizadas com sucesso.'
                    };
                    break;
            }

            // 7. Renderização e envio por tipo de perfil
            const envios = destinatarios.map(destinatario => {
                const renderLinha = (
                    label,
                    valor,
                    valorDestaque = false
                ) => {
                    if (!valor) {
                        return '';
                    }

                    return `
                        <tr>
                            <td
                                valign="top"
                                style="
                                    padding: 10px 0;
                                    font-family: Arial, Helvetica, sans-serif;
                                    font-size: 12px;
                                    line-height: 18px;
                                    color: #667085;
                                    font-weight: 600;
                                    border-bottom: 1px solid #eaecf0;
                                "
                            >
                                ${label}
                            </td>

                            <td
                                valign="top"
                                align="right"
                                style="
                                    padding: 10px 0 10px 18px;
                                    font-family: Arial, Helvetica, sans-serif;
                                    font-size: 13px;
                                    line-height: 19px;
                                    color: ${valorDestaque ? '#101828' : '#344054'};
                                    font-weight: ${valorDestaque ? '700' : '500'};
                                    border-bottom: 1px solid #eaecf0;
                                "
                            >
                                ${valor}
                            </td>
                        </tr>
                    `;
                };

                let linhasDetalhes = '';

                // CAMPOS COMUNS
                linhasDetalhes += renderLinha(
                    'Projeto',
                    `
                        <strong style="color:#101828;">
                            #${pedido.pedido_id}
                        </strong>
                    `,
                    true
                );

                linhasDetalhes += renderLinha(
                    'Nome',
                    nomeProj
                );

                linhasDetalhes += renderLinha(
                    'Status atual',
                    `
                        <span
                            style="
                                display: inline-block;
                                padding: 5px 10px;
                                background-color: ${layout.accentSoft};
                                border: 1px solid ${layout.accentBorder};
                                border-radius: 999px;
                                color: ${layout.accentText};
                                font-size: 11px;
                                line-height: 15px;
                                font-weight: 700;
                                white-space: nowrap;
                            "
                        >
                            ${statusProj}
                        </span>
                    `,
                    true
                );

                // PREVISÃO
                if (pedido.data_previsao_formatada) {
                    linhasDetalhes += renderLinha(
                        'Previsão de entrega',
                        pedido.data_previsao_formatada,
                        true
                    );
                }

                // CLIENTE
                if (
                    ['lojista', 'representante', 'admin']
                        .includes(destinatario.tipo)
                ) {
                    if (pedido.cliente_nome) {
                        const infoCliente = `
                            ${pedido.cliente_nome}

                            <span
                                style="
                                    font-size: 10px;
                                    color: #98a2b3;
                                    white-space: nowrap;
                                "
                            >
                                &nbsp;#${pedido.cliente_id}
                            </span>
                        `;

                        linhasDetalhes += renderLinha(
                            'Cliente',
                            infoCliente
                        );
                    }
                }

                // LOJISTA
                if (destinatario.tipo === 'cliente') {
                    if (pedido.lojista_nome) {
                        linhasDetalhes += renderLinha(
                            'Lojista',
                            pedido.lojista_nome
                        );
                    }
                } else if (
                    ['representante', 'admin']
                        .includes(destinatario.tipo)
                ) {
                    if (pedido.lojista_nome) {
                        const infoLojista = `
                            ${pedido.lojista_nome}

                            <span
                                style="
                                    font-size: 10px;
                                    color: #98a2b3;
                                    white-space: nowrap;
                                "
                            >
                                &nbsp;#${pedido.lojista_id}
                            </span>
                        `;

                        linhasDetalhes += renderLinha(
                            'Lojista',
                            infoLojista
                        );
                    }
                }

                // REPRESENTANTE
                if (
                    destinatario.tipo === 'admin' &&
                    pedido.representante_nome
                ) {
                    const infoRep = `
                        ${pedido.representante_nome}

                        <span
                            style="
                                font-size: 10px;
                                color: #98a2b3;
                                white-space: nowrap;
                            "
                        >
                            &nbsp;#${pedido.representante_id}
                        </span>
                    `;

                    linhasDetalhes += renderLinha(
                        'Representante',
                        infoRep
                    );
                }

                const html = `
                    <!DOCTYPE html>
                    <html lang="pt-BR">

                    <head>
                        <meta charset="utf-8">

                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0"
                        >

                        <meta
                            name="color-scheme"
                            content="light"
                        >

                        <meta
                            name="supported-color-schemes"
                            content="light"
                        >

                        <title>
                            ${layout.assunto}
                        </title>
                    </head>

                    <body
                        style="
                            margin: 0;
                            padding: 0;
                            background-color: #f3f5f7;
                            font-family: Arial, Helvetica, sans-serif;
                            color: #1d2939;
                        "
                    >

                        <!-- Preheader -->
                        <div
                            style="
                                display: none;
                                max-height: 0;
                                overflow: hidden;
                                opacity: 0;
                                color: transparent;
                            "
                        >
                            Projeto #${pedido.pedido_id}:
                            ${statusProj}.
                            Consulte os detalhes no Portal Artezza.
                        </div>

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            role="presentation"
                            style="
                                width: 100%;
                                background-color: #f3f5f7;
                            "
                        >
                            <tr>
                                <td
                                    align="center"
                                    style="padding: 40px 16px;"
                                >

                                    <!-- Card principal -->
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
                                            border: 1px solid #e4e7ec;
                                            border-radius: 18px;
                                            overflow: hidden;
                                            box-shadow: 0 10px 30px rgba(16, 24, 40, 0.08);
                                        "
                                    >

                                        <!-- Barra do evento -->
                                        <tr>
                                            <td
                                                height="5"
                                                bgcolor="${layout.accentColor}"
                                                style="
                                                    height: 5px;
                                                    background-color: ${layout.accentColor};
                                                    font-size: 0;
                                                    line-height: 0;
                                                "
                                            >
                                                &nbsp;
                                            </td>
                                        </tr>

                                        <!-- Header Artezza -->
                                        <tr>
                                            <td
                                                bgcolor="#101828"
                                                style="
                                                    padding: 27px 34px;
                                                    background-color: #101828;
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
                                                        <td valign="middle">

                                                            <div
                                                                style="
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 21px;
                                                                    line-height: 25px;
                                                                    font-weight: 800;
                                                                    letter-spacing: 2px;
                                                                    color: #ffffff;
                                                                "
                                                            >
                                                                ARTEZZA
                                                            </div>

                                                            <div
                                                                style="
                                                                    margin-top: 5px;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 11px;
                                                                    line-height: 17px;
                                                                    color: #98a2b3;
                                                                    letter-spacing: 0.3px;
                                                                "
                                                            >
                                                                Portal de projetos sob medida
                                                            </div>

                                                        </td>

                                                        <td
                                                            align="right"
                                                            valign="middle"
                                                            style="padding-left: 16px;"
                                                        >

                                                            <span
                                                                style="
                                                                    display: inline-block;
                                                                    padding: 7px 11px;
                                                                    background-color: ${layout.accentSoft};
                                                                    border: 1px solid ${layout.accentBorder};
                                                                    border-radius: 20px;
                                                                    color: ${layout.accentText};
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 10px;
                                                                    line-height: 13px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.5px;
                                                                "
                                                            >
                                                                ${layout.badgeText}
                                                            </span>

                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>

                                        <!-- Introdução -->
                                        <tr>
                                            <td
                                                style="
                                                    padding: 36px 34px 22px 34px;
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

                                                        <td
                                                            width="50"
                                                            valign="top"
                                                            style="
                                                                width: 50px;
                                                                padding-right: 16px;
                                                            "
                                                        >

                                                            <table
                                                                width="46"
                                                                height="46"
                                                                cellpadding="0"
                                                                cellspacing="0"
                                                                border="0"
                                                                role="presentation"
                                                                style="
                                                                    width: 46px;
                                                                    height: 46px;
                                                                    background-color: ${layout.accentSoft};
                                                                    border: 1px solid ${layout.accentBorder};
                                                                    border-radius: 12px;
                                                                "
                                                            >
                                                                <tr>
                                                                    <td
                                                                        align="center"
                                                                        valign="middle"
                                                                        style="
                                                                            font-family: Arial, Helvetica, sans-serif;
                                                                            font-size: 23px;
                                                                            line-height: 23px;
                                                                            font-weight: 700;
                                                                            color: ${layout.accentText};
                                                                        "
                                                                    >
                                                                        ${layout.simbolo}
                                                                    </td>
                                                                </tr>
                                                            </table>

                                                        </td>

                                                        <td valign="top">

                                                            <div
                                                                style="
                                                                    margin-bottom: 7px;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 10px;
                                                                    line-height: 14px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.8px;
                                                                    text-transform: uppercase;
                                                                    color: ${layout.accentText};
                                                                "
                                                            >
                                                                Atualização de projeto
                                                            </div>

                                                            <h1
                                                                style="
                                                                    margin: 0 0 7px 0;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 24px;
                                                                    line-height: 31px;
                                                                    font-weight: 700;
                                                                    color: #101828;
                                                                "
                                                            >
                                                                ${layout.titulo}
                                                            </h1>

                                                            <p
                                                                style="
                                                                    margin: 0;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 13px;
                                                                    line-height: 20px;
                                                                    color: #667085;
                                                                "
                                                            >
                                                                ${layout.subtitulo}
                                                            </p>

                                                        </td>
                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>

                                        <!-- Corpo -->
                                        <tr>
                                            <td
                                                style="
                                                    padding: 0 34px 34px 34px;
                                                "
                                            >

                                                <p
                                                    style="
                                                        margin: 0 0 8px 0;
                                                        font-family: Arial, Helvetica, sans-serif;
                                                        font-size: 15px;
                                                        line-height: 23px;
                                                        font-weight: 600;
                                                        color: #101828;
                                                    "
                                                >
                                                    Olá, ${destinatario.nome}!
                                                </p>

                                                <p
                                                    style="
                                                        margin: 0 0 24px 0;
                                                        font-family: Arial, Helvetica, sans-serif;
                                                        font-size: 14px;
                                                        line-height: 23px;
                                                        color: #475467;
                                                    "
                                                >
                                                    ${layout.mensagem}
                                                </p>

                                                <!-- Projeto em destaque -->
                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    border="0"
                                                    role="presentation"
                                                    style="
                                                        width: 100%;
                                                        margin-bottom: 20px;
                                                        background-color: #f9fafb;
                                                        border: 1px solid #eaecf0;
                                                        border-radius: 12px;
                                                    "
                                                >
                                                    <tr>
                                                        <td
                                                            style="
                                                                padding: 18px 20px;
                                                            "
                                                        >

                                                            <div
                                                                style="
                                                                    margin-bottom: 5px;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 10px;
                                                                    line-height: 14px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.8px;
                                                                    text-transform: uppercase;
                                                                    color: #98a2b3;
                                                                "
                                                            >
                                                                Projeto #${pedido.pedido_id}
                                                            </div>

                                                            <div
                                                                style="
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 17px;
                                                                    line-height: 24px;
                                                                    font-weight: 700;
                                                                    color: #101828;
                                                                "
                                                            >
                                                                ${nomeProj}
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Detalhes -->
                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    border="0"
                                                    role="presentation"
                                                    style="
                                                        width: 100%;
                                                        margin-bottom: 27px;
                                                        background-color: #ffffff;
                                                        border: 1px solid #e4e7ec;
                                                        border-radius: 12px;
                                                    "
                                                >
                                                    <tr>
                                                        <td
                                                            style="
                                                                padding: 8px 18px 9px 18px;
                                                            "
                                                        >

                                                            <div
                                                                style="
                                                                    padding: 8px 0 4px 0;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 10px;
                                                                    line-height: 14px;
                                                                    font-weight: 700;
                                                                    letter-spacing: 0.8px;
                                                                    text-transform: uppercase;
                                                                    color: #98a2b3;
                                                                "
                                                            >
                                                                Detalhes do projeto
                                                            </div>

                                                            <table
                                                                width="100%"
                                                                cellpadding="0"
                                                                cellspacing="0"
                                                                border="0"
                                                                role="presentation"
                                                            >
                                                                ${linhasDetalhes}
                                                            </table>

                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- CTA -->
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
                                                                background-color: #f47b20;
                                                                border-radius: 9px;
                                                            "
                                                        >

                                                            <a
                                                                href="${urlFrontend}/pedidos"
                                                                target="_blank"
                                                                style="
                                                                    display: inline-block;
                                                                    padding: 14px 26px;
                                                                    background-color: #f47b20;
                                                                    border-radius: 9px;
                                                                    font-family: Arial, Helvetica, sans-serif;
                                                                    font-size: 14px;
                                                                    line-height: 18px;
                                                                    font-weight: 700;
                                                                    color: #ffffff;
                                                                    text-decoration: none;
                                                                "
                                                            >
                                                                Visualizar projeto no sistema
                                                            </a>

                                                        </td>
                                                    </tr>
                                                </table>

                                                <p
                                                    style="
                                                        margin: 18px 0 0 0;
                                                        text-align: center;
                                                        font-family: Arial, Helvetica, sans-serif;
                                                        font-size: 11px;
                                                        line-height: 17px;
                                                        color: #98a2b3;
                                                    "
                                                >
                                                    Caso o botão não funcione,
                                                    acesse o Portal Artezza e abra
                                                    a área de projetos.
                                                </p>

                                            </td>
                                        </tr>

                                        <!-- Rodapé -->
                                        <tr>
                                            <td
                                                align="center"
                                                bgcolor="#f9fafb"
                                                style="
                                                    padding: 22px 34px;
                                                    background-color: #f9fafb;
                                                    border-top: 1px solid #eaecf0;
                                                "
                                            >

                                                <p
                                                    style="
                                                        margin: 0 0 5px 0;
                                                        font-family: Arial, Helvetica, sans-serif;
                                                        font-size: 12px;
                                                        line-height: 18px;
                                                        color: #667085;
                                                    "
                                                >
                                                    Esta notificação foi enviada
                                                    automaticamente para o seu perfil Artezza.
                                                </p>

                                                <p
                                                    style="
                                                        margin: 0;
                                                        font-family: Arial, Helvetica, sans-serif;
                                                        font-size: 11px;
                                                        line-height: 17px;
                                                        color: #98a2b3;
                                                    "
                                                >
                                                    Por favor, não responda a esta mensagem.
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
                                        style="
                                            width: 100%;
                                            max-width: 620px;
                                        "
                                    >
                                        <tr>
                                            <td
                                                align="center"
                                                style="
                                                    padding-top: 19px;
                                                    font-family: Arial, Helvetica, sans-serif;
                                                    font-size: 11px;
                                                    line-height: 17px;
                                                    color: #98a2b3;
                                                "
                                            >
                                                © ${new Date().getFullYear()}
                                                Artezza · Todos os direitos reservados
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                    </body>
                    </html>
                `;

                const textoPlano = `
ARTEZZA - Atualização de projeto

Olá, ${destinatario.nome}!

${layout.titulo}
${layout.subtitulo}

Projeto: #${pedido.pedido_id}
Nome: ${nomeProj}
Status atual: ${statusProj}
${pedido.data_previsao_formatada
    ? `Previsão de entrega: ${pedido.data_previsao_formatada}`
    : ''
}

Acesse o sistema para consultar os detalhes:
${urlFrontend}/pedidos

Mensagem automática. Por favor, não responda.
                `.trim();

                return transporter.sendMail({
                    from: `"Artezza" <${config.smtp_user}>`,
                    to: destinatario.email,
                    subject: layout.assunto,
                    text: textoPlano,
                    html
                });
            });

            await Promise.allSettled(envios);

        } catch (error) {
            // Tratamento silencioso em background
        }
    });
}

module.exports = {
    dispararNotificacaoPedido
};