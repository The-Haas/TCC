const controller = require('../controllers/decode.js');
const multer = require('multer');
// Armazenamento em memória (sem salvar temporariamente no disco)
const upload = multer({ storage: multer.memoryStorage() });
// middlewares de autenticação e autorização
const autenticarJWT = require('../middlewares/autenticarJWT');
const { permitirOperador, permitirCliente } = require('../middlewares/autorizar');



// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {

    app.post('/decode', autenticarJWT, permitirCliente, upload.single('xml'), controller.importarXml);
};
