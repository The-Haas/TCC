// Função privada — usada apenas internamente neste arquivo
function autorizarPerfis(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuário não autenticado"
            });
        }

        if (!perfisPermitidos.includes(req.user.tipo)) {
            return res.status(403).json({
                success: false,
                message: `Acesso negado para o perfil '${req.user.tipo}'`
            });
        }

        return next();
    };
}

// Dashboard Cliente
const apenasCliente = autorizarPerfis("cliente");

// Dashboard Lojista
const apenasLojista = autorizarPerfis("lojista");

// Dashboard Representante
const apenasRepresentante = autorizarPerfis("representante");

// Dashboard Admin
const apenasAdmin = autorizarPerfis("admin");

module.exports = {
    apenasCliente,
    apenasLojista,
    apenasRepresentante,
    apenasAdmin
};