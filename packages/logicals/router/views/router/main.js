// core
import '@papit/core';
import '@papit/translator';
import "@papit/typography";
import "@papit/card";
import "@papit/codeblock";

// component
import '@papit/router';

window.onload = () => {
  console.log('main loaded')

  const router = document.querySelector('pap-router');
  router.addRoute({
    url: "fallback",
    reroute: ["z", "x", "b"]
  });

  document.querySelectorAll("button[data-url]").forEach(button => {
    button.onclick = () => {
      router.url = button.getAttribute("data-url");
    }
  })
}
