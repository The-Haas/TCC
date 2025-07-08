document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/validarToken/operador", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Token inválido");

    const data = await response.json();

    const nomeSpan = document.getElementById("usuarioNome");
    if (nomeSpan) nomeSpan.textContent = `Bem-vindo, ${data.usuario.nome}`;

    document.body.style.display = "block";
  } catch (err) {
    console.warn("Token inválido ou expirado:", err.message);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
});
