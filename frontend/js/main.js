
// Script para alternar entre telas de login e cadastro
document.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("register");
  const loginButton = document.getElementById("login");
  const toRegisterLink = document.getElementById("toRegister");
  const toLoginLink = document.getElementById("toLogin"); // novo link
  const container = document.getElementById("container");

  function isMobile() {
    return window.innerWidth <= 768;
  }

  if (isMobile()) {
    container.classList.add("show-login");
  }

  if (registerButton) {
    registerButton.addEventListener("click", () => {
      if (isMobile()) {
        container.classList.add("show-register");
        container.classList.remove("show-login");
      } else {
        container.classList.add("right-panel-active");
      }
    });
  }

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      if (isMobile()) {
        container.classList.add("show-login");
        container.classList.remove("show-register");
      } else {
        container.classList.remove("right-panel-active");
      }
    });
  }

  if (toRegisterLink) {
    toRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("show-register");
      container.classList.remove("show-login");
    });
  }

  if (toLoginLink) {
    toLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("show-login");
      container.classList.remove("show-register");
    });
  }
});

//script para alternar a visibilidade da senha
document.querySelectorAll('.toggle-password').forEach((toggleIcon) => {
  toggleIcon.addEventListener('click', () => {
    const input = toggleIcon.previousElementSibling;
    const tipo = input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", tipo);

    toggleIcon.classList.toggle("fa-eye");
    toggleIcon.classList.toggle("fa-eye-slash");
  });
});


//script para validar e formatar CPF/CNPJ
const cpfCnpjInput = document.getElementById("cpfcnpj_cadastro");
cpfCnpjInput.addEventListener("input", (e) => {
  let valor = e.target.value;

  // Remove tudo que não for número
  valor = valor.replace(/\D/g, "");

  // Limita a 14 dígitos
  if (valor.length > 14) valor = valor.slice(0, 14);

  // Formata CPF: 000.000.000-00
  if (valor.length <= 11) {
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // Formata CNPJ: 00.000.000/0000-00
  else {
    valor = valor.replace(/(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1/$2");
    valor = valor.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  e.target.value = valor;
});


// script de validação dos caracteres da senha
const senhaInput = document.getElementById("senha_cadastro");
const tooltip = document.getElementById("senha-tooltip");
const btnRegistrar = document.getElementById("btnRegistrar");

function validarSenha(senha) {
  const temLetra = /[A-Za-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);
  const tamanhoValido = senha.length >= 8;

  return temLetra && temNumero && temEspecial && tamanhoValido;
}

// script para bloquear o botão de registro se a senha for inválida
senhaInput.addEventListener("input", () => {
  const senha = senhaInput.value;
  const senhaValida = validarSenha(senha);

  if (senha.length === 0) {
    tooltip.style.display = "none";
    senhaInput.style.borderColor = "";
    btnRegistrar.disabled = false;
    btnRegistrar.removeAttribute("data-invalida");
    return;
  }

  if (senhaValida) {
    tooltip.style.display = "none";
    senhaInput.style.borderColor = "green";
    btnRegistrar.disabled = false;
    btnRegistrar.removeAttribute("data-invalida");
  } else {
    tooltip.style.display = "block";
    senhaInput.style.borderColor = "red";
    btnRegistrar.disabled = true;
    btnRegistrar.setAttribute("data-invalida", "true");
  }
});