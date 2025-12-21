// tools

// component
import '@papit/translator';

window.onload = () => {
  window.localization.add(
    {
      id: "translation-demo",
      meta: {
        region: "GB",
        language: "en"
      },
      translations: {
        "Hello World": "Translated 2 Hello World",
        "Hello {name}": "Translated 2 Hello {name}",
        "bajs": "BAAAAAJS 2",
        "scope.bajs": "Hey im a scoped bajs [DEMO]",
        "{start} - {end} of {total}": "{start} - {end} AHA!!!! {total}",
        "Type here": "Type here then",
        "Your email address": "screw your email address"
      }
    }
  );

  const translationToggleMap = {
    "translation-demo": "en",
    "en": "translation-demo",
  }
  window['toggle-translation'].onclick = () => {
    window.localization.change(translationToggleMap[window.localization?.current.id] || 'translation-demo');
  }

  // let start = 4;
  // window.dec.onclick = () => {
  //   start--;
  //   window.paginationcase.setAttribute("start", start);
  // }
  // window.inc.onclick = () => {
  //   start++;
  //   window.paginationcase.setAttribute("start", start);
  // }
  console.log('[demo]: window loaded');
}
