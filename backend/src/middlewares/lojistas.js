const db = require("../config");

/**
 * No banco, lojistas.id_representante é FK direta para representantes.
 * "Lojistas do representante" = WHERE id_representante = rep.id
 */

/**
 * POST /lojistas
 *
 * Admin          → passa livre
 * Representante  → passa, e força req.body.id_representante com o ID do token
 *                  (garante que ele não cadastre lojista de outro representante)
 * Demais         → bloqueado
 */
function autorizarPostLojista(req, res, next) {
  const { tipo, id } = req.user;

  if (tipo === "admin") return next();

  if (tipo === "representante") {
    req.body.id_representante = id; // força vínculo com o próprio representante
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado: seu perfil não tem permissão para cadastrar lojistas",
  });
}

/**
 * GET /lojistas — listagem
 *
 * Admin          → vê todos
 * Representante  → vê só os seus (injeta req.filtroRepresentante)
 * Demais         → bloqueado
 */
function filtrarListagemLojistas(req, res, next) {
  const { tipo, id } = req.user;

  if (tipo === "admin") {
    req.filtroRepresentante = null;
    return next();
  }

  if (tipo === "representante") {
    req.filtroRepresentante = id;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado: seu perfil não tem permissão para listar lojistas",
  });
}

/**
 * Rotas com :id  →  GET /:id | PUT /:id | PATCH /:id | DELETE /:id
 *
 * Admin          → passa sempre
 * Cliente        → bloqueado em qualquer método
 * Lojista        → GET/PUT/PATCH apenas do próprio :id | DELETE bloqueado
 * Representante  → qualquer método, mas só se lojistas.id_representante = rep.id
 */
async function verificarAcessoLojistaPortId(req, res, next) {
  const { tipo, id: userId } = req.user;
  const lojistaId = req.params.id;

  // ── Admin: acesso irrestrito ──────────────────────────────────────────────
  if (tipo === "admin") return next();

  // ── Cliente: bloqueado em tudo ────────────────────────────────────────────
  if (tipo === "cliente") {
    return res.status(403).json({
      success: false,
      message: "Clientes não têm acesso à rota de lojistas",
    });
  }

  // ── Lojista: GET/PUT/PATCH somente do próprio registro, sem DELETE ────────
  if (tipo === "lojista") {
    if (req.method === "DELETE") {
      return res.status(403).json({
        success: false,
        message: "Lojistas não podem excluir registros",
      });
    }

    if (String(userId) !== String(lojistaId)) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: você só pode acessar seus próprios dados",
      });
    }

    return next();
  }

  // ── Representante: verifica FK direta id_representante ───────────────────
  if (tipo === "representante") {
    try {
      const result = await db.query(
        `SELECT 1
           FROM lojistas
          WHERE id = $1
            AND id_representante = $2
          LIMIT 1`,
        [lojistaId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Acesso negado: este lojista não pertence ao seu cadastro",
        });
      }

      return next();
    } catch (err) {
      console.error("Erro ao verificar vínculo lojista-representante:", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao verificar permissão",
      });
    }
  }

  return res.status(403).json({ success: false, message: "Acesso negado" });
}

module.exports = {
  autorizarPostLojista,
  filtrarListagemLojistas,
  verificarAcessoLojistaPortId,
};
