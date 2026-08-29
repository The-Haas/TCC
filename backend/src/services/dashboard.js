const db = require('../config');

async function getDashboardCliente(idCliente) {
    try {
        // 1. Busca dinamicamente qual é a última etapa (maior número) da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);

        const totalEtapas = parseInt(
            etapasResult.rows[0].total_etapas || 0
        );

        // 2. Busca os pedidos do cliente com a ordem de cada um
        const result = await db.query(`
            SELECT
                p.id,
                p.nome_projeto,
                p.data_pedido,
                p.data_previsao_pedido,
                sp.descricao AS status,
                sp.cor,
                sp.ordem AS ordem_status,
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
                total_etapas: totalEtapas,
                pedidos: result.rows
            }
        };

    } catch (error) {
        console.error(
            'Erro ao buscar dashboard:',
            error
        );

        return {
            success: false,
            message: 'Erro ao buscar dashboard.',
            error: error.message
        };
    }
}


async function getDashboardLojista(idLojista, filtros = {}) {
    try {
        const {
            dataInicio,
            dataFim,
            agrupamento = 'mes'
        } = filtros;

        // 1. Busca a última etapa da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);

        const totalEtapas = parseInt(
            etapasResult.rows[0].total_etapas || 0
        );

        // 2. Montar a query dinâmica com base nas datas
        const queryParams = [idLojista];

        let whereClause = `
            WHERE p.id_lojista = $1
        `;

        let paramIndex = 2;

        if (dataInicio && dataFim) {
            whereClause += `
                AND p.data_pedido >= $${paramIndex}
                AND p.data_pedido <= $${paramIndex + 1}
            `;

            queryParams.push(
                dataInicio,
                dataFim
            );
        }

        // 3. Busca os pedidos do lojista
        //
        // IMPORTANTE:
        // "cliente" é utilizado pela função processarDadosGraficos().
        //
        // "nome_cliente" foi mantido para o frontend e retrocompatibilidade.
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

                c.nome AS cliente,
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

            ${whereClause}

            ORDER BY p.data_pedido DESC
        `, queryParams);

        const pedidos = result.rows;

        // 4. Processar os dados para os gráficos
        //
        // Agora informamos explicitamente que esse dashboard
        // pertence ao perfil "lojista".
        const dadosGraficos = processarDadosGraficos(
            pedidos,
            agrupamento,
            'lojista'
        );

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
        console.error(
            'Erro ao buscar dashboard do lojista:',
            error
        );

        return {
            success: false,
            message: 'Erro ao buscar dashboard.',
            error: error.message
        };
    }
}


// ==========================================
// FUNÇÕES AUXILIARES PARA OS GRÁFICOS
// ==========================================

