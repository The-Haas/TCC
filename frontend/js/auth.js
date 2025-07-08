document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/validarToken", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Token inválido");

    const data = await response.json();

    // Exibe o nome do usuário no painel
    const nomeSpan = document.getElementById("usuarioNome");
    if (nomeSpan) nomeSpan.textContent = `Bem-vindo, ${data.usuario.nome}`;

    // ✅ Agora exibe o conteúdo
    document.body.style.display = "block";
  } catch (err) {
    console.warn("Token inválido ou expirado:", err.message);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
});
