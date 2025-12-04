// importa o controller para usar as funcoes
const controller = require('../controllers/pedidos.js');

// importa o multer para trabalhar com upload de arquivos
const multer = require('multer');

// Armazenamento em memória (sem salvar temporariamente no disco)
const upload = multer({ storage: multer.memoryStorage() });

// importa o middleware de autenticação
const autenticarToken = require('../middlewares/auth.js');

// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {

    // Quando é acessada 
    app.post('/importaxml', autenticarToken, upload.single('xml'), controller.postImportarXml);
};
