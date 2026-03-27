const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/index.js");

async function login(email, senha) {
  const result = await db.query(
    `SELECT 
        id,
        nome,
        email,
        senha
     FROM clientes
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Email ou Senha Inválido!");
  }

  const cliente = result.rows[0];

  const senhaValida = await bcrypt.compare(senha, cliente.senha);

  if (!senhaValida) {
    throw new Error("Email ou Senha Inválido!");
  }

  const token = jwt.sign(
    {
      id_cliente: cliente.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    msg: "Logado com sucesso!",
    token,
    user: {
      id: cliente.id,
      email: cliente.email,
      nome: cliente.nome
    }
  };
}

module.exports = {
  login,
};