const validarToken = (usuario) => {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil
  };
};

module.exports = {
  validarToken
};