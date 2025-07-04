const { loginCliente } = require('../controllers/login.js');

module.exports = (app) => {
    app.post('/loginCliente', loginCliente);
};
