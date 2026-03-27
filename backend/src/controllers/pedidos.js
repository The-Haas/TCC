const { postImportaxml } = require('../services/pedidos.js');

async function postImportarXml(req, res) {


  // Valida tipo MIME
  if (req.file.mimetype !== 'text/xml' && req.file.mimetype !== 'application/xml') {
    return res.status(400).json({
      success: false,
      message: "O arquivo deve ser um XML"
    });
  }

  // Valida extensão
  if (!req.file.originalname.toLowerCase().endsWith('.xml')) {
    return res.status(400).json({
      success: false,
      message: "Arquivo deve ter extensão .xml"
    });
  }

  // Verifica se o arquivo foi enviado
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: "Arquivo XML não enviado ou inválido"
    });
  }

  try {
    // Converte buffer para string (XML)
    const xmlString = req.file.buffer.toString('utf8');

    // Envia direto pro service
    const result = await postImportaxml(xmlString, req.user.id_cliente);

    return res.status(201).json({
      success: true,
      message: "XML processado com sucesso",
      data: result
    });

  } catch (error) {
    console.error("Erro no importarXml:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao processar XML"
    });
  }
}

module.exports = {
  postImportarXml,
};