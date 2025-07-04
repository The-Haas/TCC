const controller = require('../controllers/decode.js');
const multer = require('multer');
// Armazenamento em memória (sem salvar temporariamente no disco)
const upload = multer({ storage: multer.memoryStorage() });

const autenticar = require('../middlewares/authMiddleware.js'); // ← novo


// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {

    app.post('/decode', autenticar, upload.single('xml'), controller.importarXml);
};
