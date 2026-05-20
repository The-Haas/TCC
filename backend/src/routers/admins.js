const adminController = require('../controllers/admins');
const autenticarToken = require('../middlewares/auth');
const { autorizarPerfis } = require('../middlewares/autorizar');

const apenasAdmin = [autenticarToken, autorizarPerfis("admin")];

module.exports = (app) => {
    app.post('/admins', apenasAdmin, adminController.postAdmin);
    app.get('/admins', apenasAdmin, adminController.getAdmins);
    app.get('/admins/:id', apenasAdmin, adminController.getAdminById);
    app.put('/admins/:id', apenasAdmin, adminController.putAdmin);
    app.patch('/admins/:id', apenasAdmin, adminController.patchAdmin);
    app.delete('/admins/:id', apenasAdmin, adminController.deleteAdmin);
};