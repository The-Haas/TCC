// Pega as variáveis do .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const app = express();

const PORT = 3000;

// Configura sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'meusegredo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000 // 1 hora
    }
}));

// Permitir JSON no corpo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Permitir requisições do seu front
app.use(cors({
  origin: 'http://127.0.0.1:5500',                       // endereço do Live Server
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],    // métodos que quer liberar
  credentials: true                                      // se usar cookies/sessões (opcional)
}));

require('./routers')(app);

// Servir arquivos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));



app.listen(PORT, () => {
    console.log('API Rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:' + PORT);
});