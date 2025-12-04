const db = require('../config');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

const parser = new xml2js.Parser({ explicitArray: false });

// Função não exportada, usada internamente na decodeXML para escapar strings antes de inserir no banco de dados
function escape(str) {
    return String(str || "").replace(/'/g, "''");
}

//Função não exportada, usada internamente na decodeXML para salvar o arquivo no disco e inserir o caminho no banco de dados
async function salvaArquivo(conteudoBuffer, nomeOriginal, idPedido) {

  const pastaUploads = path.resolve(__dirname, '..', '..', 'uploads');
  await fs.promises.mkdir(pastaUploads, { recursive: true });

  const timestamp = Date.now();
  const ext = path.extname(nomeOriginal) || '.xml';
  const nomeArquivo = `${timestamp}${ext}`;
  const caminhoCompleto = path.join(pastaUploads, nomeArquivo);

  try {
    await fs.promises.writeFile(caminhoCompleto, conteudoBuffer);
    //console.log(`Arquivo salvo em disco: ${caminhoCompleto}`);
  } catch (err) {
    //console.error("Erro ao salvar arquivo no disco:", err);
    throw err;
  }

  const caminhoParaBD = path.join('uploads', nomeArquivo);

  const sql = `
    INSERT INTO Arquivos (caminho, id_pedido)
    VALUES ($1, $2)
    RETURNING id_arquivo;
  `;

  try {
    const result = await db.query(sql, [caminhoParaBD, idPedido]);
    //console.log(`Caminho inserido no banco: ${caminhoParaBD}`);
    return {
      caminho: caminhoParaBD,
      idArquivo: result.rows[0].id_arquivo,
    };
  } catch (err) {
    console.error("Erro ao fazer insert na tabela Arquivos:", err);
    throw err;
  }
}

async function postImportaxml(xmlPath, idUsuarioJWT) {
  try {
    // Lê XML
    const data = await fs.promises.readFile(xmlPath, 'utf8');
    const result = await parser.parseStringPromise(data);

    const listing = result.LISTING;
    const dados = listing.CUSTOMERSDATA.DATA;
    const getDataById = (id) => dados.find(d => d.$.ID === id)?.$.VALUE || "";

    // ------------------------------
    // 0) Extrair dados do XML
    // ------------------------------
    const clienteXML = {
      nome: escape(getDataById("nomecliente")),
      razao_social: escape(getDataById("corporateName")),
      cpf_cnpj: escape(getDataById("cpfcnpj")),
      email: escape(getDataById("email")),
      telefone: escape(getDataById("celular")),
      endereco: escape(getDataById("endereco")),
      numero: escape(getDataById("address_Residential_0_Number")),
      bairro: escape(getDataById("bairro")),
      cidade: escape(getDataById("cidade")),
      uf: escape(getDataById("uf")),
      cep: escape(getDataById("cep")),
      endereco_entrega: escape(getDataById("endentrega")),
    };

    // ------------------------------
    // 1) Carrega usuário pelo JWT
    // ------------------------------
    const usuario = (await db.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [idUsuarioJWT]
    )).rows[0];

    if (!usuario) {
      return { success: false, message: "Usuário do JWT não encontrado." };
    }

    // ------------------------------
    // 2) Carrega cliente pelo id_cliente do usuário
    // ------------------------------
    const clienteBD = (await db.query(
      "SELECT * FROM clientes WHERE id = $1",
      [usuario.id_cliente]
    )).rows[0];

    if (!clienteBD) {
      return { success: false, message: "Cliente vinculado ao usuário não encontrado." };
    }

    //console.log("Usuário encontrado:", usuario);
    //console.log("Cliente encontrado:", clienteBD);

    // ------------------------------
    // 3) Atualiza somente campos vazios do cliente
    // ------------------------------
    let updates = [];
    let updateValues = [];
    let index = 1;

    for (const campo in clienteXML) {
      if (!clienteBD[campo] || clienteBD[campo] === "") {
        updates.push(`${campo} = $${index}`);
        updateValues.push(clienteXML[campo]);
        index++;
      }
    }

    if (updates.length > 0) {
      updateValues.push(clienteBD.id);
      await db.query(
        `UPDATE clientes SET ${updates.join(", ")} WHERE id = $${index}`,
        updateValues
      );
      //console.log("Cliente atualizado com campos do XML.");
    }

    // ------------------------------
    // 4) Criar Pedido vinculado ao cliente
    // ------------------------------
    const nomeProjeto = escape(getDataById("Environment") || "Projeto");
    const valorTotal = listing.TOTALPRICES?.$.TABLE || "0";

    const pedidoResult = await db.query(
      `INSERT INTO pedidos (nome_projeto, valor, data_pedido, id_cliente)
       VALUES ($1, $2, CURRENT_DATE, $3)
       RETURNING id`,
      [nomeProjeto, valorTotal, clienteBD.id]
    );

    const idPedido = pedidoResult.rows[0].id;
    //console.log("Pedido criado com ID:", idPedido);

    // ------------------------------
    // 5) Itens do projeto
    // ------------------------------
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
          itensProjeto.push({
            descricao: escape(item.$.DESCRIPTION || "Sem descrição"),
            quantidade: parseInt(item.$.QUANTITY || "1"),
            componentes: item.ITEMS?.ITEM
              ? (Array.isArray(item.ITEMS.ITEM)
                ? item.ITEMS.ITEM.map(s => escape(s.$.DESCRIPTION))
                : [escape(item.ITEMS.ITEM.$.DESCRIPTION)])
              : []
          });
        });
      });
    });

    // Inserir itens e componentes
    for (let item of itensProjeto) {
      const itemRes = await db.query(
        `INSERT INTO itens_pedido (descricao_item, quantidade_item, id_pedido)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [item.descricao, item.quantidade, idPedido]
      );

      const idItem = itemRes.rows[0].id;

      for (let comp of item.componentes) {
        await db.query(
          `INSERT INTO componentes_itens (nome_componente, id_item)
           VALUES ($1, $2)`,
          [comp, idItem]
        );
      }
    }

    // ------------------------------
    // 6) Salvar XML no banco
    // ------------------------------
    const xmlBuffer = await fs.promises.readFile(xmlPath);
    await salvaArquivo(xmlBuffer, path.basename(xmlPath), idPedido);

    return { success: true, idPedido };

  } catch (error) {
    console.error("Erro no importaxml:", error);
    return { success: false, error: error.message };
  }
}




//função que faz o insert no banco de dados
// Ela recebe o SQL como parâmetro e executa dentro de uma transação
// Se ocorrer algum erro, ela faz o rollback e retorna uma mensagem de erro
// Se tudo ocorrer bem, ela faz o commit e retorna uma mensagem de sucesso

//Função não exportada, usada internamente na decodeXML para executar o SQL
async function insertSQL(sql) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(sql); // <- CAPTURA AQUI

        await client.query('COMMIT');
        return {
            success: true,
            message: 'Inserção feita com sucesso.',
            rows: result.rows // <- RETORNA O RESULTADO
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro na transação:', error.message);
        return { success: false, message: 'Não foi possível fazer o insert.', error: error.message };
    } finally {
        client.release();
    }
}


// Função para criar um arquivo temporário com o conteúdo do buffer
async function criarArquivoTemporario(buffer) {
  const nomeArquivoTemp = `xml_${Date.now()}.xml`;
  const caminhoTemp = path.resolve(__dirname, '..', 'temp', nomeArquivoTemp);

  fs.mkdirSync(path.dirname(caminhoTemp), { recursive: true });
  await fs.promises.writeFile(caminhoTemp, buffer);

  return { caminhoTemp, nomeArquivoTemp };
}

// Função para excluir o arquivo temporário após o processamento
async function excluirArquivoTemporario(caminhoTemp, nomeArquivoTemp) {
  try {
    await fs.promises.unlink(caminhoTemp);
    //console.log(`Arquivo temporário ${nomeArquivoTemp} excluído com sucesso.`);
  } catch (err) {
    //console.log(`Não foi possível excluir o arquivo temporário: ${err.message}`);
  }
}



module.exports = {
    postImportaxml,
    criarArquivoTemporario,
    excluirArquivoTemporario,
};