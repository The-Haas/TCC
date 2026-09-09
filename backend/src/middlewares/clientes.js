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
const apenasAdminOuLojista = autorizarPerfis("admin", "lojista");

/**
 * GET /clientes — listagem
 *
 * Admin    → vê todos (req.filtroLojista = null)
 * Lojista  → vê só os seus via pedidos (req.filtroLojista = id)
 * Demais   → bloqueado
 */
function filtrarListagemClientes(req, res, next) {
  const { tipo, id } = req.user;

  if (tipo === "admin") {
    req.filtroLojista = null;
    return next();
  }

  if (tipo === "lojista") {
    req.filtroLojista = id;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado: seu perfil não tem permissão para listar clientes",
  });
}

/**
 * Rotas com :id  →  GET /:id | PUT /:id | PATCH /:id | DELETE /:id
 *
 * Admin          → passa sempre
 * Representante  → bloqueado
 * Cliente        → somente GET do próprio :id
 * Lojista        → passa sempre (permitido editar cliente sem pedido vinculado)
 */
async function verificarAcessoClientePorId(req, res, next) {
  const { tipo, id: userId } = req.user;
  const clienteId = req.params.id;

  if (tipo === "admin") return next();

  if (tipo === "representante") {
    return res.status(403).json({
      success: false,
      message: "Representantes não têm acesso à rota de clientes",
    });
  }

  if (tipo === "cliente") {
    // Permite consultar (GET) e editar (PUT, PATCH). Bloqueia DELETE ou outros métodos acidentais.
    if (!["GET", "PUT", "PATCH"].includes(req.method)) {
      return res.status(403).json({
        success: false,
        message: "Clientes só podem consultar e editar seus próprios dados",
      });
    }

    // A trava principal: o ID da rota tem que ser o mesmo do token do cliente logado
    if (String(userId) !== String(clienteId)) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: você só pode acessar e editar seus próprios dados",
      });
    }
    return next();
  }

  if (tipo === "lojista") {
    const acesso = await db.query(
      `
    SELECT 1
    FROM pedidos
    WHERE id_cliente = $1
      AND id_lojista = $2
    LIMIT 1
    `,
      [clienteId, userId]
    );

    if (acesso.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "Acesso negado: este cliente não possui projetos vinculados à sua loja",
      });
    }

    return next();
  }

  return res.status(403).json({ success: false, message: "Acesso negado" });
}

module.exports = {
  apenasAdmin,
  apenasAdminOuLojista,
  filtrarListagemClientes,
  verificarAcessoClientePorId,
};