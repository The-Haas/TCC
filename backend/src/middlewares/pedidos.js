const db = require("../config");

// Função privada — usada apenas internamente neste arquivo
function autorizarPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }
    if (!perfisPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({ success: false, message: `Acesso negado para o perfil '${req.user.tipo}'` });
    }
    return next();
  };
}

const apenasAdmin = autorizarPerfis("admin");

/**
 * POST /importaxml
 * Cliente → bloqueado | Demais → passam (service valida lojista internamente)
 */
function autorizarPostPedido(req, res, next) {
  const { tipo } = req.user;

  if (tipo === "cliente") {
    return res.status(403).json({
      success: false,
      message: "Clientes não podem enviar pedidos",
    });
  }

  return next();
}

/**
 * GET /pedidos — injeta req.filtroPedidos
 *
 * null                          → admin, sem restrição
 * { tipo: 'lojista', id }       → WHERE p.id_lojista = id
 * { tipo: 'representante', id } → WHERE l.id_representante = id
 * { tipo: 'cliente', id }       → WHERE p.id_cliente = id
 */
function filtrarListagemPedidos(req, res, next) {
  const { tipo, id } = req.user;

  if (tipo === "admin") {
    req.filtroPedidos = null;
    return next();
  }

  if (["lojista", "representante", "cliente"].includes(tipo)) {
    req.filtroPedidos = { tipo, id };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado: perfil sem permissão para listar pedidos",
  });
}

/**
 * GET /pedidos/:id
 *
 * Admin          → passa sempre
 * Lojista        → só se p.id_lojista = userId
 * Representante  → só se o lojista do pedido pertence a ele
 * Cliente        → só se p.id_cliente = userId
 */
async function verificarAcessoPedidoPorId(req, res, next) {
  const { tipo, id: userId } = req.user;
  const pedidoId = req.params.id;

  if (tipo === "admin") return next();

  try {
    const result = await db.query(
      `SELECT p.id_lojista, p.id_cliente, l.id_representante
         FROM pedidos p
         JOIN lojistas l ON l.id = p.id_lojista
        WHERE p.id = $1`,
      [pedidoId]
    );

    if (result.rows.length === 0) return next(); // controller retorna 404

    const pedido = result.rows[0];

    if (tipo === "lojista") {
      if (String(pedido.id_lojista) !== String(userId)) {
        return res.status(403).json({ success: false, message: "Acesso negado: este pedido não pertence ao seu cadastro" });
      }
      return next();
    }

    if (tipo === "representante") {
      if (String(pedido.id_representante) !== String(userId)) {
        return res.status(403).json({ success: false, message: "Acesso negado: o lojista deste pedido não pertence ao seu cadastro" });
      }
      return next();
    }

    if (tipo === "cliente") {
      if (String(pedido.id_cliente) !== String(userId)) {
        return res.status(403).json({ success: false, message: "Acesso negado: você só pode consultar seus próprios pedidos" });
      }
      return next();
    }

    return res.status(403).json({ success: false, message: "Acesso negado" });

  } catch (err) {
    console.error("Erro ao verificar acesso ao pedido:", err);
    return res.status(500).json({ success: false, message: "Erro interno ao verificar permissão" });
  }
}

module.exports = {
  apenasAdmin,
  autorizarPostPedido,
  filtrarListagemPedidos,
  verificarAcessoPedidoPorId,
};
