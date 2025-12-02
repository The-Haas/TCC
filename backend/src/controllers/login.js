const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/index.js");

//login com autenticação de usuário
async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const result = await db.query(
      `SELECT 
          u.id,
          u.email,
          u.senha,
          u.admin,
          u.id_cliente,
          c.nome AS nome_cliente
        FROM usuarios u
        LEFT JOIN clientes c ON c.id = u.id_cliente
        WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Email ou Senha Inválido!" });
    }

    const usuario = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ error: "Email ou Senha Inválido!" });
    }

    // Gerar token
    const token = jwt.sign(
      { id_usuario: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      msg: "Logado com sucesso!",
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        admin: usuario.admin,
        id_cliente: usuario.id_cliente,
        nome: usuario.nome_cliente
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
}

module.exports = {
  login,
};
