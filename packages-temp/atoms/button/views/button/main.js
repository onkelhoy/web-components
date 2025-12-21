// core
import '@papit/core';
import '@papit/translator';
import "@papit/typography";
import "@papit/card";
import "@papit/codeblock";

// component
import '@papit/icon';
import '@papit/button';

window.onload = () => {
  console.log('[demo]: window loaded');
  document.querySelectorAll("pap-button").forEach(btn => {
    btn.onclick = (e) => {
      console.log("click", {text: e.target.textContent, cardtype: e.target.parentElement.parentElement.getAttribute("data-type")});
    }
  });
}
