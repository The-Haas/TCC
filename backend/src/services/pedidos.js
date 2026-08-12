const db = require('../config');
const xml2js = require('xml2js');
const { dispararNotificacaoPedido } = require('./emailNotificacoes'); // Ajuste o caminho se necessário

const parser = new xml2js.Parser({ explicitArray: false });

function escape(str) {
  return String(str || "").replace(/'/g, "''");
}

// ==============================
// POST — importar XML
// (sem alterações — a validação de perfil já está no service)
// ==============================
async function postImportaxml(xmlString, user, idLojistaBody) {
  try {
    const result = await parser.parseStringPromise(xmlString);

    if (!result?.LISTING?.CUSTOMERSDATA?.DATA) {
      throw new Error("XML inválido: estrutura obrigatória não encontrada");
    }

    const listing = result.LISTING;
    const dados = listing.CUSTOMERSDATA.DATA;

    const getDataById = (id) =>
      dados.find(d => d.$.ID === id)?.$.VALUE || "";

    if (!getDataById("nomecliente") || !getDataById("celular")) {
      throw new Error("XML inválido: campos 'nomecliente' e 'celular' são obrigatórios");
    }

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

// =================================================================
    // NOVO BLOCO: VALIDAÇÃO DE CONFLITO DE E-MAIL (MODIFICADO)
    // =================================================================
    if (clienteXML.email) {
      const emailConflict = await db.query(
        `SELECT email FROM admins WHERE email = $1
         UNION
         SELECT email FROM representantes WHERE email = $1
         UNION
         SELECT email FROM lojistas WHERE email = $1`,
        [clienteXML.email]
      );

      // Se encontrar o e-mail em outra tabela do sistema, anulamos no XML
      // Isso permite que o cliente e o projeto sejam salvos normalmente, mas sem causar conflito de login.
      if (emailConflict.rows.length > 0) {
        clienteXML.email = null;
      }
    }

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
          clienteXML.nome, clienteXML.razao_social,
          clienteXML.cpf_cnpj || null, clienteXML.email || null,
          clienteXML.telefone, clienteXML.endereco || null,
          clienteXML.numero || null, clienteXML.bairro || null,
          clienteXML.cidade || null, clienteXML.uf || null,
          clienteXML.cep || null, clienteXML.endereco_entrega || null,
        ]
      );
      clienteBD = insertCliente.rows[0];
    } else {
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

    let idLojistaFinal;

    if (user.tipo === "lojista") {
      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1`, [user.id]
      )).rows[0];
      if (!lojista) throw new Error("Lojista inválido");
      idLojistaFinal = lojista.id;

    } else if (user.tipo === "representante") {
      if (!idLojistaBody) throw new Error("É necessário informar o lojista");
      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1 AND id_representante = $2`,
        [idLojistaBody, user.id]
      )).rows[0];
      if (!lojista) throw new Error("Lojista não pertence a este representante ou não existe");
      idLojistaFinal = lojista.id;

    } else if (user.tipo === "admin") {
      if (!idLojistaBody) throw new Error("É necessário informar o lojista");
      const lojista = (await db.query(
        `SELECT * FROM lojistas WHERE id = $1`, [idLojistaBody]
      )).rows[0];
      if (!lojista) throw new Error("Lojista não encontrado");
      idLojistaFinal = lojista.id;

    } else {
      throw new Error("Tipo de usuário não permitido");
    }

    const nomeProjeto = escape(getDataById("Environment") || "Projeto");
    const valorTotal = listing.TOTALPRICES?.$.TABLE || "0";

    const idRepresentanteEnviou = user.tipo === "representante" ? user.id : null;
    const idAdminEnviou = user.tipo === "admin" ? user.id : null;

    const statusPadrao = (await db.query(
      `SELECT id, ordem, descricao, cor FROM status_pedido WHERE padrao = true LIMIT 1`
    )).rows[0];

    if (!statusPadrao) {
      throw new Error("Nenhum status padrão definido. Cadastre um status padrão antes de importar pedidos.");
    }

    const pedidoResult = await db.query(
      `INSERT INTO pedidos
        (nome_projeto, valor, data_pedido, id_cliente, xml, id_lojista, enviado_por, id_representante_enviou, id_admin_enviou, id_status)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [nomeProjeto, valorTotal, clienteBD.id, xmlString, idLojistaFinal, user.tipo, idRepresentanteEnviou, idAdminEnviou, statusPadrao.id]
    );

    const idPedido = pedidoResult.rows[0].id;

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
          `INSERT INTO componentes_itens (nome_componente, id_item) VALUES ($1, $2)`,
          [comp, idItem]
        );
      }
    }

    // Dispara em segundo plano (SEM AWAIT) para responder rápido ao cliente
    dispararNotificacaoPedido({
      idPedido,
      usuarioAutor: user,
      evento: 'CRIACAO',
      dadosExtras: { nome_projeto: nomeProjeto, status_nome: statusPadrao.descricao }
    });

    return {
      success: true,
      idPedido,
      id_status: statusPadrao.id,
      ordem_status: statusPadrao.ordem,
      status: statusPadrao.descricao,
      cor: statusPadrao.cor
    };

    return {
      success: true,
      idPedido,
      id_status: statusPadrao.id,
      ordem_status: statusPadrao.ordem,
      status: statusPadrao.descricao,
      cor: statusPadrao.cor
    };

  } catch (error) {
    console.error("Erro no importaxml:", error);
    throw error;
  }
}

// ==============================
// GET — listar pedidos com filtro por perfil
//
// filtroPedidos = null                          → admin, sem restrição
// filtroPedidos = { tipo: 'lojista', id }       → WHERE p.id_lojista = id
// filtroPedidos = { tipo: 'representante', id } → WHERE l.id_representante = id
// filtroPedidos = { tipo: 'cliente', id }       → WHERE p.id_cliente = id
// ==============================
async function getPedidos(filtroPedidos = null) {
  let whereClause = "";
  const params = [];

  if (filtroPedidos) {
    const { tipo, id } = filtroPedidos;

    if (tipo === "lojista") {
      whereClause = "WHERE p.id_lojista = $1";
      params.push(id);
    } else if (tipo === "representante") {
      whereClause = "WHERE l.id_representante = $1";
      params.push(id);
    } else if (tipo === "cliente") {
      whereClause = "WHERE p.id_cliente = $1";
      params.push(id);
    }
  }

  const { rows } = await db.query(
    `SELECT
       p.id,
       p.nome_projeto,
       p.valor,
       p.data_pedido,
       p.data_previsao_pedido,
       p.enviado_por,
       p.id_cliente,
       c.nome    AS cliente,
       p.id_lojista,
       l.nome    AS lojista,
       r.id      AS id_representante,
       r.nome    AS representante,
       p.id_status,
       sp.descricao AS status,
       sp.ordem AS ordem_status,
       sp.cor
     FROM pedidos p
     LEFT JOIN clientes       c  ON c.id  = p.id_cliente
     LEFT JOIN lojistas       l  ON l.id  = p.id_lojista
     LEFT JOIN representantes r  ON r.id  = l.id_representante
     LEFT JOIN status_pedido  sp ON sp.id = p.id_status
     ${whereClause}
     ORDER BY p.data_pedido DESC`,
    params
  );

  return rows;
}

// ==============================
// GET — pedido por ID (com itens e componentes)
// (sem alterações — o middleware já validou o acesso)
// ==============================
async function getPedidoById(id) {
  const pedido = (await db.query(
    `SELECT
       p.*,
       c.nome    AS cliente,
       l.nome    AS lojista,
       r.nome    AS representante,
       sp.descricao AS status,
       sp.ordem AS ordem_status,
       sp.cor
     FROM pedidos p
     LEFT JOIN clientes       c  ON c.id  = p.id_cliente
     LEFT JOIN lojistas       l  ON l.id  = p.id_lojista
     LEFT JOIN representantes r  ON r.id  = l.id_representante
     LEFT JOIN status_pedido  sp ON sp.id = p.id_status
     WHERE p.id = $1`,
    [id]
  )).rows[0];

  if (!pedido) return null;

  const itens = (await db.query(
    `SELECT
       i.id,
       i.descricao_item,
       i.quantidade_item,
       COALESCE(
         json_agg(ci.nome_componente) FILTER (WHERE ci.id IS NOT NULL),
         '[]'
       ) AS componentes
     FROM itens_pedido i
     LEFT JOIN componentes_itens ci ON ci.id_item = i.id
     WHERE i.id_pedido = $1
     GROUP BY i.id`,
    [id]
  )).rows;

  return { ...pedido, itens };
}

// ==============================
// PUT — atualizar pedido completo (admin only)
// ==============================
async function putPedido(id, dados, user) {
  const { nome_projeto, valor, id_cliente, id_lojista, id_status, data_previsao_pedido } = dados;

  const lojista = (await db.query(`SELECT id FROM lojistas WHERE id = $1`, [id_lojista])).rows[0];
  if (!lojista) throw new Error("Lojista não encontrado");

  const cliente = (await db.query(`SELECT id FROM clientes WHERE id = $1`, [id_cliente])).rows[0];
  if (!cliente) throw new Error("Cliente não encontrado");

  // 👇 Buscamos também ordem e descrição para identificar o evento de e-mail
  const status = (await db.query(`SELECT id, ordem, descricao FROM status_pedido WHERE id = $1`, [id_status])).rows[0];
  if (!status) throw new Error("Status não encontrado");

  const { rows } = await db.query(
    `UPDATE pedidos
     SET nome_projeto         = $1,
         valor                = $2,
         id_cliente           = $3,
         id_lojista           = $4,
         id_status            = $5,
         data_previsao_pedido = $6
     WHERE id = $7
     RETURNING *`,
    [nome_projeto, valor, id_cliente, id_lojista, id_status, data_previsao_pedido || null, id]
  );

  const pedidoAtualizado = rows[0] || null;

  // 👇 DISPARO DE E-MAIL EM SEGUNDO PLANO (SEM AWAIT)
  if (pedidoAtualizado) {
    let evento = 'STATUS_ALTERADO';

    if (status.ordem === 0) {
      evento = 'RECUSADO';
    } else if (status.ordem === 99 || status.descricao.toLowerCase().includes('conclu')) {
      evento = 'CONCLUIDO';
    }

    dispararNotificacaoPedido({
      idPedido: id,
      usuarioAutor: user,
      evento,
      dadosExtras: {
        nome_projeto: pedidoAtualizado.nome_projeto,
        status_nome: status.descricao
      }
    });
  }

  return pedidoAtualizado;
}

// ==============================
// PATCH — atualizar pedido parcial (admin only)
// ==============================
async function patchPedido(id, dados, user) {
  const camposPermitidos = ["nome_projeto", "valor", "id_cliente", "id_lojista", "id_status", "data_previsao_pedido"];

  if (dados.id_lojista !== undefined) {
    const lojista = (await db.query(`SELECT id FROM lojistas WHERE id = $1`, [dados.id_lojista])).rows[0];
    if (!lojista) throw new Error("Lojista não encontrado");
  }

  if (dados.id_cliente !== undefined) {
    const cliente = (await db.query(`SELECT id FROM clientes WHERE id = $1`, [dados.id_cliente])).rows[0];
    if (!cliente) throw new Error("Cliente não encontrado");
  }

  // 👇 Buscamos dados do status para determinar o modelo do e-mail
  let statusInfo = null;
  if (dados.id_status !== undefined) {
    statusInfo = (await db.query(`SELECT id, ordem, descricao FROM status_pedido WHERE id = $1`, [dados.id_status])).rows[0];
    if (!statusInfo) throw new Error("Status não encontrado");
  }

  const updates = [];
  const values = [];
  let i = 1;

  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      updates.push(`${campo} = $${i}`);
      values.push(dados[campo]);
      i++;
    }
  }

  if (updates.length === 0) throw new Error("Nenhum campo válido para atualizar");

  values.push(id);

  const { rows } = await db.query(
    `UPDATE pedidos SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );

  const pedidoAtualizado = rows[0] || null;

  // 👇 DISPARO DE E-MAIL EM SEGUNDO PLANO (Apenas se o status tiver sido alterado)
  if (pedidoAtualizado && statusInfo) {
    let evento = 'STATUS_ALTERADO';

    if (statusInfo.ordem === 0) {
      evento = 'RECUSADO';
    } else if (statusInfo.ordem === 99 || statusInfo.descricao.toLowerCase().includes('conclu')) {
      evento = 'CONCLUIDO';
    }

    dispararNotificacaoPedido({
      idPedido: id,
      usuarioAutor: user,
      evento,
      dadosExtras: {
        nome_projeto: pedidoAtualizado.nome_projeto,
        status_nome: statusInfo.descricao
      }
    });
  }

  return pedidoAtualizado;
}

