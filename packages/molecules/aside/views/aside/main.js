// core
import '@papit/core';
import '@papit/translator';

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
