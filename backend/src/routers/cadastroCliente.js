const express = require('express');
const router = express.Router();
const { cadastrarCliente } = require('../controllers/cadastroCliente.js');


module.exports = (app) => {

    app.post('/cadastroCliente', cadastrarCliente);
    app.get('/cadastroCliente', (req, res) => {
});
};
