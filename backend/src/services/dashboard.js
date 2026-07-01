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

module.exports = {
    getDashboardCliente
};