const fs = require('fs');
const path = require('path');
const { decodeXML } = require('../services/decode.js');

async function importarXml(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: "Arquivo XML não enviado no campo 'xml'" });
  }

  try {
    // Cria um arquivo temporário com o buffer recebido
    const nomeArquivoTemp = `xml_${Date.now()}.xml`;
    const caminhoTemp = path.resolve(__dirname, '..', 'temp', nomeArquivoTemp);

    fs.mkdirSync(path.dirname(caminhoTemp), { recursive: true });
    await fs.promises.writeFile(caminhoTemp, req.file.buffer);

    // Chama o decode passando o caminho do XML
    const result = await decodeXML(caminhoTemp);

    res.status(200).json({ success: true, message: "Arquivo XML processado com sucesso", data: result });
  } catch (error) {
    console.error("Erro no importarXml:", error);
    res.status(500).json({ success: false, message: "Erro interno ao processar XML", error: error.message });
  }
}

module.exports = {
  importarXml,
};
