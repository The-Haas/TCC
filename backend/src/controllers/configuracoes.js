const configService = require('../services/configuracoes.js');

async function getConfiguracoes(req, res) {
    try {
        const configuracoes = await configService.getConfiguracoes();

        return res.status(200).json({
            success: true,
            data: configuracoes
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function patchConfiguracoes(req, res) {

    const dados = req.body;

    try {
        const resultado = await configService.updateConfiguracoes(dados);

        return res.status(200).json({
            success: true,
            message: "Configurações atualizadas com sucesso!",
            data: resultado
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getConfiguracoes,
    patchConfiguracoes
};