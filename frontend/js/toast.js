/*
* Index.js
* Painel Cliente
* Painel Controle
* 
* script para exibir mensagens de toast
*/
function exibirToast(mensagem, tipo = 'success') {
  // Remove toast existente, se houver
  const toastExistente = document.querySelector('.toast');
  if (toastExistente) toastExistente.remove();

  // Cria o toast novo
  const toast = document.createElement('div');
  toast.classList.add('toast', tipo); // adiciona "toast" e "success" ou "error"
  toast.textContent = mensagem;

  document.body.appendChild(toast);

  // Força reflow para ativar animação CSS
  void toast.offsetWidth;
  toast.classList.add('show');

  // Remove o toast após 2 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 2000);
}