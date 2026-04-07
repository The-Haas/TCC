const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token não fornecido"
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({
      success: false,
      message: "Token mal formatado"
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      success: false,
      message: "Token mal formatado"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aqui já vem: { id, tipo }
    req.user = decoded;

    return next();

  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Token inválido ou expirado"
    });
  }
}

module.exports = autenticarToken;