const db = require('../config');

async function getDashboardCliente(idCliente) {
    try {
        // 1. Busca dinamicamente qual é a última etapa (maior número) da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);
        const totalEtapas = parseInt(etapasResult.rows[0].total_etapas || 0);

        // 2. Busca os pedidos do cliente com a ordem de cada um
        const result = await db.query(`
            SELECT
                p.id,
                p.nome_projeto,
                p.valor,
                p.data_pedido,
                p.data_previsao_pedido,
                sp.descricao AS status,
                sp.cor,
                sp.ordem AS ordem_status, -- Ordem do status atual do pedido
                p.id_lojista,
                l.nome AS nome_lojista,
                l.telefone AS telefone_lojista,
                l.email AS email_lojista
            FROM pedidos p
            INNER JOIN status_pedido sp
                ON sp.id = p.id_status
            INNER JOIN lojistas l
                ON l.id = p.id_lojista
            WHERE p.id_cliente = $1
            ORDER BY p.data_pedido DESC
        `, [idCliente]);

        return {
            success: true,
            dashboard: {
                total_pedidos: result.rows.length,
                total_etapas: totalEtapas, // ← Enviando o total de etapas para o Frontend
                pedidos: result.rows
            }
        };

    } catch (error) {
        console.error("Erro ao buscar dashboard:", error);

        return {
            success: false,
            message: "Erro ao buscar dashboard.",
            error: error.message
        };
    }
}

async function getDashboardLojista(idLojista) {
    try {
        // 1. Busca a última etapa da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);
        const totalEtapas = parseInt(etapasResult.rows[0].total_etapas || 0);

        // 2. Busca os pedidos do lojista e cruza com cliente e representante
        const result = await db.query(`
            SELECT
                p.id,
                p.nome_projeto,
                p.valor,
                p.data_pedido,
                p.data_previsao_pedido,
                p.enviado_por,
                sp.descricao AS status,
                sp.cor,
                sp.ordem AS ordem_status,
                p.id_cliente,
                c.nome AS nome_cliente,
                c.telefone AS telefone_cliente,
                c.email AS email_cliente,
                r.id AS id_representante,
                r.nome AS nome_representante,
                r.email AS email_representante,
                r.telefone AS telefone_representante
            FROM pedidos p
            INNER JOIN status_pedido sp 
                ON sp.id = p.id_status
            INNER JOIN clientes c 
                ON c.id = p.id_cliente
            INNER JOIN lojistas l 
                ON l.id = p.id_lojista
            LEFT JOIN representantes r 
                ON r.id = l.id_representante
            WHERE p.id_lojista = $1
            ORDER BY p.data_pedido DESC
        `, [idLojista]);

        return {
            success: true,
            dashboard: {
                total_pedidos: result.rows.length,
                total_etapas: totalEtapas,
                pedidos: result.rows
            }
        };

    } catch (error) {
        console.error("Erro ao buscar dashboard do lojista:", error);
        return {
            success: false,
            message: "Erro ao buscar dashboard.",
            error: error.message
        };
    }
}

module.exports = {
    getDashboardCliente,
    getDashboardLojista
};