// ==============================
// DELETE — remover pedido
// ==============================
async function deletePedido(id, user) {
  // 1. Busca as informações do pedido e a ordem do status atual
  const pedidoInfo = (await db.query(`
    SELECT p.id_lojista, sp.ordem 
    FROM pedidos p 
    LEFT JOIN status_pedido sp ON sp.id = p.id_status 
    WHERE p.id = $1`,
    [id]
  )).rows[0];

  if (!pedidoInfo) throw new Error("Pedido não encontrado");

  // 2. Validação de regras de negócio por tipo de usuário
  if (user.tipo === 'lojista') {
    // Se a ordem for maior que 1, significa que o pedido já avançou
    if (pedidoInfo.ordem !== null && pedidoInfo.ordem > 1) {
      throw new Error("Ação não permitida. Lojistas só podem excluir projetos que estejam pendentes ou recusados.");
    }
  } else if (user.tipo !== 'admin') {
    // Representantes e clientes não podem excluir pedidos
    throw new Error("Acesso negado para exclusão de projetos.");
  }

  // 3. Exclusão em cascata (mantido como no seu código original)
  const itens = (await db.query(`SELECT id FROM itens_pedido WHERE id_pedido = $1`, [id])).rows;

  for (const item of itens) {
    await db.query(`DELETE FROM componentes_itens WHERE id_item = $1`, [item.id]);
  }

  await db.query(`DELETE FROM itens_pedido WHERE id_pedido = $1`, [id]);

  const { rows } = await db.query(
    `DELETE FROM pedidos WHERE id = $1 RETURNING id`, [id]
  );

  return rows[0] || null;
}

module.exports = {
  postImportaxml,
  getPedidos,
  getPedidoById,
  putPedido,
  patchPedido,
  deletePedido,
};