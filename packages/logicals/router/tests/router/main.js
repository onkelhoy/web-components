import '@papit/router';

window.onload = () => {
  document.querySelectorAll("button").forEach(button => {
    button.onclick = () => {
      const router = document.querySelector("pap-router");
      router.url = button.getAttribute("data-url");
    }
  })
}