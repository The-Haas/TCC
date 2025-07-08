const { loginCliente } = require('../controllers/login.js');

module.exports = (app) => {
    //sem middleware de autenticação e autorização porque não pode
    app.post('/loginCliente', loginCliente);
};
