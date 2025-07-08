const { redefinirSenha } = require('../services/redefinirSenha');

const redefinirSenhaController = async (req, res) => {
  const { email, cpfcnpj, novaSenha } = req.body;

  try {
    if (!email || !cpfcnpj || !novaSenha) {
      return res.status(400).json({ erro: 'Email, CPF/CNPJ e nova senha são obrigatórios.' });
    }

    const resultado = await redefinirSenha(email, cpfcnpj, novaSenha);
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ erro: error.message });
  }
};

module.exports = { redefinirSenhaController };
