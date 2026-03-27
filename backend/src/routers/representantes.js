const representanteController = require('../controllers/representantes');

module.exports = (app) => {
    app.post('/representantes', representanteController.postRepresentante);
    app.get('/representantes', representanteController.getRepresentantes);
    app.get('/representantes/:id', representanteController.getRepresentanteById);
    app.put('/representantes/:id', representanteController.putRepresentante);
    app.patch('/representantes/:id', representanteController.patchRepresentante);
    app.delete('/representantes/:id', representanteController.deleteRepresentante);
};