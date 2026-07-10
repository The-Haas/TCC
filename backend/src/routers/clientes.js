const clienteController = require('../controllers/clientes');
const autenticarToken = require('../middlewares/auth');
const { apenasAdmin, apenasAdminOuLojista, filtrarListagemClientes, verificarAcessoClientePorId } = require('../middlewares/clientes');

module.exports = (app) => {
    app.post('/clientes',      autenticarToken, apenasAdmin,            clienteController.postCliente);
    app.get('/clientes',       autenticarToken, filtrarListagemClientes, clienteController.getClientes);
    app.get('/clientes/:id',   autenticarToken, verificarAcessoClientePorId,                             clienteController.getClienteById);
    app.put('/clientes/:id',   autenticarToken, verificarAcessoClientePorId,     clienteController.putCliente);
    app.patch('/clientes/:id', autenticarToken, verificarAcessoClientePorId,     clienteController.patchCliente);
    app.delete('/clientes/:id',autenticarToken, apenasAdminOuLojista,   verificarAcessoClientePorId,     clienteController.deleteCliente);
};
