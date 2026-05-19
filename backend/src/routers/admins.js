const adminController = require('../controllers/admins');

module.exports = (app) => {
    app.post('/admins', adminController.postAdmin);
    app.get('/admins', adminController.getAdmins);
    app.get('/admins/:id', adminController.getAdminById);
    app.put('/admins/:id', adminController.putAdmin);
    app.patch('/admins/:id', adminController.patchAdmin);
    app.delete('/admins/:id', adminController.deleteAdmin);
};