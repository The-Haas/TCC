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

function processarDadosGraficos(pedidos, tipoAgrupamento, perfil = 'lojista') {
    let areaVendas = {};
    let pizzaStatus = {};
    let barrasRanking = {}; 
    let barrasRankingLojistas = {}; 

    pedidos.forEach(p => {
        const valor = parseFloat(p.valor || 0);

        // 1. Gráfico de Pizza
        if (!pizzaStatus[p.status]) {
            pizzaStatus[p.status] = { status: p.status, cor: p.cor, quantidade: 0, valor_total: 0 };
        }
        pizzaStatus[p.status].quantidade += 1;
        pizzaStatus[p.status].valor_total += valor;

        // 2. Gráfico de Barras
        if (perfil === 'admin') {
            if (p.id_representante) {
                if (!barrasRanking[p.id_representante]) {
                    barrasRanking[p.id_representante] = { nome: p.representante, valor_total: 0 };
                }
                barrasRanking[p.id_representante].valor_total += valor;
            }
            if (p.id_lojista) {
                if (!barrasRankingLojistas[p.id_lojista]) {
                    barrasRankingLojistas[p.id_lojista] = { 
                        nome: p.lojista, 
                        representante: p.representante || 'Sem representante', // <-- AQUI ESTÁ A MUDANÇA
                        valor_total: 0 
                    };
                }
                barrasRankingLojistas[p.id_lojista].valor_total += valor;
            }
        } else {
            let idRanking, nomeRanking;
            if (perfil === 'representante') {
                idRanking = p.id_lojista;
                nomeRanking = p.lojista; 
            } else {
                idRanking = p.id_cliente;
                nomeRanking = p.cliente; 
            }

            if (idRanking) {
                if (!barrasRanking[idRanking]) {
                    barrasRanking[idRanking] = { nome: nomeRanking, valor_total: 0 };
                }
                barrasRanking[idRanking].valor_total += valor;
            }
        }

        // 3. Gráfico de Área
        const { rotulo, chaveOrdenacao } = gerarChaveData(p.data_pedido, tipoAgrupamento);
        if (!areaVendas[chaveOrdenacao]) {
            areaVendas[chaveOrdenacao] = { periodo: rotulo, valor_total: 0, sort_key: chaveOrdenacao };
        }
        areaVendas[chaveOrdenacao].valor_total += valor;
    });

    const graficoPizza = Object.values(pizzaStatus);
    const graficoArea = Object.values(areaVendas)
        .sort((a, b) => a.sort_key.localeCompare(b.sort_key))
        .map(({ sort_key, ...resto }) => resto);

    let resultadoGraficos = {
        area: graficoArea,
        pizza: graficoPizza,
    };

    if (perfil === 'admin') {
        resultadoGraficos.barras_representantes = Object.values(barrasRanking)
            .sort((a, b) => b.valor_total - a.valor_total).slice(0, 10);
            
        resultadoGraficos.barras_lojistas = Object.values(barrasRankingLojistas)
            .sort((a, b) => b.valor_total - a.valor_total).slice(0, 10);
    } else {
        resultadoGraficos.barras = Object.values(barrasRanking)
            .sort((a, b) => b.valor_total - a.valor_total).slice(0, 10);
    }

    return resultadoGraficos;
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

async function getDashboardRepresentante(idRepresentante, filtros = {}) {
    try {
        const { dataInicio, dataFim, agrupamento = 'mes' } = filtros;

        // 1. Busca a última etapa da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);
        const totalEtapas = parseInt(etapasResult.rows[0].total_etapas || 0);

        // 2. Montar a query dinâmica com base nas datas e ID do Representante
        let queryParams = [idRepresentante];

        // Filtra para pegar apenas os pedidos dos lojistas vinculados a este representante
        let whereClause = `WHERE l.id_representante = $1`;
        let paramIndex = 2;

        if (dataInicio && dataFim) {
            whereClause += ` AND p.data_pedido >= $${paramIndex} AND p.data_pedido <= $${paramIndex + 1}`;
            queryParams.push(dataInicio, dataFim);
        }

        // 3. Busca os pedidos com as relações corretas conforme seu banco de dados
        // INCLUINDO AS CHAVES FALTANTES PARA IGUALAR À ROTA DE PEDIDOS
        const result = await db.query(`
            SELECT
                p.id,
                p.nome_projeto,
                p.valor,
                p.data_pedido,
                p.data_previsao_pedido,
                p.enviado_por,
                
                p.id_cliente,
                c.nome AS cliente,
                c.nome AS nome_cliente, -- Mantido para a função de gráficos e retrocompatibilidade
                
                p.id_lojista,
                l.nome AS lojista,
                l.nome AS nome_lojista, -- Mantido para a função de gráficos e retrocompatibilidade
                
                l.id_representante,
                r.nome AS representante,
                
                p.id_status,
                sp.descricao AS status,
                sp.ordem AS ordem_status,
                sp.cor
            FROM pedidos p
            INNER JOIN status_pedido sp ON sp.id = p.id_status
            INNER JOIN lojistas l ON l.id = p.id_lojista
            INNER JOIN clientes c ON c.id = p.id_cliente
            LEFT JOIN representantes r ON r.id = l.id_representante
            ${whereClause}
            ORDER BY p.data_pedido DESC
        `, queryParams);

        const pedidos = result.rows;

        // 4. Processar os dados para os gráficos avisando que é o perfil 'representante'
        const dadosGraficos = processarDadosGraficos(pedidos, agrupamento, 'representante');

        return {
            success: true,
            dashboard: {
                total_pedidos: pedidos.length,
                total_etapas: totalEtapas,
                graficos: dadosGraficos,
                pedidos: pedidos
            }
        };

    } catch (error) {
        console.error("Erro ao buscar dashboard do representante:", error);
        return {
            success: false,
            message: "Erro ao buscar dashboard.",
            error: error.message
        };
    }
}

// ==========================================
// NOVA FUNÇÃO DO ADMIN
// ==========================================
async function getDashboardAdmin(filtros = {}) {
    try {
        const { dataInicio, dataFim, agrupamento = 'mes' } = filtros;

        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);
        const totalEtapas = parseInt(etapasResult.rows[0].total_etapas || 0);

        let queryParams = [];
        let whereClause = ``;

        if (dataInicio && dataFim) {
            whereClause = `WHERE p.data_pedido >= $1 AND p.data_pedido <= $2`;
            queryParams.push(dataInicio, dataFim);
        }

        const result = await db.query(`
            SELECT
                p.id,
                p.nome_projeto,
                p.valor,
                p.data_pedido,
                p.data_previsao_pedido,
                p.enviado_por,
                p.id_cliente,
                c.nome AS cliente,
                p.id_lojista,
                l.nome AS lojista,
                l.id_representante,
                r.nome AS representante,
                p.id_status,
                sp.descricao AS status,
                sp.ordem AS ordem_status,
                sp.cor
            FROM pedidos p
            INNER JOIN status_pedido sp ON sp.id = p.id_status
            INNER JOIN lojistas l ON l.id = p.id_lojista
            INNER JOIN clientes c ON c.id = p.id_cliente
            LEFT JOIN representantes r ON r.id = l.id_representante
            ${whereClause}
            ORDER BY p.data_pedido DESC
        `, queryParams);

        const pedidos = result.rows;
        
        const dadosGraficos = processarDadosGraficos(pedidos, agrupamento, 'admin');

        // Retornamos a estrutura exata exigida
        return {
            success: true,
            data: pedidos,
            total_pedidos: pedidos.length,
            total_etapas: totalEtapas,
            graficos: dadosGraficos
        };

    } catch (error) {
        console.error("Erro ao buscar dashboard do admin:", error);
        return {
            success: false,
            message: "Erro ao buscar dashboard.",
            error: error.message
        };
    }
}

module.exports = {
    getDashboardCliente,
    getDashboardLojista,
    getDashboardRepresentante,
    getDashboardAdmin
};