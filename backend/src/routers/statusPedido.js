const statusController = require('../controllers/statusPedido');
const autenticarToken = require('../middlewares/auth');
const { apenasAdmin, liberarLeituraStatus } = require('../middlewares/statusPedido');

module.exports = (app) => {
    app.post('/status',      autenticarToken, apenasAdmin, statusController.postStatus);
    // AJUSTADO AQUI: De listarStatus para getStatus
    app.get('/status',       autenticarToken, liberarLeituraStatus, statusController.getStatus);
    app.get('/status/:id',   autenticarToken, apenasAdmin, statusController.getStatusById);
    app.put('/status/:id',   autenticarToken, apenasAdmin, statusController.putStatus);
    app.patch('/status/:id', autenticarToken, apenasAdmin, statusController.patchStatus);
    app.delete('/status/:id',autenticarToken, apenasAdmin, statusController.deleteStatus);
};