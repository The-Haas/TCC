const adminController = require('../controllers/admins');
const autenticarToken = require('../middlewares/auth');
const { apenasAdmin } = require('../middlewares/admins');

module.exports = (app) => {
    app.post('/admins',      autenticarToken, apenasAdmin, adminController.postAdmin);
    app.get('/admins',       autenticarToken, apenasAdmin, adminController.getAdmins);
    app.get('/admins/:id',   autenticarToken, apenasAdmin, adminController.getAdminById);
    app.put('/admins/:id',   autenticarToken, apenasAdmin, adminController.putAdmin);
    app.patch('/admins/:id', autenticarToken, apenasAdmin, adminController.patchAdmin);
    app.delete('/admins/:id',autenticarToken, apenasAdmin, adminController.deleteAdmin);
};
