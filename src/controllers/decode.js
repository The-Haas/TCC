const fs = require('fs');
const path = require('path');
const { decodeXML, criarArquivoTemporario, excluirArquivoTemporario } = require('../services/decode.js');

async function importarXml(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: "Arquivo XML não enviado no campo 'xml'" });
  }

  // Declare fora do try para ser visível no finally
  let caminhoTemp;
  let nomeArquivoTemp;

  try {

    // Chama a função do service que cria o arquivo temporário
    ({ caminhoTemp, nomeArquivoTemp } = await criarArquivoTemporario(req.file.buffer));

    // Processa o XML passando o caminho do arquivo temporário
    const result = await decodeXML(caminhoTemp);

    // Mensagem de sucesso
    res.status(200).json({ success: true, message: "Arquivo XML processado com sucesso", data: result });

  } catch (error) {

    // Log do erro no terminal
    console.error("Erro no importarXml:", error);

    // Resposta de erro para o cliente
    res.status(500).json({ success: false, message: "Erro interno ao processar XML", error: error.message });

  } finally {

    // Chama a função do service para excluir o arquivo temporário independente do sucesso ou falha
    if (caminhoTemp && nomeArquivoTemp) {
      await excluirArquivoTemporario(caminhoTemp, nomeArquivoTemp);
    }
    
  }
}

module.exports = {
  importarXml,
};
