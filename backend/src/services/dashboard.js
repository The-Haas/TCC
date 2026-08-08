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

async function getDashboardLojista(idLojista, filtros = {}) {
    try {
        const { dataInicio, dataFim, agrupamento = 'mes' } = filtros;

        // 1. Busca a última etapa da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);
        const totalEtapas = parseInt(etapasResult.rows[0].total_etapas || 0);

        // 2. Montar a query dinâmica com base nas datas
        let queryParams = [idLojista];
        let whereClause = `WHERE p.id_lojista = $1`;
        let paramIndex = 2;

        if (dataInicio && dataFim) {
            whereClause += ` AND p.data_pedido >= $${paramIndex} AND p.data_pedido <= $${paramIndex + 1}`;
            queryParams.push(dataInicio, dataFim);
        }

        // 3. Busca os pedidos do lojista
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
            INNER JOIN status_pedido sp ON sp.id = p.id_status
            INNER JOIN clientes c ON c.id = p.id_cliente
            INNER JOIN lojistas l ON l.id = p.id_lojista
            LEFT JOIN representantes r ON r.id = l.id_representante
            ${whereClause}
            ORDER BY p.data_pedido DESC
        `, queryParams);

        const pedidos = result.rows;

        // 4. Processar os dados para os gráficos
        const dadosGraficos = processarDadosGraficos(pedidos, agrupamento);

        return {
            success: true,
            dashboard: {
                total_pedidos: pedidos.length,
                total_etapas: totalEtapas,
                graficos: dadosGraficos, // <- Nova chave com os gráficos prontos
                pedidos: pedidos
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

// ==========================================
// FUNÇÕES AUXILIARES PARA OS GRÁFICOS
// ==========================================

function processarDadosGraficos(pedidos, tipoAgrupamento) {
    let areaVendas = {};
    let pizzaStatus = {};
    let barrasClientes = {};

    pedidos.forEach(p => {
        // Garantir que o valor seja numérico (o PG costuma retornar Numeric como string)
        const valor = parseFloat(p.valor || 0);

        // 1. Gráfico de Pizza (Status dos Pedidos)
        if (!pizzaStatus[p.status]) {
            pizzaStatus[p.status] = { status: p.status, cor: p.cor, quantidade: 0, valor_total: 0 };
        }
        pizzaStatus[p.status].quantidade += 1;
        pizzaStatus[p.status].valor_total += valor;

        // 2. Gráfico de Barras (Ranking de Clientes)
        if (!barrasClientes[p.id_cliente]) {
            barrasClientes[p.id_cliente] = { nome: p.nome_cliente, valor_total: 0 };
        }
        barrasClientes[p.id_cliente].valor_total += valor;

        // 3. Gráfico de Área (Vendas ao longo do tempo)
        const { rotulo, chaveOrdenacao } = gerarChaveData(p.data_pedido, tipoAgrupamento);
        if (!areaVendas[chaveOrdenacao]) {
            areaVendas[chaveOrdenacao] = { periodo: rotulo, valor_total: 0, sort_key: chaveOrdenacao };
        }
        areaVendas[chaveOrdenacao].valor_total += valor;
        areaVendas[chaveOrdenacao].quantidade += 1;
    });

    // Formatar e ordenar os arrays finais para o Frontend
    const graficoPizza = Object.values(pizzaStatus);
    
    // Pega os top 10 clientes que mais compram
    const graficoBarras = Object.values(barrasClientes)
        .sort((a, b) => b.valor_total - a.valor_total)
        .slice(0, 10); 
    
    // Ordena o gráfico de área cronologicamente usando a chave (ex: "2026-08")
    const graficoArea = Object.values(areaVendas)
        .sort((a, b) => a.sort_key.localeCompare(b.sort_key))
        .map(({ sort_key, ...resto }) => resto); // Remove a chave de ordenação, manda só o necessário

    return {
        area: graficoArea,
        pizza: graficoPizza,
        barras: graficoBarras
    };
}

function gerarChaveData(dataString, tipo) {
    const data = new Date(dataString);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    
    let rotulo = '';
    let chaveOrdenacao = ''; // Usado para garantir que Janeiro venha antes de Fevereiro, etc.

    switch (tipo) {
        case 'semana':
            // Cálculo simples de semana (ISO)
            const primeiraSemana = new Date(ano, 0, 1);
            const dias = Math.floor((data - primeiraSemana) / (24 * 60 * 60 * 1000));
            const semana = Math.ceil((data.getDay() + 1 + dias) / 7);
            rotulo = `Sem ${semana}/${ano}`;
            chaveOrdenacao = `${ano}-W${String(semana).padStart(2, '0')}`;
            break;
        case 'mes':
            rotulo = `${String(mes).padStart(2, '0')}/${ano}`;
            chaveOrdenacao = `${ano}-${String(mes).padStart(2, '0')}`;
            break;
        case 'bimestral':
            const bi = Math.ceil(mes / 2);
            rotulo = `${bi}º Bim/${ano}`;
            chaveOrdenacao = `${ano}-B${bi}`;
            break;
        case 'trimestral':
            const tri = Math.ceil(mes / 3);
            rotulo = `${tri}º Tri/${ano}`;
            chaveOrdenacao = `${ano}-T${tri}`;
            break;
        case 'semestral':
            const sem = Math.ceil(mes / 6);
            rotulo = `${sem}º Sem/${ano}`;
            chaveOrdenacao = `${ano}-S${sem}`;
            break;
        case 'anual':
            rotulo = `${ano}`;
            chaveOrdenacao = `${ano}`;
            break;
        default: // 'todo o periodo'
            rotulo = 'Geral';
            chaveOrdenacao = '0000'; // Chave fixa já que tudo fica num grupo só
            break;
    }

    return { rotulo, chaveOrdenacao };
}

module.exports = {
    getDashboardCliente,
    getDashboardLojista
};