const jwt = require('jsonwebtoken');
const { autenticarCliente } = require('../services/login.js');

const loginCliente = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const cliente = await autenticarCliente({ email, senha });

    const token = jwt.sign(
      {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        perfil: cliente.perfil
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso',
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    return res.status(401).json({ erro: 'Email ou senha inválidos' });
  }
};

module.exports = {
  loginCliente,
};
