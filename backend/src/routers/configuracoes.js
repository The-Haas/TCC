const configController = require('../controllers/configuracoes');
const autenticarToken = require('../middlewares/auth');
const { apenasAdmin } = require('../middlewares/admins');

module.exports = (app) => {
    app.get('/configuracoes', autenticarToken, apenasAdmin, configController.getConfiguracoes);
    app.patch('/configuracoes', autenticarToken, apenasAdmin, configController.patchConfiguracoes);
};