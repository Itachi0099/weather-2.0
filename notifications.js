function notify(msg, type='success') {
  const toast = document.getElementById(type + 'Toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}