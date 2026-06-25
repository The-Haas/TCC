const lojistaController = require('../controllers/lojistas');
const autenticarToken = require('../middlewares/auth');
const { autorizarPostLojista, filtrarListagemLojistas, verificarAcessoLojistaPortId } = require('../middlewares/lojistas');

module.exports = (app) => {
    app.post('/lojistas',      autenticarToken, autorizarPostLojista,           lojistaController.postLojista);
    app.get('/lojistas',       autenticarToken, filtrarListagemLojistas,         lojistaController.getLojistas);
    app.get('/lojistas/:id',   autenticarToken, verificarAcessoLojistaPortId,   lojistaController.getLojistaById);
    app.put('/lojistas/:id',   autenticarToken, verificarAcessoLojistaPortId,   lojistaController.putLojista);
    app.patch('/lojistas/:id', autenticarToken, verificarAcessoLojistaPortId,   lojistaController.patchLojista);
    app.delete('/lojistas/:id',autenticarToken, verificarAcessoLojistaPortId,   lojistaController.deleteLojista);
};
