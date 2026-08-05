// importa o controller para usar as funcoes
const controller = require('../controllers/pedidos.js');

// importa o multer para trabalhar com upload de arquivos
const multer = require('multer');

// Armazenamento em memória (sem salvar temporariamente no disco)
const upload = multer({ storage: multer.memoryStorage() });

// importa o middleware de autenticação
const autenticarToken = require('../middlewares/auth.js');

const { apenasAdmin, autorizarPostPedido, filtrarListagemPedidos, verificarAcessoPedidoPorId } = require('../middlewares/pedidos.js');

// rotas para acessar pela url para realizar as funcoes
module.exports = (app) => {
    app.post('/importaxml',    autenticarToken, autorizarPostPedido,       upload.array('xml'), controller.postImportarXml);
    app.get('/pedidos',        autenticarToken, filtrarListagemPedidos,     controller.getListaPedidos);
    app.get('/pedidos/:id',    autenticarToken, verificarAcessoPedidoPorId, controller.getPedidoPorId);
    app.put('/pedidos/:id',    autenticarToken, apenasAdmin,                controller.putPedidoController);
    app.patch('/pedidos/:id',  autenticarToken, apenasAdmin,                controller.patchPedidoController);
    app.delete('/pedidos/:id', autenticarToken, verificarAcessoPedidoPorId, controller.deletePedidoController);
};
