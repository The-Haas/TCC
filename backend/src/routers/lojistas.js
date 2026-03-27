const lojistaController = require('../controllers/lojistas');

module.exports = (app) => {
    app.post('/lojistas', lojistaController.postLojista);
    app.get('/lojistas', lojistaController.getLojistas);
    app.get('/lojistas/:id', lojistaController.getLojistaById);
    app.put('/lojistas/:id', lojistaController.putLojista);
    app.patch('/lojistas/:id', lojistaController.patchLojista);
    app.delete('/lojistas/:id', lojistaController.deleteLojista);
};