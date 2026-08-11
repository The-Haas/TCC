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
            if (rows.length === 0) return;

            const pedido = rows[0];

            // 2. Determina evento final (Concluído se for maior ordem, Recusado se ordem 0)
            let eventoFinal = evento;

            if (evento !== 'CRIACAO') {
                const maxOrdemQuery = await db.query(`SELECT MAX(ordem) AS max_ordem FROM status_pedido`);
                const maxOrdem = maxOrdemQuery.rows[0]?.max_ordem;

                if (pedido.status_ordem === 0) {
                    eventoFinal = 'RECUSADO';
                } else if (pedido.status_ordem === maxOrdem && maxOrdem > 0) {
                    eventoFinal = 'CONCLUIDO';
                } else {
                    eventoFinal = 'STATUS_ALTERADO';
                }
            }

            // 3. Busca Admins
            const { rows: admins } = await db.query(`SELECT id, email, nome FROM admins`);

            // 4. Mapeia destinatários (removendo quem executou a alteração)
            const pessoasMap = new Map();

            const adicionarPessoa = (tipo, id, email, nome) => {
                if (email && email.trim() !== '') {
                    const eOAutor = usuarioAutor && tipo === usuarioAutor.tipo && String(id) === String(usuarioAutor.id);
                    if (!eOAutor && !pessoasMap.has(email.toLowerCase())) {
                        pessoasMap.set(email.toLowerCase(), {
                            tipo,
                            id,
                            email: email.trim(),
                            nome: nome || 'Usuário'
                        });
                    }
                }
            };

            adicionarPessoa('cliente', pedido.cliente_id, pedido.cliente_email, pedido.cliente_nome);
            adicionarPessoa('lojista', pedido.lojista_id, pedido.lojista_email, pedido.lojista_nome);
            adicionarPessoa('representante', pedido.representante_id, pedido.representante_email, pedido.representante_nome);
            
            admins.forEach(admin => {
                adicionarPessoa('admin', admin.id, admin.email, admin.nome);
            });

            const destinatarios = Array.from(pessoasMap.values());
            if (destinatarios.length === 0) return;

            // 5. Configuração SMTP do Banco
            const configDb = await db.query(`SELECT * FROM configuracoes LIMIT 1`);
            if (configDb.rows.length === 0) return;
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

            const urlFrontend = process.env.FRONTEND_URL || 'http://localhost:9000';
            const nomeProj = dadosExtras.nome_projeto || pedido.nome_projeto || `Projeto #${pedido.pedido_id}`;
            const statusProj = dadosExtras.status_nome || pedido.status_nome || 'Status Atualizado';

            // 6. Layout do E-mail por Evento
            let layout = {
                assunto: `[Artezza] Atualização no Projeto #${pedido.pedido_id}: ${nomeProj}`,
                badgeText: 'ALTERAÇÃO DE STATUS',
                badgeBg: '#e0f2fe',
                badgeColor: '#0369a1',
                tituloHeader: 'Status Atualizado',
                subtituloHeader: 'O seu projeto teve uma nova atualização no sistema',
                headerGradiente: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                icone: '📦',
                mensagem: `O status do seu projeto foi alterado para <strong>${statusProj}</strong>.`
            };

            switch (eventoFinal) {
                case 'CRIACAO':
                    layout = {
                        assunto: `🚀 Projeto #${pedido.pedido_id} Cadastrado: ${nomeProj}`,
                        badgeText: 'NOVO PROJETO',
                        badgeBg: '#dcfce7',
                        badgeColor: '#15803d',
                        tituloHeader: 'Projeto Cadastrado!',
                        subtituloHeader: 'Um novo projeto deu entrada e já está disponível',
                        headerGradiente: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                        icone: '✨',
                        mensagem: `Um novo projeto foi cadastrado com sucesso no sistema e já está em processamento.`
                    };
                    break;

                case 'RECUSADO':
                    layout = {
                        assunto: `🚨 Projeto #${pedido.pedido_id} Recusado / Cancelado: ${nomeProj}`,
                        badgeText: 'RECUSADO / CANCELADO',
                        badgeBg: '#fee2e2',
                        badgeColor: '#b91c1c',
                        tituloHeader: 'Atenção Necessária',
                        subtituloHeader: 'O projeto foi sinalizado como recusado ou cancelado',
                        headerGradiente: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
                        icone: '⚠️',
                        mensagem: `O projeto teve seu status alterado para <strong>${statusProj}</strong>. Por favor, consulte os detalhes no sistema.`
                    };
                    break;

                case 'CONCLUIDO':
                    layout = {
                        assunto: `🏆 Projeto #${pedido.pedido_id} Finalizado: ${nomeProj}`,
                        badgeText: '100% CONCLUÍDO',
                        badgeBg: '#d1fae5',
                        badgeColor: '#047857',
                        tituloHeader: 'Projeto Concluído!',
                        subtituloHeader: 'Todas as etapas deste projeto foram finalizadas',
                        headerGradiente: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
                        icone: '🎉',
                        mensagem: `Temos uma ótima notícia! O projeto foi totalmente finalizado com sucesso.`
                    };
                    break;
            }

            // 7. Renderização e envio por tipo de perfil
            const envios = destinatarios.map(destinatario => {
                
                const renderLinha = (label, valor, valorDestaque = false) => {
                    if (!valor) return '';
                    return `
                        <tr>
                            <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">${label}:</td>
                            <td style="padding: 7px 0; font-size: 14px; color: ${valorDestaque ? '#0f172a' : '#334155'}; font-weight: ${valorDestaque ? '700' : '500'}; text-align: right;">${valor}</td>
                        </tr>
                    `;
                };

                let linhasDetalhes = '';

                // --- 1. CAMPOS COMUNS (Todos os perfis) ---
                linhasDetalhes += renderLinha('ID do Projeto', `#${pedido.pedido_id}`, true);
                linhasDetalhes += renderLinha('Nome do Projeto', nomeProj);
                linhasDetalhes += renderLinha('Status Atual', `<span style="font-size: 12px; font-weight: 700; color: #0f172a; background-color: #ffffff; padding: 3px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">${statusProj}</span>`);

                // --- 2. DATA DE PREVISÃO DO PEDIDO (Todos os perfis, se existir) ---
                if (pedido.data_previsao_formatada) {
                    linhasDetalhes += renderLinha('Previsão de Entrega', pedido.data_previsao_formatada, true);
                }

                // --- 3. CLIENTE E ID DO CLIENTE (Lojista, Representante e Admin) ---
                if (['lojista', 'representante', 'admin'].includes(destinatario.tipo)) {
                    if (pedido.cliente_nome) {
                        const infoCliente = `${pedido.cliente_nome} <span style="font-size: 11px; color: #64748b;">(ID: ${pedido.cliente_id})</span>`;
                        linhasDetalhes += renderLinha('Cliente', infoCliente);
                    }
                }

                // --- 4. LOJISTA E ID DO LOJISTA ---
                if (destinatario.tipo === 'cliente') {
                    // Cliente vê apenas o nome do Lojista
                    if (pedido.lojista_nome) {
                        linhasDetalhes += renderLinha('Lojista', pedido.lojista_nome);
                    }
                } else if (['representante', 'admin'].includes(destinatario.tipo)) {
                    // Representante e Admin vêem Lojista + ID Lojista
                    if (pedido.lojista_nome) {
                        const infoLojista = `${pedido.lojista_nome} <span style="font-size: 11px; color: #64748b;">(ID: ${pedido.lojista_id})</span>`;
                        linhasDetalhes += renderLinha('Lojista', infoLojista);
                    }
                }

                // --- 5. REPRESENTANTE E ID DO REPRESENTANTE (Apenas Admin) ---
                if (destinatario.tipo === 'admin') {
                    if (pedido.representante_nome) {
                        const infoRep = `${pedido.representante_nome} <span style="font-size: 11px; color: #64748b;">(ID: ${pedido.representante_id})</span>`;
                        linhasDetalhes += renderLinha('Representante', infoRep);
                    }
                }

                const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 15px;">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                                    
                                    <!-- CABEÇALHO -->
                                    <tr>
                                        <td style="background: ${layout.headerGradiente}; padding: 38px 30px; text-align: center; color: #ffffff;">
                                            <div style="font-size: 40px; margin-bottom: 10px; line-height: 1;">${layout.icone}</div>
                                            <h1 style="margin: 0; font-size: 25px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">${layout.tituloHeader}</h1>
                                            <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 400;">${layout.subtituloHeader}</p>
                                        </td>
                                    </tr>

                                    <!-- CORPO -->
                                    <tr>
                                        <td style="padding: 36px 32px;">
                                            
                                            <!-- BADGE -->
                                            <div style="margin-bottom: 20px;">
                                                <span style="display: inline-block; padding: 6px 14px; background-color: ${layout.badgeBg}; color: ${layout.badgeColor}; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; border-radius: 30px;">
                                                    ${layout.badgeText}
                                                </span>
                                            </div>

                                            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 12px 0; font-weight: 700;">
                                                Olá, ${destinatario.nome}!
                                            </h2>
                                            
                                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 28px 0;">
                                                ${layout.mensagem}
                                            </p>

                                            <!-- CARD INFORMATIVO -->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 14px; padding: 20px; margin-bottom: 32px;">
                                                <tr>
                                                    <td>
                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            ${linhasDetalhes}
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- BOTÃO CTA -->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${urlFrontend}/pedidos" target="_blank" style="display: block; width: 100%; max-width: 280px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                                                            Visualizar no Sistema →
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>

                                    <!-- RODAPÉ -->
                                    <tr>
                                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center;">
                                            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.5px;">ARTEZZA</p>
                                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                                                Notificação automática enviada para o seu perfil. Por favor, não responda.
                                            </p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                `;

                return transporter.sendMail({
                    from: `"Artezza" <${config.smtp_user}>`,
                    to: destinatario.email,
                    subject: layout.assunto,
                    html
                });
            });

            await Promise.allSettled(envios);

        } catch (error) {
            // Tratamento silencioso em background
        }
    });
}

module.exports = { dispararNotificacaoPedido };