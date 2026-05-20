// Autoriza apenas os perfis informados
function autorizarPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const { tipo } = req.user;

    if (!perfisPermitidos.includes(tipo)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado para o perfil '${tipo}'`,
      });
    }

    return next();
  };
}

// Perfis informados passam direto — os demais só passam se o :id da URL for o próprio ID do token
function autorizarProprioOuPerfis(...perfisLivres) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      });
    }

    const { tipo, id } = req.user;

    if (perfisLivres.includes(tipo)) return next();

    if (String(id) === String(req.params.id)) return next();

    return res.status(403).json({
      success: false,
      message: "Acesso negado: você não tem permissão para acessar este recurso",
    });
  };
}

module.exports = { autorizarPerfis, autorizarProprioOuPerfis };