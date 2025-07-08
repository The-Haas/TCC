const express = require('express');
const router = express.Router();
const { cadastrarCliente } = require('../controllers/cadastroCliente.js');


module.exports = (app) => {

    //sem middleware de autenticação e autorização porque não pode
    app.post('/cadastroCliente', cadastrarCliente);
};
