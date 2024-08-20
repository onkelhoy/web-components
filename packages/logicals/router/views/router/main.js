// core
import '@papit/core';

// component
import '@papit/router';

window.onload = () => {
  console.log('main loaded')

  const router = document.querySelector('pap-router');
  document.querySelectorAll("button[data-url]").forEach(button => {
    button.onclick = () => {
      router.url = button.getAttribute("data-url");
    }
  })
}
