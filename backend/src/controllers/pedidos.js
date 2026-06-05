const service = require('../services/pedidos.js');

async function postImportarXml(req, res) {

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Nenhum arquivo XML enviado"
        });
    }

    // Valida todos os arquivos antes de processar qualquer um
    for (const file of req.files) {
        if (file.mimetype !== 'text/xml' && file.mimetype !== 'application/xml') {
            return res.status(400).json({
                success: false,
                message: `O arquivo "${file.originalname}" não é um XML válido`
            });
        }

        if (!file.originalname.toLowerCase().endsWith('.xml')) {
            return res.status(400).json({
                success: false,
                message: `O arquivo "${file.originalname}" deve ter extensão .xml`
            });
        }
    }

    // Processa cada arquivo individualmente
    const resultados = [];

    for (const file of req.files) {
        try {
            const xmlString = file.buffer.toString('utf8');

            const result = await service.postImportaxml(
                xmlString,
                req.user,
                req.body.id_lojista
            );

            resultados.push({
                arquivo: file.originalname,
                success: true,
                data: result
            });

        } catch (error) {
            resultados.push({
                arquivo: file.originalname,
                success: false,
                message: error.message
            });
        }
    }

    const todosFalharam = resultados.every(r => !r.success);

    return res.status(todosFalharam ? 400 : 201).json({
        success: !todosFalharam,
        total: req.files.length,
        processados: resultados.filter(r => r.success).length,
        falhas: resultados.filter(r => !r.success).length,
        resultados
    });
}

// ==============================
// GET — listar todos
// ==============================
async function getListaPedidos(req, res) {
  try {
    const pedidos = await service.getPedidos();
    return res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ==============================
// GET — por ID
// ==============================
async function getPedidoPorId(req, res) {
  try {
    const pedido = await service.getPedidoById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    return res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ==============================
// PUT — atualizar completo
// ==============================
async function putPedidoController(req, res) {
  try {
    const pedido = await service.putPedido(req.params.id, req.body);

    if (!pedido) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    return res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ==============================
// PATCH — atualizar parcial
// ==============================
async function patchPedidoController(req, res) {
  try {
    const pedido = await service.patchPedido(req.params.id, req.body);

    if (!pedido) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    return res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ==============================
// DELETE
// ==============================
async function deletePedidoController(req, res) {
  try {
    const pedido = await service.deletePedido(req.params.id);

    if (!pedido) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    return res.status(200).json({ success: true, message: "Pedido removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  postImportarXml,
  getListaPedidos,
  getPedidoPorId,
  putPedidoController,
  patchPedidoController,
  deletePedidoController,
};