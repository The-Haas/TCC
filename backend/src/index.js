// Pega as variáveis do .env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');

const app = express();

const PORT = 3000;

app.use(express.json());

require('./routers')(app);

app.listen(PORT, () => {
    console.log('API Rodando na porta ' + PORT);
    console.log('Acesse: http://localhost:' + PORT);
});