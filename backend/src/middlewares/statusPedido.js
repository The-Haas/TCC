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

// Suas regras antigas continuam aqui:
const apenasAdmin = autorizarPerfis("admin");
const apenasCliente = autorizarPerfis("cliente");

// NOVA REGRA: Permite admin, cliente, lojista e representante
const liberarLeituraStatus = autorizarPerfis("admin", "cliente", "lojista", "representante");

module.exports = { 
  apenasAdmin, 
  apenasCliente, 
  liberarLeituraStatus // Não esqueça de exportar a nova regra!
};