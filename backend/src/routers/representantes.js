const representanteController = require('../controllers/representantes');
const autenticarToken = require('../middlewares/auth');
const { apenasAdmin, verificarAcessoRepresentantePorId } = require('../middlewares/representantes');

module.exports = (app) => {
    app.post('/representantes',      autenticarToken, apenasAdmin,                       representanteController.postRepresentante);
    app.get('/representantes',       autenticarToken, apenasAdmin,                       representanteController.getRepresentantes);
    app.get('/representantes/:id',   autenticarToken, verificarAcessoRepresentantePorId, representanteController.getRepresentanteById);
    app.put('/representantes/:id',   autenticarToken, verificarAcessoRepresentantePorId, representanteController.putRepresentante);
    app.patch('/representantes/:id', autenticarToken, verificarAcessoRepresentantePorId, representanteController.patchRepresentante);
    app.delete('/representantes/:id',autenticarToken, apenasAdmin,                       representanteController.deleteRepresentante);
};