function processarDadosGraficos(
    pedidos,
    tipoAgrupamento,
    perfil = 'lojista'
) {
    const areaVendas = {};
    const pizzaStatus = {};

    const barrasRanking = {};
    const barrasRankingLojistas = {};

    pedidos.forEach(p => {
        const valor = parseFloat(
            p.valor || 0
        );

        // ==========================================
        // 1. GRÁFICO DE PIZZA
        // ==========================================

        if (!pizzaStatus[p.status]) {
            pizzaStatus[p.status] = {
                status: p.status,
                cor: p.cor,
                quantidade: 0,
                valor_total: 0
            };
        }

        pizzaStatus[p.status].quantidade += 1;
        pizzaStatus[p.status].valor_total += valor;


        // ==========================================
        // 2. GRÁFICOS DE BARRAS
        // ==========================================

        if (perfil === 'admin') {

            // ------------------------------------------
            // Ranking dos representantes
            // ------------------------------------------

            if (p.id_representante) {
                if (!barrasRanking[p.id_representante]) {
                    barrasRanking[p.id_representante] = {
                        id: p.id_representante,
                        nome:
                            p.representante ||
                            `Representante #${p.id_representante}`,
                        valor_total: 0
                    };
                }

                barrasRanking[
                    p.id_representante
                ].valor_total += valor;
            }


            // ------------------------------------------
            // Ranking dos lojistas
            // ------------------------------------------

            if (p.id_lojista) {
                if (!barrasRankingLojistas[p.id_lojista]) {
                    barrasRankingLojistas[p.id_lojista] = {
                        id: p.id_lojista,

                        nome:
                            p.lojista ||
                            `Lojista #${p.id_lojista}`,

                        representante:
                            p.representante ||
                            'Sem representante',

                        valor_total: 0
                    };
                }

                barrasRankingLojistas[
                    p.id_lojista
                ].valor_total += valor;
            }

        } else {

            let idRanking;
            let nomeRanking;


            // ------------------------------------------
            // Representante:
            // ranking dos lojistas
            // ------------------------------------------

            if (perfil === 'representante') {
                idRanking = p.id_lojista;

                nomeRanking =
                    p.lojista ||
                    p.nome_lojista ||
                    `Lojista #${p.id_lojista}`;

            } else {

                // ------------------------------------------
                // Lojista:
                // ranking dos clientes
                // ------------------------------------------

                idRanking = p.id_cliente;

                nomeRanking =
                    p.cliente ||
                    p.nome_cliente ||
                    `Cliente #${p.id_cliente}`;
            }


            if (idRanking) {
                if (!barrasRanking[idRanking]) {
                    barrasRanking[idRanking] = {
                        id: idRanking,
                        nome: nomeRanking,
                        valor_total: 0
                    };
                }

                barrasRanking[
                    idRanking
                ].valor_total += valor;
            }
        }


        // ==========================================
        // 3. GRÁFICO DE ÁREA
        // ==========================================

        const {
            rotulo,
            chaveOrdenacao
        } = gerarChaveData(
            p.data_pedido,
            tipoAgrupamento
        );

        if (!areaVendas[chaveOrdenacao]) {
            areaVendas[chaveOrdenacao] = {
                periodo: rotulo,
                valor_total: 0,
                sort_key: chaveOrdenacao
            };
        }

        areaVendas[
            chaveOrdenacao
        ].valor_total += valor;
    });


    // ==========================================
    // PREPARA OS RESULTADOS
    // ==========================================

    const graficoPizza =
        Object.values(pizzaStatus);

    const graficoArea =
        Object.values(areaVendas)
            .sort(
                (a, b) =>
                    a.sort_key.localeCompare(
                        b.sort_key
                    )
            )
            .map(
                ({
                    sort_key,
                    ...resto
                }) => resto
            );


    const resultadoGraficos = {
        area: graficoArea,
        pizza: graficoPizza
    };


    // ==========================================
    // ADMIN
    // ==========================================

    if (perfil === 'admin') {

        resultadoGraficos.barras_representantes =
            Object.values(
                barrasRanking
            )
                .sort(
                    (a, b) =>
                        b.valor_total -
                        a.valor_total
                )
                .slice(0, 10);


        resultadoGraficos.barras_lojistas =
            Object.values(
                barrasRankingLojistas
            )
                .sort(
                    (a, b) =>
                        b.valor_total -
                        a.valor_total
                )
                .slice(0, 10);

    } else {

        // ==========================================
        // REPRESENTANTE / LOJISTA
        // ==========================================

        resultadoGraficos.barras =
            Object.values(
                barrasRanking
            )
                .sort(
                    (a, b) =>
                        b.valor_total -
                        a.valor_total
                )
                .slice(0, 10);
    }


    return resultadoGraficos;
}


function gerarChaveData(
    dataString,
    tipo
) {
    const data = new Date(dataString);

    const mes =
        data.getMonth() + 1;

    const ano =
        data.getFullYear();

    let rotulo = '';
    let chaveOrdenacao = '';

    switch (tipo) {

        case 'semana': {
            // Cálculo simples de semana
            const primeiraSemana =
                new Date(
                    ano,
                    0,
                    1
                );

            const dias = Math.floor(
                (
                    data -
                    primeiraSemana
                ) /
                (
                    24 *
                    60 *
                    60 *
                    1000
                )
            );

            const semana = Math.ceil(
                (
                    data.getDay() +
                    1 +
                    dias
                ) / 7
            );

            rotulo =
                `Sem ${semana}/${ano}`;

            chaveOrdenacao =
                `${ano}-W${String(semana).padStart(2, '0')}`;

            break;
        }


        case 'mes': {
            rotulo =
                `${String(mes).padStart(2, '0')}/${ano}`;

            chaveOrdenacao =
                `${ano}-${String(mes).padStart(2, '0')}`;

            break;
        }


        case 'bimestral': {
            const bi =
                Math.ceil(
                    mes / 2
                );

            rotulo =
                `${bi}º Bim/${ano}`;

            chaveOrdenacao =
                `${ano}-B${bi}`;

            break;
        }


        case 'trimestral': {
            const tri =
                Math.ceil(
                    mes / 3
                );

            rotulo =
                `${tri}º Tri/${ano}`;

            chaveOrdenacao =
                `${ano}-T${tri}`;

            break;
        }


        case 'semestral': {
            const sem =
                Math.ceil(
                    mes / 6
                );

            rotulo =
                `${sem}º Sem/${ano}`;

            chaveOrdenacao =
                `${ano}-S${sem}`;

            break;
        }


        case 'anual': {
            rotulo =
                `${ano}`;

            chaveOrdenacao =
                `${ano}`;

            break;
        }


        default: {
            rotulo = 'Geral';
            chaveOrdenacao = '0000';
            break;
        }
    }


    return {
        rotulo,
        chaveOrdenacao
    };
}


