// core
import '@papit/core';
import '@papit/translator';
import "@papit/typography";
import "@papit/card";
import "@papit/codeblock";

// component
import '@papit/aside';

window.onload = () => {
  console.log('[demo]: window loaded');
  const asides = document.querySelectorAll('pap-aside');
  document.querySelector('#aside-show').onclick = () => {
    asides.forEach(aside => {
      aside.show();
    })
  }
}
