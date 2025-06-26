const service = require('../services/decode.js');

async function importarXml(req, res) {
  const { xmlPath } = req.body;

  if (!xmlPath) {
    return res.status(400).json({ success: false, message: "Parâmetro 'xmlPath' é obrigatório" });
  }

  try {
    const result = await decodeXML(xmlPath);
    res.status(200).json({ success: true, message: "Arquivo XML processado com sucesso", data: result });
  } catch (error) {
    console.error("Erro no importarXml:", error);
    res.status(500).json({ success: false, message: "Erro interno ao processar XML", error: error.message });
  }
}


module.exports = {

    /*
    getFilmes,
    getSerie,
    getFilmesFiltros,
    getSeriesFiltros,
    getGeneros,
    getGenerosNome,

    postFilme,
    postSerie,
    postTemporada,
    postEpisodio,
    postGenero,

    putFilme,
    putSerie,
    putEpisodio,
    putGenero,

    deleteFilme,
    deleteSerie,
    deleteTemporada,
    deleteEpisodio,
    deleteGenero,
    */
};