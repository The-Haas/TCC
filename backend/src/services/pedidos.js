const db = require('../config');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });

// Função interna
function escape(str) {
  return String(str || "").replace(/'/g, "''");
}

async function postImportaxml(xmlString, user, idLojistaBody) {
  try {
    // ==============================
    // 1) LER XML
    // ==============================
    const result = await parser.parseStringPromise(xmlString);

    if (!result?.LISTING?.CUSTOMERSDATA?.DATA) {
      throw new Error("XML inválido: estrutura obrigatória não encontrada");
    }

    const listing = result.LISTING;
    const dados = listing.CUSTOMERSDATA.DATA;

    const getDataById = (id) =>
      dados.find(d => d.$.ID === id)?.$.VALUE || "";

    // Nome e telefone são obrigatórios
    if (!getDataById("nomecliente") || !getDataById("celular")) {
      throw new Error("XML inválido: campos 'nomecliente' e 'celular' são obrigatórios");
    }

    // ==============================
    // 2) DADOS DO CLIENTE
    // ==============================
    const clienteXML = {
      nome: escape(getDataById("nomecliente")),
      razao_social: escape(getDataById("corporateName")),
      cpf_cnpj: escape(getDataById("cpfcnpj")),       // pode vir vazio
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

    // ==============================
    // 3) BUSCAR OU CRIAR CLIENTE
    // ==============================

    // Monta a busca de forma dinâmica para evitar match indevido em campos vazios
    let clienteBD = null;

    if (clienteXML.cpf_cnpj && clienteXML.email) {
      clienteBD = (await db.query(
        `SELECT * FROM clientes WHERE cpf_cnpj = $1 OR email = $2 LIMIT 1`,
        [clienteXML.cpf_cnpj, clienteXML.email]
      )).rows[0];

    } else if (clienteXML.cpf_cnpj) {
      clienteBD = (await db.query(
        `SELECT * FROM clientes WHERE cpf_cnpj = $1 LIMIT 1`,
        [clienteXML.cpf_cnpj]
      )).rows[0];

    } else if (clienteXML.email) {
      clienteBD = (await db.query(
        `SELECT * FROM clientes WHERE email = $1 LIMIT 1`,
        [clienteXML.email]
      )).rows[0];
    }

    if (!clienteBD) {
      const insertCliente = await db.query(
        `INSERT INTO clientes (
          nome, razao_social, cpf_cnpj, email, telefone,
          endereco, numero, bairro, cidade, uf, cep, endereco_entrega
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *`,
        [
          clienteXML.nome,
          clienteXML.razao_social,
          clienteXML.cpf_cnpj || null,
          clienteXML.email || null,
          clienteXML.telefone,
          clienteXML.endereco || null,
          clienteXML.numero || null,
          clienteXML.bairro || null,
          clienteXML.cidade || null,
          clienteXML.uf || null,
          clienteXML.cep || null,
          clienteXML.endereco_entrega || null,
        ]
      );

      clienteBD = insertCliente.rows[0];

    } else {
      // Atualiza apenas os campos que estão vazios no banco
      let updates = [];
      let values = [];
      let i = 1;

      for (const campo in clienteXML) {
        const valorXML = clienteXML[campo];
        if (valorXML && (!clienteBD[campo] || clienteBD[campo] === "")) {
          updates.push(`${campo} = $${i}`);
          values.push(valorXML);
          i++;
        }
      }

      if (updates.length > 0) {
        values.push(clienteBD.id);
        await db.query(
          `UPDATE clientes SET ${updates.join(", ")} WHERE id = $${i}`,
          values
        );
      }
    }

    // ==============================
    // 4) VALIDAR LOJISTA
    // ==============================
    let idLojistaFinal;

    // 🔹 LOJISTA
    if (user.tipo === "lojista") {

      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1`,
        [user.id]
      )).rows[0];

      if (!lojista) throw new Error("Lojista inválido");

      idLojistaFinal = lojista.id;

      // 🔹 REPRESENTANTE
    } else if (user.tipo === "representante") {

      if (!idLojistaBody) throw new Error("É necessário informar o lojista");

      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1 AND id_representante = $2`,
        [idLojistaBody, user.id]
      )).rows[0];

      if (!lojista) throw new Error("Lojista não pertence a este representante ou não existe");

      idLojistaFinal = lojista.id;

      // 🔹 ADMIN
    } else if (user.tipo === "admin") {

      if (!idLojistaBody) throw new Error("É necessário informar o lojista");

      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1`,
        [idLojistaBody]
      )).rows[0];

      if (!lojista) throw new Error("Lojista não encontrado");

      idLojistaFinal = lojista.id;

    } else {
      throw new Error("Tipo de usuário não permitido");
    }

    // ==============================
    // 5) CRIAR PEDIDO
    // ==============================
    const nomeProjeto = escape(getDataById("Environment") || "Projeto");
    const valorTotal = listing.TOTALPRICES?.$.TABLE || "0";

    const idRepresentanteEnviou = user.tipo === "representante" ? user.id : null;
    const idAdminEnviou = user.tipo === "admin" ? user.id : null;

    const pedidoResult = await db.query(
      `INSERT INTO pedidos
        (nome_projeto, valor, data_pedido, id_cliente, xml, id_lojista, enviado_por, id_representante_enviou, id_admin_enviou)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
      [nomeProjeto, valorTotal, clienteBD.id, xmlString, idLojistaFinal, user.tipo, idRepresentanteEnviou, idAdminEnviou]
    );

    const idPedido = pedidoResult.rows[0].id;

    // ==============================
    // 6) ITENS + COMPONENTES
    // ==============================
    const ambientes = listing.AMBIENTS?.AMBIENT;
    const listaAmbientes = Array.isArray(ambientes) ? ambientes : [ambientes];

    const itensProjeto = [];

    listaAmbientes.forEach((amb) => {
      const categorias = amb?.CATEGORIES?.CATEGORY;
      const listaCategorias = Array.isArray(categorias) ? categorias : [categorias];

      listaCategorias.forEach((cat) => {
        const itensWrapper = cat?.ITEMS;
        if (!itensWrapper || !itensWrapper.ITEM) return;

        const itens = Array.isArray(itensWrapper.ITEM)
          ? itensWrapper.ITEM
          : [itensWrapper.ITEM];

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

    for (const item of itensProjeto) {
      const itemRes = await db.query(
        `INSERT INTO itens_pedido (descricao_item, quantidade_item, id_pedido)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [item.descricao, item.quantidade, idPedido]
      );

      const idItem = itemRes.rows[0].id;

      for (const comp of item.componentes) {
        await db.query(
          `INSERT INTO componentes_itens (nome_componente, id_item)
           VALUES ($1, $2)`,
          [comp, idItem]
        );
      }
    }

    return { success: true, idPedido };

  } catch (error) {
    console.error("Erro no importaxml:", error);
    throw error;
  }
}

module.exports = {
  postImportaxml
};