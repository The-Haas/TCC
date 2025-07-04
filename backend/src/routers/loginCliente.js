const { loginCliente } = require('../controllers/loginCliente.js');

module.exports = (app) => {
    app.post('/loginCliente', loginCliente);
};
