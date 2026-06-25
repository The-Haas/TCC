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
 * Rotas com :id  →  GET /:id | PUT /:id | PATCH /:id
 *
 * Admin           → passa sempre
 * Representante   → apenas o próprio :id (sem DELETE)
 * Cliente/Lojista → bloqueados
 */
function verificarAcessoRepresentantePorId(req, res, next) {
  const { tipo, id: userId } = req.user;

  if (tipo === "admin") return next();

  if (tipo === "cliente" || tipo === "lojista") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado: seu perfil não tem acesso à rota de representantes",
    });
  }

  if (tipo === "representante") {
    if (req.method === "DELETE") {
      return res.status(403).json({
        success: false,
        message: "Representantes não podem excluir registros",
      });
    }
    if (String(userId) !== String(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado: você só pode acessar seus próprios dados",
      });
    }
    return next();
  }

  return res.status(403).json({ success: false, message: "Acesso negado" });
}

module.exports = { apenasAdmin, verificarAcessoRepresentantePorId };
