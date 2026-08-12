const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/index.js");

async function login(email, senha) {

  let user = null;
  let tipo = null;

  // ==============================
  // 1) CLIENTE
  // ==============================
  let result = await db.query(
    `SELECT id, nome, email, senha
     FROM clientes
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length > 0) {
    user = result.rows[0];
    tipo = "cliente";
  }

  // ==============================
  // 2) LOJISTA
  // ==============================
  if (!user) {
    result = await db.query(
      `SELECT id, nome, email, senha
       FROM lojistas
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
      tipo = "lojista";
    }
  }

  // ==============================
  // 3) REPRESENTANTE
  // ==============================
  if (!user) {
    result = await db.query(
      `SELECT id, nome, email, senha
       FROM representantes
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
      tipo = "representante";
    }
  }

  // ==============================
  // 4) ADMIN
  // ==============================
  if (!user) {
    result = await db.query(
      `SELECT id, nome, email, senha
       FROM admins
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length > 0) {
      user = result.rows[0];
      tipo = "admin";
    }
  }

  // ==============================
  // NÃO ENCONTROU
  // ==============================
  if (!user) {
    throw new Error("Email ou Senha Inválido!");
  }

  // ==============================
  // VALIDAR SENHA
  // ==============================
  
  // 1. Verifica se a senha foi enviada na requisição e se o usuário tem senha no banco
  if (!senha || !user.senha) {
    throw new Error("Email ou Senha Inválido!");
  }

  // 2. Só então faz a comparação com o bcrypt
  const senhaValida = await bcrypt.compare(senha, user.senha);

  if (!senhaValida) {
    throw new Error("Email ou Senha Inválido!");
  }

  // ==============================
  // GERAR TOKEN
  // ==============================
  const token = jwt.sign(
    {
      id: user.id,
      tipo: tipo
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // ==============================
  // RETORNO
  // ==============================
  return {
    msg: "Logado com sucesso!",
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: tipo
    }
  };
}

module.exports = {
  login,
};