const clienteController = require('../controllers/clientes');

module.exports = (app) => {
    app.post('/clientes', clienteController.postCliente);
    app.get('/clientes', clienteController.getClientes);
    app.get('/clientes/:id', clienteController.getClienteById);
    app.put('/clientes/:id', clienteController.putCliente);
    app.patch('/clientes/:id', clienteController.patchCliente);
    app.delete('/clientes/:id', clienteController.deleteCliente);
};