async function getDashboardRepresentante(
    idRepresentante,
    filtros = {}
) {
    try {
        const {
            dataInicio,
            dataFim,
            agrupamento = 'mes'
        } = filtros;


        // 1. Busca a última etapa da linha do tempo
        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);

        const totalEtapas = parseInt(
            etapasResult.rows[0].total_etapas || 0
        );


        // 2. Monta query dinâmica
        const queryParams = [
            idRepresentante
        ];

        let whereClause = `
            WHERE l.id_representante = $1
        `;

        let paramIndex = 2;


        if (dataInicio && dataFim) {
            whereClause += `
                AND p.data_pedido >= $${paramIndex}
                AND p.data_pedido <= $${paramIndex + 1}
            `;

            queryParams.push(
                dataInicio,
                dataFim
            );
        }


        // 3. Busca os pedidos
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
                c.nome AS nome_cliente,

                p.id_lojista,

                l.nome AS lojista,
                l.nome AS nome_lojista,

                l.id_representante,

                r.nome AS representante,

                p.id_status,

                sp.descricao AS status,
                sp.ordem AS ordem_status,
                sp.cor

            FROM pedidos p

            INNER JOIN status_pedido sp
                ON sp.id = p.id_status

            INNER JOIN lojistas l
                ON l.id = p.id_lojista

            INNER JOIN clientes c
                ON c.id = p.id_cliente

            LEFT JOIN representantes r
                ON r.id = l.id_representante

            ${whereClause}

            ORDER BY p.data_pedido DESC
        `, queryParams);


        const pedidos =
            result.rows;


        // 4. Processa gráficos
        const dadosGraficos =
            processarDadosGraficos(
                pedidos,
                agrupamento,
                'representante'
            );


        return {
            success: true,
            dashboard: {
                total_pedidos:
                    pedidos.length,

                total_etapas:
                    totalEtapas,

                graficos:
                    dadosGraficos,

                pedidos:
                    pedidos
            }
        };

    } catch (error) {

        console.error(
            'Erro ao buscar dashboard do representante:',
            error
        );

        return {
            success: false,
            message:
                'Erro ao buscar dashboard.',
            error:
                error.message
        };
    }
}


// ==========================================
// DASHBOARD ADMIN
// ==========================================

async function getDashboardAdmin(
    filtros = {}
) {
    try {

        const {
            dataInicio,
            dataFim,
            agrupamento = 'mes'
        } = filtros;


        const etapasResult = await db.query(`
            SELECT MAX(ordem) AS total_etapas 
            FROM status_pedido 
            WHERE ordem > 0
        `);


        const totalEtapas = parseInt(
            etapasResult.rows[0].total_etapas || 0
        );


        const queryParams = [];

        let whereClause = '';


        if (
            dataInicio &&
            dataFim
        ) {
            whereClause = `
                WHERE p.data_pedido >= $1
                AND p.data_pedido <= $2
            `;

            queryParams.push(
                dataInicio,
                dataFim
            );
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

            INNER JOIN status_pedido sp
                ON sp.id = p.id_status

            INNER JOIN lojistas l
                ON l.id = p.id_lojista

            INNER JOIN clientes c
                ON c.id = p.id_cliente

            LEFT JOIN representantes r
                ON r.id = l.id_representante

            ${whereClause}

            ORDER BY p.data_pedido DESC
        `, queryParams);


        const pedidos =
            result.rows;


        const dadosGraficos =
            processarDadosGraficos(
                pedidos,
                agrupamento,
                'admin'
            );


        return {
            success: true,

            data:
                pedidos,

            total_pedidos:
                pedidos.length,

            total_etapas:
                totalEtapas,

            graficos:
                dadosGraficos
        };

    } catch (error) {

        console.error(
            'Erro ao buscar dashboard do admin:',
            error
        );


        return {
            success: false,
            message:
                'Erro ao buscar dashboard.',
            error:
                error.message
        };
    }
}


module.exports = {
    getDashboardCliente,
    getDashboardLojista,
    getDashboardRepresentante,
    getDashboardAdmin
};