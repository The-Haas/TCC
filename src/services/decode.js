const db = require('../config');
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

function escape(str) {
    return String(str || "").replace(/'/g, "''");
}

async function decodeXML(xmlPath) {
    fs.readFile(xmlPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Erro ao ler o XML:", err);
            return;
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error("Erro ao fazer o parse do XML:", err);
                return;
            }

            const listing = result.LISTING;
            const dados = listing.CUSTOMERSDATA.DATA;
            const getDataById = (id) => dados.find(d => d.$.ID === id)?.$.VALUE || "";

            const cliente = {
                nome: escape(getDataById("nomecliente")),
                razaoSocial: escape(getDataById("corporateName")),
                cpfCnpj: escape(getDataById("cpfcnpj")),
                email: escape(getDataById("email")),
                telefone: escape(getDataById("celular")),
                endereco: escape(getDataById("endereco")),
                numero: escape(getDataById("address_Residential_0_Number")),
                bairro: escape(getDataById("bairro")),
                cidade: escape(getDataById("cidade")),
                uf: escape(getDataById("uf")),
                cep: escape(getDataById("cep")),
                enderecoEntrega: escape(getDataById("endentrega")),
                tipoCliente: (() => {
                    const raw = getDataById("cpfcnpj");
                    return raw.length === 14 ? "PJ" : raw.length === 11 ? "PF" : "";
                })(),
            };

            const nomeProjeto = escape(getDataById("Environment") || "Projeto");
            const valorTotal = listing.TOTALPRICES?.$.TABLE || "0";

            const ambientes = listing.AMBIENTS?.AMBIENT;
            const listaAmbientes = Array.isArray(ambientes) ? ambientes : [ambientes];

            const itensProjeto = [];

            listaAmbientes.forEach((amb) => {
                const categorias = amb?.CATEGORIES?.CATEGORY;
                const listaCategorias = Array.isArray(categorias) ? categorias : [categorias];

                listaCategorias.forEach((cat) => {
                    const itensWrapper = cat?.ITEMS;
                    if (!itensWrapper || !itensWrapper.ITEM) return;

                    const itens = Array.isArray(itensWrapper.ITEM) ? itensWrapper.ITEM : [itensWrapper.ITEM];

                    itens.forEach((item) => {
                        const itemPrincipal = {
                            descricao: escape(item.$.DESCRIPTION || "Sem descrição"),
                            quantidade: parseInt(item.$.QUANTITY || "1"),
                            componentes: [],
                        };

                        if (item.ITEMS && item.ITEMS.ITEM) {
                            const subitens = Array.isArray(item.ITEMS.ITEM) ? item.ITEMS.ITEM : [item.ITEMS.ITEM];
                            subitens.forEach((sub) => {
                                if (sub.$?.DESCRIPTION) {
                                    itemPrincipal.componentes.push(escape(sub.$.DESCRIPTION));
                                }
                            });
                        }
                        itensProjeto.push(itemPrincipal);
                    });
                });
            });

            // Começa a montagem do SQL
            let sql = "";

            sql += "-- Inserir cliente, pedido e itens com CTEs\n";
            sql += "WITH novo_cliente AS (\n";
            sql += "  INSERT INTO Clientes (nome, razao_social, cpf_cnpj, email, telefone, endereco, numero, bairro, cidade, uf, cep, endereco_entrega, tipo_cliente)\n";
            sql += "  VALUES (\n";
            sql += `    '${cliente.nome}', '${cliente.razaoSocial}', '${cliente.cpfCnpj}', '${cliente.email}', '${cliente.telefone}',\n`;
            sql += `    '${cliente.endereco}', '${cliente.numero}', '${cliente.bairro}', '${cliente.cidade}', '${cliente.uf}', '${cliente.cep}',\n`;
            sql += `    '${cliente.enderecoEntrega}', '${cliente.tipoCliente}'\n`;
            sql += "  ) RETURNING id\n";
            sql += "),\n";

            sql += "novo_pedido AS (\n";
            sql += "  INSERT INTO Pedidos (nome_projeto, valor, data_pedido, id_cliente)\n";
            sql += "  VALUES (\n";
            sql += `    '${nomeProjeto}', ${valorTotal}, CURRENT_DATE, (SELECT id FROM novo_cliente)\n`;
            sql += "  ) RETURNING id\n";
            sql += ")";

            if (itensProjeto.length > 0) {
                sql += ",\n";
            } else {
                sql += "\n";
            }

            // Adiciona CTEs para os itens
            itensProjeto.forEach((item, i) => {
                const alias = `item_${i + 1}`;
                sql += `${alias} AS (\n`;
                sql += "  INSERT INTO Itens_Pedido (descricao_item, quantidade_item, id_pedido)\n";
                sql += "  VALUES (\n";
                sql += `    '${item.descricao}', ${item.quantidade}, (SELECT id FROM novo_pedido)\n`;
                sql += "  ) RETURNING id\n";
                sql += (i === itensProjeto.length - 1) ? ")\n" : "),\n";
            });

            // Adiciona a CTE para inserir os componentes, se existirem
            const componentesValores = [];

            itensProjeto.forEach((item, i) => {
                const alias = `item_${i + 1}`;
                item.componentes.forEach((comp) => {
                    componentesValores.push(`('${comp}', (SELECT id FROM ${alias}))`);
                });
            });

            if (componentesValores.length > 0) {
                sql += ",\n"; // vírgula antes da última CTE
                sql += "inserir_componentes AS (\n";
                sql += "  INSERT INTO Componentes_Itens (nome_componente, id_item) VALUES\n";
                sql += componentesValores.join(",\n");
                sql += "\n  RETURNING id\n";
                sql += ")\n";
            }

            sql += "\nSELECT 1 FROM novo_cliente;\n\n";

            //chamando a função de inserção SQL com try catch
            insertSQL(sql).then((result) => {
                try {
                    if (result.success) {
                        console.log(result.message);
                    } else {
                        console.error("Erro ao inserir dados:", result.message);
                    }
                } catch (error) {
                    console.error("Erro ao processar a inserção:", error);
                }
            })
        });
    });
}


//função que faz o insert no banco de dados
// Ela recebe o SQL como parâmetro e executa dentro de uma transação
// Se ocorrer algum erro, ela faz o rollback e retorna uma mensagem de erro
// Se tudo ocorrer bem, ela faz o commit e retorna uma mensagem de sucesso
async function insertSQL(sql) {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(sql);

    await client.query('COMMIT');
    return { success: true, message: 'Inserção feita com sucesso.' };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação:', error.message);
    return { success: false, message: 'Não foi possível fazer o insert.', error: error.message };
  } finally {
    client.release(); // libera o client de volta ao pool
  }
}


module.exports = {
    decodeXML,
};