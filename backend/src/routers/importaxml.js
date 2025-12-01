// importa o controller para usar as funcoes
const controller = require('../controllers/importaxml.js');

// importa o multer para trabalhar com upload de arquivos
const multer = require('multer');

// Armazenamento em memória (sem salvar temporariamente no disco)
const upload = multer({ storage: multer.memoryStorage() });


// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {

    // Quando é acessada 
    app.post('/importaxml', upload.single('xml'), controller.importarXml);
};
