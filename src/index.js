// Pega as variáveis do .env
require('dotenv').config();

const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

require('./routers')(app);

app.listen(PORT, () => {
    console.log('API Rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:' + PORT);
});