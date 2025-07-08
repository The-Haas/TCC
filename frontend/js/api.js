/*
* Index.js
*
* script para o cadastro de usuário
* Verifica se o formulário de cadastro existe antes de adicionar o listener
* Se não existir, não faz nada para evitar erros
*/
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
        exibirToast('Cadastro realizado com sucesso! Você já pode fazer login.', 'success');
        formCadastro.reset();
        btnRegistrar.disabled = true;
      } else {
        const errorData = await response.json();
        exibirToast('Erro no cadastro.', 'error');
      }
    } catch (err) {
      exibirToast('Erro na comunicação com o servidor.', 'error');
    }
  });
});

/*
* Index.js
*
* Script para o login login com JWT do cliente 
*/
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
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        exibirToast('Login realizado com sucesso!', 'success');
          console.log('Token JWT completo:', result.token); // mostra o token completo


        // Salva o token no localStorage
        localStorage.setItem('token', result.token);

        // Decodifica o payload do token (opcional)
        const payload = JSON.parse(atob(result.token.split('.')[1]));

        // Redireciona conforme perfil
        setTimeout(() => {
          if (payload.perfil === 'cliente') {
            window.location.href = 'painelcliente.html';
          } else if (payload.perfil === 'operador') {
            window.location.href = 'painelcontrole.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 750);
      } else {
        exibirToast(result.erro || 'Falha ao realizar login.', 'error');
      }
    } catch (err) {
      exibirToast('Erro na comunicação com o servidor.', 'error');
    }
  });
});


/*
* Index.js
*
* Script de logout do cliente com JWT (apenas remove o token do localStorage)
*/
document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btnLogout');

   if (!btnLogout) {
    //console.warn('Botão logout não encontrado!');
    return; // para evitar o erro
  }

  btnLogout.addEventListener('click', () => {
    // Remove o token do armazenamento local
    localStorage.removeItem('token');

    exibirToast('Logout realizado com sucesso!', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
});
