const { postImportaxml } = require('../services/pedidos.js');

async function postImportarXml(req, res) {

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Arquivo XML não enviado"
    });
  }

  // MIME
  if (req.file.mimetype !== 'text/xml' && req.file.mimetype !== 'application/xml') {
    return res.status(400).json({
      success: false,
      message: "O arquivo deve ser um XML"
    });
  }

  // extensão
  if (!req.file.originalname.toLowerCase().endsWith('.xml')) {
    return res.status(400).json({
      success: false,
      message: "Arquivo deve ter extensão .xml"
    });
  }

  try {
    const xmlString = req.file.buffer.toString('utf8');

    const result = await postImportaxml(
      xmlString,
      req.user,
      req.body.id_lojista // 👈 importante
    );

    return res.status(201).json({
      success: true,
      message: "XML processado com sucesso",
      data: result
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  postImportarXml,
};