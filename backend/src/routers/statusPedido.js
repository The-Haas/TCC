const statusController = require('../controllers/statusPedido');

module.exports = (app) => {
    app.post('/status', statusController.postStatus);
    app.get('/status', statusController.getStatus);
    app.get('/status/:id', statusController.getStatusById);
    app.put('/status/:id', statusController.putStatus);
    app.patch('/status/:id', statusController.patchStatus);
    app.delete('/status/:id', statusController.deleteStatus);
};