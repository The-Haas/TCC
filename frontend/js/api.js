// script para o cadastro de usuário
// Verifica se o formulário de cadastro existe antes de adicionar o listener
// Se não existir, não faz nada para evitar erros
document.addEventListener('DOMContentLoaded', () => {
  const formCadastro = document.getElementById('formCadastro');
  const btnRegistrar = document.getElementById('btnRegistrar');
  const mensagemCadastro = document.getElementById('mensagemCadastro');

  if (!formCadastro) return; // proteção caso o form não exista na página

  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      nome: document.getElementById('nome_cadastro').value.trim(),
      email: document.getElementById('email_cadastro').value.trim(),
      cpfcnpj: document.getElementById('cpfcnpj_cadastro').value.replace(/\D/g, ''), // <- Aqui remove tudo que não é número
      senha: document.getElementById('senha_cadastro').value,
    };

    const mensagemCadastro = document.getElementById('mensagemCadastro');
    try {
      const response = await fetch('http://localhost:3000/cadastroCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        mensagemCadastro.style.color = 'green';
        mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Você já pode fazer login.';
        formCadastro.reset();
        btnRegistrar.disabled = true;
      } else {
        const errorData = await response.json();
        mensagemCadastro.style.color = 'red';
        mensagemCadastro.textContent = errorData.erro || 'Erro no cadastro.';
      }
    } catch (err) {
      mensagemCadastro.style.color = 'red';
      mensagemCadastro.textContent = 'Erro na comunicação com o servidor.';
    }
  });
});

// Script para o login do cliente
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  const btnLogin = document.getElementById('btnLogin');
  const mensagemLogin = document.getElementById('mensagemLogin');

  if (!formLogin) return;

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      email: document.getElementById('email_login').value.trim(),
      senha: document.getElementById('senha_login').value,
    };

    try {
      const response = await fetch('http://localhost:3000/loginCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ← importante para enviar o cookie de sessão
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        mensagemLogin.style.color = 'green';
        mensagemLogin.textContent = 'Login realizado com sucesso!';

        // Redirecionamento conforme perfil
        setTimeout(() => {
          if (result.cliente.perfil === 'cliente') {
            window.location.href = 'painelcliente.html';
          } else if (result.cliente.perfil === 'operador') {
            window.location.href = 'painelcontrole.html';
          } else {
            window.location.href = 'index.html'; // fallback
          }
        }, 750);

        // Redirecionar ou mostrar conteúdo privado
        // window.location.href = '/painel'; ← exemplo de redirecionamento
      } else {
        const errorData = await response.json();
        mensagemLogin.style.color = 'red';
        mensagemLogin.textContent = errorData.erro || 'Falha ao realizar login.';
      }
    } catch (err) {
      mensagemLogin.style.color = 'red';
      mensagemLogin.textContent = 'Erro na comunicação com o servidor.';
    }
  });
});