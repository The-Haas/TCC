const { postImportaxml } = require('../services/pedidos.js');

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

            const result = await postImportaxml(
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

module.exports = {
    postImportarXml,
};