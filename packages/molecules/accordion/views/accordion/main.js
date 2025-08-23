// core
import '@papit/core';
import '@papit/translator';
import "@papit/typography";
import "@papit/card";
import "@papit/codeblock";

// component
import '@papit/accordion';

window.onload = () => {
  console.log('[demo]: window loaded');

  window.openBTN.onclick = () => {
    console.log('open')
    window.target.open = true;
  }

  window.closeBTN.onclick = () => {
    console.log('close')
    window.target.open = false;
  }

  window.horizontalopenBTN.onclick = () => {
    console.log('open horizontal')
    window.horizontaltarget.open = true;
  }

  window.horizontalcloseBTN.onclick = () => {
    console.log('close horizontal')
    window.horizontaltarget.open = false;
  }
}
