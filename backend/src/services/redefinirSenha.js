const bcrypt = require('bcrypt');
const db = require('../config'); // seu objeto com db.query()

const redefinirSenha = async (email, cpfcnpj, novaSenha) => {
  // Usar db.query e pegar o resultado de rows
  const result = await db.query(
    'SELECT * FROM clientes WHERE email = $1 AND cpf_cnpj = $2',
    [email, cpfcnpj]
  );

  if (result.rows.length === 0) {
    throw new Error('Email e CPF/CNPJ não coincidem.');
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  await db.query(
    'UPDATE clientes SET senha = $1 WHERE email = $2 AND cpf_cnpj = $3',
    [senhaCriptografada, email, cpfcnpj]
  );

  return { mensagem: 'Senha redefinida com sucesso.' };
};

module.exports = { redefinirSenha };
